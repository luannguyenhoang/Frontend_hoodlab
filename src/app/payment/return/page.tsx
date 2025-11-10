"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { orderService, Order } from "../../../services/orderService";

export default function PaymentReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  const orderNumber = searchParams.get("orderNumber");
  const responseCode = searchParams.get("responseCode");
  const transactionNo = searchParams.get("transactionNo");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderNumber) {
        setLoading(false);
        return;
      }

      try {
        // Tìm đơn hàng theo orderNumber - lấy nhiều trang để tìm
        let foundOrder: Order | undefined;
        let page = 1;
        const pageSize = 50; // Lấy nhiều orders mỗi trang
        
        while (!foundOrder) {
          const ordersResponse = await orderService.getOrders(page, pageSize);
          foundOrder = ordersResponse.data.find((o) => o.orderNumber === orderNumber);
          
          // Nếu không tìm thấy và còn trang tiếp theo, tiếp tục tìm
          if (!foundOrder && ordersResponse.hasNextPage) {
            page++;
          } else {
            break;
          }
        }
        
        if (foundOrder) {
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderNumber]);

  const isSuccess = responseCode === "00";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {isSuccess ? (
            <>
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã mua hàng tại HoodLab. Đơn hàng của bạn đã được xử lý thành công.
              </p>
              {order && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                    </div>
                    {transactionNo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã giao dịch:</span>
                        <span className="font-medium text-gray-900">{transactionNo}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium text-indigo-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Xem đơn hàng
                </Link>
                <Link
                  href="/products"
                  className="block w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 mb-6">
                Rất tiếc, giao dịch thanh toán của bạn không thành công. Vui lòng thử lại.
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/cart"
                  className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Quay lại giỏ hàng
                </Link>
                <Link
                  href="/products"
                  className="block w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

