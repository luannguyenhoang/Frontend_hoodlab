"use client";

import Link from "next/link";
import { encodeId } from "../../utils/idEncoder";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../redux/store";
import { getCartRequest } from "../../redux/actions/cartActions";
import {
  updateCartRequest,
  removeFromCartRequest,
} from "../../redux/actions/cartActions";

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, loading, updatingItems, error } = useSelector(
    (state: RootState) => state.cart
  );
  const { token } = useSelector((state: RootState) => state.auth);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (token) {
      dispatch(getCartRequest() as any);
    }
  }, [dispatch, token]);

  // Remove selected items that no longer exist in cart
  useEffect(() => {
    if (items.length > 0) {
      setSelectedItems((prev) => {
        const newSet = new Set<number>();
        prev.forEach((id) => {
          if (items.some((item) => item.id === id)) {
            newSet.add(id);
          }
        });
        return newSet;
      });
    } else {
      // Clear selection if cart is empty
      setSelectedItems(new Set());
    }
  }, [items]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }
    // Find the item to check stock
    const item = items.find((i) => i.id === id);
    if (item && newQuantity > item.stock) {
      toast.error(`Số lượng vượt quá tồn kho. Tồn kho hiện có: ${item.stock}`);
      return;
    }
    dispatch(updateCartRequest(id, { quantity: newQuantity }) as any);
  };

  const handleRemove = (id: number) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")
    ) {
      dispatch(removeFromCartRequest(id) as any);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const calculateTotal = () => {
    return items
      .filter((item) => selectedItems.has(item.id))
      .reduce((total, item) => total + (item.salePrice || item.price) * item.quantity, 0);
  };

  const selectedItemsCount = items.filter((item) =>
    selectedItems.has(item.id)
  ).length;

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Vui lòng đăng nhập để xem giỏ hàng
            </p>
            <Link
              href="/login"
              className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải giỏ hàng...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-8">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Cart Content */}
        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  Giỏ hàng của bạn đang trống
                </p>
                <Link
                  href="/products"
                  className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Select All Checkbox */}
                  <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.size === items.length && items.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                      Chọn tất cả ({selectedItemsCount}/{items.length})
                    </label>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-4"
                    >
                      {/* Checkbox */}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer mt-1"
                        />
                      </div>

                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${encodeId(item.productId)}`}
                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                          >
                            {item.productName}
                          </Link>
                          <div className="mt-1 text-sm text-gray-600">
                            <span>Màu: {item.colorName}</span>
                            {item.sizeName && (
                              <span className="ml-2">
                                Size: {item.sizeName}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {item.salePrice ? (
                              <>
                                <span className="text-lg font-bold text-indigo-600">
                                  {formatPrice(item.salePrice)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-indigo-600">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border-2 border-gray-300 rounded-md">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={
                                item.quantity <= 1 || updatingItems.has(item.id)
                              }
                              className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed relative min-w-[2.5rem]"
                            >
                              {updatingItems.has(item.id) ? (
                                <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                "−"
                              )}
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value);
                                if (
                                  !isNaN(newQuantity) &&
                                  newQuantity >= 1 &&
                                  newQuantity <= item.stock
                                ) {
                                  handleQuantityChange(item.id, newQuantity);
                                }
                              }}
                              disabled={updatingItems.has(item.id)}
                              className="w-16 px-2 py-2 text-center border-x-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              disabled={
                                item.quantity >= item.stock ||
                                updatingItems.has(item.id)
                              }
                              className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed relative min-w-[2.5rem]"
                            >
                              {updatingItems.has(item.id) ? (
                                <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                "+"
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Xóa
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Tồn kho: {item.stock} sản phẩm
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice((item.salePrice || item.price) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Tóm tắt đơn hàng
                    </h2>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tạm tính ({selectedItemsCount} sản phẩm)</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Phí vận chuyển</span>
                        <span>Miễn phí</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Tổng cộng</span>
                        <span className="text-indigo-600">
                          {formatPrice(calculateTotal())}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/checkout"
                      className={`block w-full px-6 py-3 rounded-md font-medium text-white text-center transition-colors ${
                        selectedItemsCount > 0
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-300 cursor-not-allowed pointer-events-none"
                      }`}
                    >
                      {selectedItemsCount > 0
                        ? `Thanh toán (${selectedItemsCount} sản phẩm)`
                        : "Vui lòng chọn sản phẩm"}
                    </Link>
                    <Link
                      href="/products"
                      className="block mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
