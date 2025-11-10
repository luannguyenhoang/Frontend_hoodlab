"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { getOrderRequest } from "../../../redux/actions/orderActions";
import { RootState } from "../../../redux/store";
import { paymentService } from "../../../services/paymentService";
import { reviewService, Review, CreateReviewRequest } from "../../../services/reviewService";
import { imageService } from "../../../services/imageService";
import { toast } from "react-toastify";
import Link from "next/link";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FiX, FiImage } from "react-icons/fi";
import { OrderItem } from "../../../redux/types/orderTypes";
import { decodeOrderId } from "../../../utils/idEncoder";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector(
    (state: RootState) => state.orders
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderReviews, setOrderReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Decode order ID from URL parameter
  const orderId = useMemo(() => {
    const encodedId = params.id as string;
    const decoded = decodeOrderId(encodedId);
    if (!decoded) {
      // Fallback: try to parse as number (for backward compatibility)
      const parsed = parseInt(encodedId, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return decoded;
  }, [params.id]);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderRequest(orderId) as any);
    } else {
      // Invalid order ID, redirect to orders page
      router.push("/orders");
    }
  }, [dispatch, orderId, router]);

  useEffect(() => {
    if (currentOrder && currentOrder.orderStatus === "Completed") {
      loadOrderReviews();
    }
  }, [currentOrder]);

  const loadOrderReviews = async () => {
    if (!currentOrder) return;
    try {
      const reviews = await reviewService.getOrderReviews(currentOrder.id);
      setOrderReviews(reviews);
    } catch (error: any) {
      console.error("Error loading reviews:", error);
    }
  };

  const hasReviewed = (orderItemId: number) => {
    return orderReviews.some(r => r.orderItemId === orderItemId);
  };

  const handleOpenReviewModal = (item: OrderItem) => {
    setSelectedItem(item);
    setReviewRating(0);
    setReviewComment("");
    setReviewImages([]);
    setReviewImagePreviews([]);
    setShowReviewModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images max
    const remainingSlots = 5 - reviewImages.length;
    if (files.length > remainingSlots) {
      toast.warning(`Chỉ có thể thêm tối đa 5 ảnh. Bạn đã chọn ${files.length} ảnh nhưng chỉ còn ${remainingSlots} chỗ trống.`);
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} không phải là ảnh hợp lệ`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn (tối đa 5MB)`);
        return false;
      }
      return true;
    });

    setReviewImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReviewImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setReviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!currentOrder || !selectedItem || submittingReview) return;

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5");
      return;
    }

    if (reviewRating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    setSubmittingReview(true);
    setUploadingImages(true);
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (reviewImages.length > 0) {
        try {
          imageUrls = await imageService.uploadImages(reviewImages);
        } catch (uploadError: any) {
          toast.error(uploadError.message || "Lỗi khi upload ảnh");
          setSubmittingReview(false);
          setUploadingImages(false);
          return;
        }
      }

      const request: CreateReviewRequest = {
        orderId: currentOrder.id,
        orderItemId: selectedItem.id,
        productId: selectedItem.productId,
        rating: reviewRating,
        comment: reviewComment || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await reviewService.createReview(request);
      toast.success("Đánh giá sản phẩm thành công!");
      setShowReviewModal(false);
      await loadOrderReviews();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Lỗi khi đánh giá sản phẩm";
      toast.error(errorMessage);
    } finally {
      setSubmittingReview(false);
      setUploadingImages(false);
    }
  };

  const canRetryPayment = (order: typeof currentOrder) => {
    if (!order) return false;
    return (
      (order.paymentStatus === "Pending" || order.paymentStatus === "Failed") &&
      order.orderStatus !== "Cancelled" &&
      order.orderStatus !== "Completed"
    );
  };

  const handleRetryPayment = async () => {
    if (!currentOrder || processingPayment) return;

    setProcessingPayment(true);
    try {
      const paymentResponse = await paymentService.createVNPayPayment({
        orderId: currentOrder.id,
        paymentMethod: currentOrder.paymentMethod || "VNPAY",
      });

      window.location.href = paymentResponse.paymentUrl;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Lỗi khi tạo thanh toán";
      toast.error(errorMessage);
      setProcessingPayment(false);
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
    const baseClasses = "px-4 py-2 rounded-full text-sm font-semibold";
    
    if (type === "order") {
      switch (status) {
        case "Pending":
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "Confirmed":
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case "Shipped":
          return `${baseClasses} bg-purple-100 text-purple-800`;
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

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Chờ xử lý",
      Confirmed: "Đã xác nhận",
      Shipped: "Đang giao hàng",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
      Paid: "Đã thanh toán",
      Failed: "Thanh toán thất bại",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-red-600 mb-4">{error || "Không tìm thấy đơn hàng"}</p>
            <Link
              href="/orders"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chi tiết đơn hàng
          </h1>
          <p className="text-gray-600">
            Đơn hàng: {currentOrder.orderNumber}
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Order Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentOrder.orderNumber}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(currentOrder.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <span className={getStatusBadge(currentOrder.orderStatus, "order")}>
                  {getStatusText(currentOrder.orderStatus)}
                </span>
                <span className={getStatusBadge(currentOrder.paymentStatus, "payment")}>
                  {getStatusText(currentOrder.paymentStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sản phẩm ({currentOrder.items.length})
            </h3>
            <div className="space-y-4">
              {currentOrder.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">
                      {item.productName}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                        Màu: {item.colorName}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                        Size: {item.sizeName}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                        Số lượng: {item.quantity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Đơn giá: {formatPrice(item.price)}
                    </p>
                    {currentOrder.orderStatus === "Completed" && user?.id === currentOrder.userId && (
                      <div className="mt-3">
                        {hasReviewed(item.id) ? (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Đã đánh giá
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenReviewModal(item)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Bình luận
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    <p className="font-bold text-gray-900 text-xl">
                      {formatPrice(item.subTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Information */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin đơn hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Thông tin giao hàng</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {currentOrder.shippingAddress && (
                    <p>
                      <span className="font-medium">Địa chỉ:</span> {currentOrder.shippingAddress}
                    </p>
                  )}
                  {currentOrder.phone && (
                    <p>
                      <span className="font-medium">Số điện thoại:</span> {currentOrder.phone}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Thông tin thanh toán</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {currentOrder.paymentMethod && (
                    <p>
                      <span className="font-medium">Phương thức:</span> {currentOrder.paymentMethod}
                    </p>
                  )}
                  {currentOrder.notes && (
                    <p>
                      <span className="font-medium">Ghi chú:</span> {currentOrder.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-white border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                <p className="text-4xl font-bold text-indigo-600">
                  {formatPrice(currentOrder.totalAmount)}
                </p>
              </div>
              <div className="flex gap-3">
                {canRetryPayment(currentOrder) && (
                  <button
                    onClick={handleRetryPayment}
                    disabled={processingPayment}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                  >
                    {processingPayment ? "Đang xử lý..." : "Thanh toán lại"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Đánh giá sản phẩm</h3>
            <p className="text-gray-600 mb-2">{selectedItem.productName}</p>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá (sao) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    {star <= reviewRating ? (
                      <AiFillStar className="w-10 h-10 text-yellow-400" />
                    ) : (
                      <AiOutlineStar className="w-10 h-10 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
              {reviewRating === 0 && (
                <p className="text-sm text-red-500 mt-1">Vui lòng chọn số sao đánh giá</p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bình luận (tùy chọn)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm ảnh (tùy chọn, tối đa 5 ảnh)
              </label>
              <div className="space-y-3">
                {/* Image Previews */}
                {reviewImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {reviewImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {reviewImages.length < 5 && (
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <FiImage className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Chọn ảnh từ máy tính
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={uploadingImages || submittingReview}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || uploadingImages}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {uploadingImages ? "Đang upload ảnh..." : submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

