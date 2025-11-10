"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { userService, UpdateProfileRequest, ChangePasswordRequest } from "../../services/userService";
import { User } from "../../services/authService";
import { loginSuccess, logout } from "../../redux/actions/authActions";
import { toast } from "react-toastify";
import { FaUser, FaPhone, FaMapMarkerAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token, user: authUser } = useSelector((state: RootState) => state.auth);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show/hide password
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      // Check localStorage as fallback
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!storedToken) {
        router.push("/login");
        return;
      }
    }
    // Only load profile on mount, not when token changes
    if (!user) {
      loadProfile();
    }
  }, []); // Empty dependency array - only run on mount

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Check token before making request
      const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (!currentToken) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          dispatch(logout() as any);
          router.push("/login");
        }, 1500);
        return;
      }
      
      const data = await userService.getProfile();
      setUser(data);
      setProfileData({
        fullName: data.fullName || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      if (error.response?.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // Chỉ redirect sau 2 giây để người dùng thấy thông báo
        setTimeout(() => {
          dispatch(logout() as any);
          router.push("/login");
        }, 2000);
      } else {
        toast.error("Lỗi khi tải thông tin cá nhân");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data: UpdateProfileRequest = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
      };
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
      
      // Update Redux store - loginSuccess takes (token, user) as separate parameters
      const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (currentToken) {
        dispatch(loginSuccess(currentToken, updatedUser) as any);
      }
      
      // Update local state with new user data
      setProfileData({
        fullName: updatedUser.fullName || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
      });
      
      toast.success("Cập nhật thông tin thành công");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        // Token hết hạn, nhưng không logout ngay, chỉ hiển thị lỗi
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // Chỉ redirect sau 2 giây để người dùng thấy thông báo
        setTimeout(() => {
          dispatch(logout() as any);
          router.push("/login");
        }, 2000);
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi cập nhật thông tin");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setChangingPassword(true);
      const data: ChangePasswordRequest = {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };
      await userService.changePassword(data);
      
      // Clear password form
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      
      // Logout after password change
      setTimeout(() => {
        dispatch(logout() as any);
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          dispatch(logout() as any);
          router.push("/login");
        }, 1500);
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUser className="w-5 h-5 mr-2 text-indigo-600" />
              Thông tin cá nhân
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    required
                    className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaLock className="w-5 h-5 mr-2 text-indigo-600" />
              Đổi mật khẩu
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    required
                    className="w-full rounded-md border border-gray-300 pl-10 pr-10 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full rounded-md border border-gray-300 pl-10 pr-10 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full rounded-md border border-gray-300 pl-10 pr-10 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

