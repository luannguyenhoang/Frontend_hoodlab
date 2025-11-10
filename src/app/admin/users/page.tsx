"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { userService, UpdateUserRequest } from "../../../services/userService";
import { User } from "../../../services/authService";
import { toast } from "react-toastify";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    fullName: "",
    phone: "",
    address: "",
    role: "Customer",
    isActive: true,
  });

  useEffect(() => {
    if (!token || user?.role !== "Admin") {
      router.push("/");
      return;
    }
    loadUsers();
  }, [token, user, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      fullName: "",
      phone: "",
      address: "",
      role: "Customer",
      isActive: true,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await userService.updateUser(editingUser.id, editForm);
      toast.success("Cập nhật người dùng thành công!");
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật người dùng");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      toast.success("Xóa người dùng thành công!");
      loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Lỗi khi xóa người dùng");
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (role) {
      case "Admin":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "Staff":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Customer":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "Admin":
        return "Quản trị viên";
      case "Staff":
        return "Nhân viên";
      case "Customer":
        return "Khách hàng";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải danh sách người dùng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại trang quản trị
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    {editingUser?.id === u.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="Customer">Khách hàng</option>
                            <option value="Staff">Nhân viên</option>
                            <option value="Admin">Quản trị viên</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={editForm.isActive ? "true" : "false"}
                            onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="true">Hoạt động</option>
                            <option value="false">Vô hiệu hóa</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleSave}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                              Hủy
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getRoleBadge(u.role)}>{getRoleText(u.role)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(u)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Sửa
                            </button>
                            {user?.role === "Admin" && (
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Chưa có người dùng nào trong hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}

