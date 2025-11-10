"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  adminService,
  Size,
  CreateSizeRequest,
  UpdateSizeRequest,
} from "../../../services/adminService";
import { toast } from "react-toastify";
import Link from "next/link";

export default function AdminSizesPage() {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [formData, setFormData] = useState<CreateSizeRequest>({
    name: "",
    isActive: true,
  });

  useEffect(() => {
    if (!token || user?.role !== "Admin") {
      router.push("/");
      return;
    }
    loadSizes();
  }, [token, user, router]);

  const loadSizes = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSizes();
      setSizes(data);
    } catch (error: any) {
      console.error("Error loading sizes:", error);
      toast.error("Lỗi khi tải danh sách size");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: "", isActive: true });
    setEditingSize(null);
    setShowAddModal(true);
  };

  const handleEdit = (size: Size) => {
    setFormData({
      name: size.name,
      isActive: size.isActive,
    });
    setEditingSize(size);
    setShowAddModal(true);
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditingSize(null);
    setFormData({ name: "", isActive: true });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên size");
      return;
    }

    try {
      if (editingSize) {
        await adminService.updateSize(editingSize.id, formData as UpdateSizeRequest);
        toast.success("Cập nhật size thành công!");
      } else {
        await adminService.createSize(formData);
        toast.success("Thêm size thành công!");
      }
      setShowAddModal(false);
      setEditingSize(null);
      loadSizes();
    } catch (error: any) {
      console.error("Error saving size:", error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu size");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa size này?")) {
      return;
    }

    try {
      await adminService.deleteSize(id);
      toast.success("Xóa size thành công!");
      loadSizes();
    } catch (error: any) {
      console.error("Error deleting size:", error);
      toast.error(error.response?.data?.message || "Lỗi khi xóa size");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải danh sách size...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại trang quản trị
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý size</h1>
            <p className="text-gray-600">Quản lý tất cả size sản phẩm</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + Thêm size
          </button>
        </div>

        {/* Sizes Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
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
                {sizes.map((size) => (
                  <tr key={size.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{size.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {size.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          size.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {size.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(size)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(size.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sizes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Chưa có size nào.</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingSize ? "Sửa size" : "Thêm size"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập tên size (ví dụ: S, M, L, XL)"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Hoạt động</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

