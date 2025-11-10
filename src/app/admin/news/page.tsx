"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import {
  newsService,
  News,
  CreateNewsRequest,
  UpdateNewsRequest,
} from "../../../services/newsService";
import { imageService } from "../../../services/imageService";

export default function AdminNewsPage() {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<CreateNewsRequest>({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    category: "",
    publishedAt: new Date().toISOString().split("T")[0],
    isActive: true,
  });

  useEffect(() => {
    if (!token || user?.role !== "Admin") {
      router.push("/");
      return;
    }
    loadNews();
  }, [token, user, router]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getNews();
      setNews(data);
    } catch (error: any) {
      console.error("Error loading news:", error);
      toast.error("Lỗi khi tải danh sách tin tức");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      category: "",
      publishedAt: new Date().toISOString().split("T")[0],
      isActive: true,
    });
    setEditingNews(null);
    setShowAddModal(true);
  };

  const handleEdit = (newsItem: News) => {
    setFormData({
      title: newsItem.title,
      excerpt: newsItem.excerpt,
      content: newsItem.content || "",
      imageUrl: newsItem.imageUrl || "",
      category: newsItem.category || "",
      publishedAt: newsItem.publishedAt.split("T")[0],
      isActive: newsItem.isActive,
    });
    setEditingNews(newsItem);
    setShowAddModal(true);
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditingNews(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      category: "",
      publishedAt: new Date().toISOString().split("T")[0],
      isActive: true,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const urls = await imageService.uploadImages([file]);
      if (urls.length > 0) {
        setFormData({ ...formData, imageUrl: urls[0] });
        toast.success("Upload ảnh thành công!");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Lỗi khi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error("Vui lòng nhập mô tả ngắn");
      return;
    }

    try {
      if (editingNews) {
        await newsService.updateNews(editingNews.id, formData as UpdateNewsRequest);
        toast.success("Cập nhật tin tức thành công!");
      } else {
        await newsService.createNews(formData);
        toast.success("Thêm tin tức thành công!");
      }
      setShowAddModal(false);
      setEditingNews(null);
      loadNews();
    } catch (error: any) {
      console.error("Error saving news:", error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu tin tức");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin tức này?")) {
      return;
    }

    try {
      await newsService.deleteNews(id);
      toast.success("Xóa tin tức thành công!");
      loadNews();
    } catch (error: any) {
      console.error("Error deleting news:", error);
      toast.error(error.response?.data?.message || "Lỗi khi xóa tin tức");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải danh sách tin tức...</p>
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
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Quay lại trang quản trị
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Tin tức</h1>
            <p className="text-gray-600">Quản lý tất cả tin tức trên trang chủ</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + Thêm tin tức
          </button>
        </div>

        {/* News Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đăng
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
                {news.map((newsItem) => (
                  <tr key={newsItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {newsItem.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                      {newsItem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {newsItem.imageUrl ? (
                        <img
                          src={newsItem.imageUrl}
                          alt={newsItem.title}
                          className="w-20 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {newsItem.category || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(newsItem.publishedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          newsItem.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {newsItem.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(newsItem)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(newsItem.id)}
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

        {news.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Chưa có tin tức nào.</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingNews ? "Sửa tin tức" : "Thêm tin tức"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập tiêu đề"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả ngắn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập mô tả ngắn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập nội dung chi tiết"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh
                  </label>
                  {formData.imageUrl && (
                    <div className="mb-2">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                    </div>
                  )}
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors text-center">
                      {uploading ? (
                        <span className="text-gray-500">Đang upload...</span>
                      ) : (
                        <span className="text-indigo-600 font-medium">
                          {formData.imageUrl ? "Thay đổi ảnh" : "Chọn ảnh từ máy tính"}
                        </span>
                      )}
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập danh mục"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày đăng
                    </label>
                    <input
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
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
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

