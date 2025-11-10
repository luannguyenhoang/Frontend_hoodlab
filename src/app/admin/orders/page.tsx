"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { orderService, Order, PaginatedOrdersResponse } from "../../../services/orderService";
import Link from "next/link";
import { encodeOrderId } from "../../../utils/idEncoder";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!token || (user?.role !== "Admin" && user?.role !== "Staff")) {
      router.push("/");
      return;
    }
    loadOrders();
  }, [token, user, router, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedOrdersResponse = await orderService.getOrders(page, pageSize);
      setOrders(response.data);
      setPagination({
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || "Lỗi khi tải danh sách đơn hàng");
      toast.error("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn đổi trạng thái đơn hàng thành "${getStatusLabel(newStatus)}"?`)) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      // Update order in state without reloading
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      toast.success("Đã cập nhật trạng thái đơn hàng thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Lỗi khi cập nhật trạng thái đơn hàng");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Chờ xử lý",
      Confirmed: "Đã xác nhận",
      Processing: "Đang xử lý",
      Shipped: "Đang giao hàng",
      Delivered: "Đã giao hàng",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      Pending: "bg-yellow-100 text-yellow-800",
      Confirmed: "bg-blue-100 text-blue-800",
      Processing: "bg-purple-100 text-purple-800",
      Shipped: "bg-indigo-100 text-indigo-800",
      Delivered: "bg-green-100 text-green-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Chờ thanh toán",
      Paid: "Đã thanh toán",
      Failed: "Thanh toán thất bại",
      Cancelled: "Hủy giao dich",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const orderStatuses = [
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Confirmed", label: "Đã xác nhận" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "Shipped", label: "Đang giao hàng" },
    { value: "Delivered", label: "Đã giao hàng" },
    { value: "Completed", label: "Hoàn thành" },
    { value: "Cancelled", label: "Đã hủy" },
  ];

  if (!token || (user?.role !== "Admin" && user?.role !== "Staff")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
              <p className="text-gray-600">Xem và quản lý tất cả đơn hàng</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay lại
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải danh sách đơn hàng...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-8">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Không có đơn hàng nào.</p>
              </div>
            ) : (
              <>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mã đơn
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Khách hàng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tổng tiền
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái thanh toán
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái đơn hàng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày tạo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.userName || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">{order.phone || "N/A"}</div>
                              <div className="text-xs text-gray-400 mt-1">{order.shippingAddress || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatPrice(order.totalAmount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                                  order.paymentStatus
                                )}`}
                              >
                                {getPaymentStatusLabel(order.paymentStatus)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.orderStatus}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                disabled={updatingOrderId === order.id}
                                className={`text-xs font-semibold rounded-md px-2 py-1 border-0 focus:ring-2 focus:ring-indigo-500 ${
                                  updatingOrderId === order.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                                } ${getStatusColor(order.orderStatus)}`}
                              >
                                {orderStatuses.map((status) => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/orders/${encodeOrderId(order.id)}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Xem chi tiết
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, pagination.totalCount)} trong tổng số{" "}
                      {pagination.totalCount} đơn hàng
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          pagination.hasPreviousPage
                            ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Trước
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            if (pagination.totalPages <= 7) return true;
                            if (p === 1 || p === pagination.totalPages) return true;
                            if (Math.abs(p - page) <= 1) return true;
                            return false;
                          })
                          .map((p, index, array) => {
                            if (index > 0 && array[index - 1] !== p - 1) {
                              return (
                                <span key={`ellipsis-${p}`} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return (
                              <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                  page === p
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {p}
                              </button>
                            );
                          })}
                      </div>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          pagination.hasNextPage
                            ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

