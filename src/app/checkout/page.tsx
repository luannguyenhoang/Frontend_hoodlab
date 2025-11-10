"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../redux/store";
import { orderService, CreateOrderRequest } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";
import { cartService } from "../../services/cartService";

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState(items);

  const [formData, setFormData] = useState({
    shippingAddress: user?.address || "",
    phone: user?.phone || "",
    notes: "",
    paymentMethod: "VNPAY",
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    // Load cart items
    const loadCart = async () => {
      try {
        const cart = await cartService.getCart();
        setCartItems(cart);
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };
    loadCart();
  }, [token, router, items]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.salePrice || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tạo đơn hàng
      const orderRequest: CreateOrderRequest = {
        items: cartItems.map((item) => ({
          productVariantId: item.productVariantId,
          sizeId: item.sizeId,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
        shippingAddress: formData.shippingAddress,
        phone: formData.phone,
        notes: formData.notes,
      };

      const order = await orderService.createOrder(orderRequest);

      // Tạo thanh toán VNPAY
      if (formData.paymentMethod === "VNPAY") {
        const paymentResponse = await paymentService.createVNPayPayment({
          orderId: order.id,
        });

        // Redirect đến VNPAY
        window.location.href = paymentResponse.paymentUrl;
      } else if (formData.paymentMethod === "Ship") {
        // Thanh toán khi nhận hàng
        await paymentService.createShipPayment({
          orderId: order.id,
        });
        toast.success("Đơn hàng đã được tạo thành công!");
        router.push("/orders");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Lỗi khi tạo đơn hàng";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (!token || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form thông tin */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin giao hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ giao hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingAddress: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={formData.paymentMethod === "VNPAY"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Thanh toán VNPAY</div>
                    <div className="text-sm text-gray-500">
                      Thanh toán trực tuyến qua VNPAY
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Ship"
                    checked={formData.paymentMethod === "Ship"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Thanh toán khi nhận hàng</div>
                    <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.productName} ({item.colorName}, {item.sizeName}) x {item.quantity}
                    </span>
                    <span className="text-gray-900">
                      {formatPrice((item.salePrice || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-indigo-600">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 rounded-md font-medium text-white transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

