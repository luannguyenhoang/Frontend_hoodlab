"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrdersRequest } from "../../redux/actions/orderActions";
import { RootState } from "../../redux/store";
import { Order } from "../../redux/types/orderTypes";
import { paymentService } from "../../services/paymentService";
import { toast } from "react-toastify";
import Link from "next/link";
import { encodeOrderId } from "../../utils/idEncoder";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading, error, pagination } = useSelector(
    (state: RootState) => state.orders
  );
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(getOrdersRequest(currentPage, pageSize) as any);
  }, [dispatch, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canRetryPayment = (order: Order) => {
    // Có thể thanh toán lại nếu:
    // - PaymentStatus là "Pending" hoặc "Failed"
    // - OrderStatus không phải "Cancelled" hoặc "Completed"
    return (
      (order.paymentStatus === "Pending" || order.paymentStatus === "Failed") &&
      order.orderStatus !== "Cancelled" &&
      order.orderStatus !== "Completed"
    );
  };

  const handleRetryPayment = async (order: Order) => {
    if (processingPayment === order.id) return;

    setProcessingPayment(order.id);
    try {
      // Tạo thanh toán VNPAY
      const paymentResponse = await paymentService.createVNPayPayment({
        orderId: order.id,
        paymentMethod: order.paymentMethod || "VNPAY",
      });

      // Redirect đến VNPAY
      window.location.href = paymentResponse.paymentUrl;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Lỗi khi tạo thanh toán";
      toast.error(errorMessage);
      setProcessingPayment(null);
    }
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

  const getStatusBadge = (status: string, type: "order" | "payment") => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    if (type === "order") {
      switch (status) {
        case "Pending":
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "Confirmed":
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case "Processing":
          return `${baseClasses} bg-purple-100 text-purple-800`;
        case "Shipped":
          return `${baseClasses} bg-indigo-100 text-indigo-800`;
        case "Delivered":
          return `${baseClasses} bg-green-100 text-green-800`;
        case "Completed":
          return `${baseClasses} bg-green-100 text-green-800`;
        case "Cancelled":
          return `${baseClasses} bg-red-100 text-red-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case "Pending":
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "Paid":
          return `${baseClasses} bg-green-100 text-green-800`;
        case "Failed":
          return `${baseClasses} bg-red-100 text-red-800`;
        case "Cancelled":
          return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  };

  const getStatusText = (status: string, type: "order" | "payment") => {
    if (type === "order") {
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
    } else {
      const statusMap: { [key: string]: string } = {
        Pending: "Chưa thanh toán",
        Paid: "Đã thanh toán",
        Failed: "Thanh toán thất bại",
        Cancelled: "Đã hủy",
      };
      return statusMap[status] || status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lịch sử mua hàng
          </h1>
          <p className="text-gray-600">
            Xem lại tất cả các đơn hàng của bạn
          </p>
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

        {/* Orders List */}
        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào.</p>
                <Link
                  href="/products"
                  className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6">
                  {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
                  >
                    {/* Order Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {order.orderNumber}
                            </h3>
                            <div className="flex gap-2">
                              <span className={getStatusBadge(order.orderStatus, "order")}>
                                {getStatusText(order.orderStatus, "order")}
                              </span>
                              <span className={getStatusBadge(order.paymentStatus, "payment")}>
                                {getStatusText(order.paymentStatus, "payment")}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="px-6 py-5">
                      <div className="space-y-4">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {item.productName}
                              </h4>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                <span className="px-2 py-1 bg-gray-100 rounded">Màu: {item.colorName}</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">Size: {item.sizeName}</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">SL: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-gray-900 text-lg">
                                {formatPrice(item.subTotal)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatPrice(item.price)} x {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            + {order.items.length - 2} sản phẩm khác
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="text-sm text-gray-600">
                            <p className="font-medium text-gray-900 mb-1">Tổng tiền:</p>
                            <p className="text-3xl font-bold text-indigo-600">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link
                            href={`/orders/${encodeOrderId(order.id)}`}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center shadow-md hover:shadow-lg"
                          >
                            Xem chi tiết
                          </Link>
                          {canRetryPayment(order) && (
                            <button
                              onClick={() => handleRetryPayment(order)}
                              disabled={processingPayment === order.id}
                              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                            >
                              {processingPayment === order.id ? "Đang xử lý..." : "Thanh toán lại"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-md px-6 py-4">
                    <div className="text-sm text-gray-600">
                      Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, pagination.totalCount)} trong tổng số {pagination.totalCount} đơn hàng
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPreviousPage || loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage || loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

