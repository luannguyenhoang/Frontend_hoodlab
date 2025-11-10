"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCartRequest } from "../../../redux/actions/cartActions";
import { getProductRequest } from "../../../redux/actions/productActions";
import { RootState } from "../../../redux/store";
import { Review, reviewService } from "../../../services/reviewService";
import { decodeId } from "../../../utils/idEncoder";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentProduct, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { loading: cartLoading } = useSelector(
    (state: RootState) => state.cart
  );
  
  // Decode product ID from URL parameter
  const productId = useMemo(() => {
    const encodedId = params.id as string;
    const decoded = decodeId(encodedId);
    if (!decoded) {
      // Fallback: try to parse as number (for backward compatibility)
      const parsed = parseInt(encodedId, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return decoded;
  }, [params.id]);

  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (productId) {
      dispatch(getProductRequest(productId) as any);
      loadReviews();
    } else {
      // Invalid product ID, redirect to products page
      router.push("/products");
    }
  }, [dispatch, productId, router]);

  const loadReviews = async () => {
    if (!productId) return;
    try {
      setLoadingReviews(true);
      const productReviews = await reviewService.getProductReviews(productId);
      setReviews(productReviews);
    } catch (error: any) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // Reset selections when product changes
  useEffect(() => {
    if (currentProduct) {
      setSelectedColorId(null);
      setSelectedSizeId(null);
      setQuantity(1);
      setMainImage(currentProduct.imageUrl || null);
    }
  }, [currentProduct]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get available colors with image
  const availableColors = useMemo(() => {
    if (!currentProduct?.variants) return [];
    const colorMap = new Map();
    currentProduct.variants.forEach((variant) => {
      if (!colorMap.has(variant.colorId)) {
        // Get first variant image for this color, or use product image
        const variantImage =
          variant.imageUrl || currentProduct.imageUrl || null;
        colorMap.set(variant.colorId, {
          colorId: variant.colorId,
          colorName: variant.colorName,
          colorHexCode: variant.colorHexCode || "#000000", // Default to black if missing
          imageUrl: variantImage,
        });
      }
    });
    const colors = Array.from(colorMap.values());
    console.log("Available Colors:", colors);
    return colors;
  }, [currentProduct]);

  // Get available sizes for selected color
  const availableSizes = useMemo(() => {
    if (!currentProduct?.variants || !selectedColorId) return [];
    const sizeMap = new Map();
    currentProduct.variants
      .filter((v) => v.colorId === selectedColorId)
      .forEach((variant) => {
        // Lấy sizes từ sizeIds của variant
        variant.sizeIds?.forEach((sizeInfo) => {
          if (!sizeMap.has(sizeInfo.idSize)) {
            sizeMap.set(sizeInfo.idSize, {
              sizeId: sizeInfo.idSize,
              sizeName: sizeInfo.nameSize,
              stock: sizeInfo.stock,
            });
          }
        });
      });
    return Array.from(sizeMap.values());
  }, [currentProduct, selectedColorId]);

  // Calculate available stock
  const availableStock = useMemo(() => {
    if (!currentProduct?.variants) return 0;

    if (selectedColorId && selectedSizeId) {
      // Specific variant: color + size
      const variant = currentProduct.variants.find(
        (v) => v.colorId === selectedColorId
      );
      if (variant) {
        const sizeInfo = variant.sizeIds?.find(
          (s) => s.idSize === selectedSizeId
        );
        return sizeInfo?.stock || 0;
      }
      return 0;
    } else if (selectedColorId) {
      // Total stock for selected color
      const variant = currentProduct.variants.find(
        (v) => v.colorId === selectedColorId
      );
      return variant?.stock || 0;
    } else {
      // Total stock for all variants
      return currentProduct.variants.reduce((sum, v) => sum + v.stock, 0);
    }
  }, [currentProduct, selectedColorId, selectedSizeId]);

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!currentProduct?.variants || !selectedColorId || !selectedSizeId)
      return null;
    const variant = currentProduct.variants.find(
      (v) => v.colorId === selectedColorId
    );
    if (variant && variant.sizeIds?.some((s) => s.idSize === selectedSizeId)) {
      return variant;
    }
    return null;
  }, [currentProduct, selectedColorId, selectedSizeId]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedColorId) {
      toast.warning("Vui lòng chọn màu sắc");
      return;
    }

    if (!selectedSizeId) {
      toast.warning("Vui lòng chọn kích cỡ");
      return;
    }

    if (!selectedVariant) {
      toast.error("Sản phẩm với màu sắc và kích cỡ đã chọn không tồn tại");
      return;
    }

    if (quantity > availableStock) {
      toast.error("Số lượng vượt quá tồn kho");
      return;
    }

    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    dispatch(
      addToCartRequest({
        productVariantId: selectedVariant.id,
        sizeId: selectedSizeId!,
        quantity: quantity,
      }) as any
    );
  };

  // Handle buy now - add to cart and go to checkout
  const handleBuyNow = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedColorId) {
      toast.warning("Vui lòng chọn màu sắc");
      return;
    }

    if (!selectedSizeId) {
      toast.warning("Vui lòng chọn kích cỡ");
      return;
    }

    if (!selectedVariant) {
      toast.error("Sản phẩm với màu sắc và kích cỡ đã chọn không tồn tại");
      return;
    }

    if (quantity > availableStock) {
      toast.error("Số lượng vượt quá tồn kho");
      return;
    }

    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    try {
      // Add to cart first
      dispatch(
        addToCartRequest({
          productVariantId: selectedVariant.id,
          sizeId: selectedSizeId!,
          quantity: quantity,
        }) as any
      );
      
      // Wait a bit for cart to update, then redirect to checkout
      setTimeout(() => {
        router.push("/checkout");
      }, 500);
    } catch (error: any) {
      toast.error("Lỗi khi thêm vào giỏ hàng");
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta;
      if (newQuantity < 1) return 1;
      if (newQuantity > availableStock) return availableStock;
      return newQuantity;
    });
  };

  const handleQuantityInput = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1) {
      setQuantity(1);
    } else if (num > availableStock) {
      setQuantity(availableStock);
    } else {
      setQuantity(num);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">
              {error || "Không tìm thấy sản phẩm"}
            </p>
            <Link
              href="/products"
              className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayPrice = currentProduct.salePrice || currentProduct.price;
  const hasDiscount = !!currentProduct.salePrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-indigo-600">
                Trang chủ
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-indigo-600">
                Sản phẩm
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{currentProduct.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div className="space-y-4">
              {mainImage && (
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={mainImage}
                    alt={currentProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 gap-4">
                {/* Show main image as first thumbnail */}
                {currentProduct.imageUrl && (
                  <div
                    className={`aspect-square w-full overflow-hidden rounded-lg bg-gray-200 cursor-pointer border-2 transition-all ${
                      mainImage === currentProduct.imageUrl
                        ? "border-indigo-600 ring-2 ring-indigo-200"
                        : "border-transparent hover:border-gray-400"
                    }`}
                    onClick={() =>
                      setMainImage(currentProduct.imageUrl || null)
                    }
                  >
                    <img
                      src={currentProduct.imageUrl}
                      alt={currentProduct.name}
                      className="h-full w-full object-cover hover:opacity-75 transition-opacity"
                    />
                  </div>
                )}
                {/* Show gallery images */}
                {currentProduct.imageUrls &&
                  currentProduct.imageUrls.length > 0 &&
                  currentProduct.imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className={`aspect-square w-full overflow-hidden rounded-lg bg-gray-200 cursor-pointer border-2 transition-all ${
                        mainImage === url
                          ? "border-indigo-600 ring-2 ring-indigo-200"
                          : "border-transparent hover:border-gray-400"
                      }`}
                      onClick={() => setMainImage(url)}
                    >
                      <img
                        src={url}
                        alt={`${currentProduct.name} ${index + 1}`}
                        className="h-full w-full object-cover hover:opacity-75 transition-opacity"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentProduct.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>
                    Thương hiệu: <strong>{currentProduct.brandName}</strong>
                  </span>
                  <span>
                    Danh mục: <strong>{currentProduct.categoryName}</strong>
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-indigo-600">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(currentProduct.price)}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                      Giảm{" "}
                      {Math.round(
                        ((currentProduct.price - currentProduct.salePrice!) /
                          currentProduct.price) *
                          100
                      )}
                      %
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              {currentProduct.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Mô tả sản phẩm
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {currentProduct.description}
                  </p>
                </div>
              )}

              {/* Variants */}
              {currentProduct.variants &&
                currentProduct.variants.length > 0 && (
                  <div className="space-y-6">
                    {/* Colors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Màu sắc:
                      </label>
                      <div className="flex gap-3">
                        {availableColors.map((color) => {
                          const isSelected = selectedColorId === color.colorId;
                          // Default: black border, when selected: #bce0ef
                          const borderColor = isSelected
                            ? "#bce0ef"
                            : "#000000";

                          return (
                            <button
                              key={color.colorId}
                              onClick={() => {
                                setSelectedColorId(color.colorId);
                                setSelectedSizeId(null); // Reset size when color changes
                                setQuantity(1);
                              }}
                              className={`relative px-2 py-1 h-12 border-2 rounded-md transition-all flex items-center gap-2 ${
                                isSelected
                                  ? "ring-2 ring-offset-2 ring-blue-400"
                                  : ""
                              }`}
                              style={{
                                borderColor: borderColor,
                              }}
                            >
                              {color.imageUrl && (
                                <img
                                  src={color.imageUrl}
                                  alt={color.colorName}
                                  className="w-8 h-8 object-cover rounded shrink-0"
                                />
                              )}
                              <div className="text-xs text-center whitespace-nowrap">
                                {color.colorName}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sizes */}
                    {selectedColorId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Kích cỡ:
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {availableSizes.map((size) => {
                            const isSelected = selectedSizeId === size.sizeId;
                            return (
                              <button
                                key={size.sizeId}
                                onClick={() => {
                                  setSelectedSizeId(size.sizeId);
                                  setQuantity(1);
                                }}
                                className={`px-6 py-2 border-2 rounded-md transition-all ${
                                  isSelected
                                    ? "ring-2 ring-offset-2 ring-blue-400 border-[#bce0ef]"
                                    : "border-gray-300 hover:border-indigo-400"
                                }`}
                              >
                                <span className="font-medium">
                                  {size.sizeName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Số lượng:
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border-2 border-gray-300 rounded-md">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={availableStock}
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityInput(e.target.value)
                            }
                            className="w-16 px-2 py-2 text-center border-x-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= availableStock}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm text-gray-600">
                          {availableStock > 0 ? (
                            <span>
                              {availableStock} sản phẩm có sẵn
                              {selectedColorId &&
                                !selectedSizeId &&
                                " (màu đã chọn)"}
                              {selectedColorId &&
                                selectedSizeId &&
                                " (màu + size đã chọn)"}
                            </span>
                          ) : (
                            <span className="text-red-600">Hết hàng</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Action Buttons - Only show for Customer role */}
              {user?.role === "Customer" && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={
                      availableStock === 0 ||
                      !selectedColorId ||
                      !selectedSizeId ||
                      cartLoading
                    }
                    className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                      availableStock > 0 &&
                      selectedColorId &&
                      selectedSizeId &&
                      !cartLoading
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {cartLoading
                      ? "Đang thêm..."
                      : !selectedColorId
                      ? "Vui lòng chọn màu sắc"
                      : !selectedSizeId
                      ? "Vui lòng chọn kích cỡ"
                      : availableStock > 0
                      ? "Thêm vào giỏ hàng"
                      : "Hết hàng"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={
                      availableStock === 0 || !selectedColorId || !selectedSizeId
                    }
                    className={`px-6 py-3 rounded-md font-medium transition-colors ${
                      availableStock > 0 && selectedColorId && selectedSizeId
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Mua ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Đánh giá sản phẩm
          </h2>

          {loadingReviews ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Đang tải đánh giá...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                Chưa có đánh giá nào cho sản phẩm này
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <AiFillStar
                              key={star}
                              className={`w-6 h-6 ${
                                star <= review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="font-semibold text-gray-900">
                          {review.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {review.comment}
                    </p>
                  )}
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.imageUrls.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Review image ${index + 1}`}
                            className="w-28 aspect-square object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
