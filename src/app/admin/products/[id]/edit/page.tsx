"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../../../redux/store";
import {
  productService,
  UpdateProductRequest,
  Product,
} from "../../../../../services/productService";
import {
  adminService,
  Category,
  Brand,
  Color,
  Size,
} from "../../../../../services/adminService";
import { imageService } from "../../../../../services/imageService";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<UpdateProductRequest>({
    name: "",
    description: "",
    price: 0,
    salePrice: undefined,
    categoryId: 0,
    brandId: 0,
    stock: 0,
    imageUrl: "",
    imageUrls: [],
    isActive: true,
    variants: [],
  });

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrlsInput, setImageUrlsInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVariantImages, setUploadingVariantImages] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!token || (user?.role !== "Admin" && user?.role !== "Staff")) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      try {
        setLoadingData(true);
        setLoadingProduct(true);
        const [categoriesData, brandsData, colorsData, sizesData, productData] =
          await Promise.all([
            adminService.getCategories(),
            adminService.getBrands(),
            adminService.getColors(),
            adminService.getSizes(),
            productService.getProduct(productId),
          ]);
        setCategories(categoriesData);
        setBrands(brandsData);
        setColors(colorsData);
        setSizes(sizesData);
        setProduct(productData);

        // Fill form with product data
        setFormData({
          name: productData.name,
          description: productData.description || "",
          price: productData.price,
          salePrice: productData.salePrice,
          categoryId: productData.categoryId,
          brandId: productData.brandId,
          stock: productData.stock,
          imageUrl: productData.imageUrl || "",
          imageUrls: productData.imageUrls || [],
          isActive: true, // Assuming active if we can edit
          variants:
            productData.variants?.map((v) => ({
              id: v.id,
              colorId: v.colorId,
              sizeIds:
                v.sizeIds?.map((s) => ({
                  id: undefined, // Will be set when updating
                  idSize: s.idSize,
                  stock: s.stock,
                })) || [],
              imageUrl: v.imageUrl || "",
            })) || [],
        });
      } catch (error: any) {
        toast.error("Lỗi khi tải dữ liệu");
        console.error(error);
        router.push("/admin/products");
      } finally {
        setLoadingData(false);
        setLoadingProduct(false);
      }
    };

    loadData();
  }, [token, user, router, productId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: imageUrlInput.trim(),
      }));
      setImageUrlInput("");
    }
  };

  const handleUploadMainImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, BMP)");
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 32 MB");
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await imageService.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        imageUrl: imageUrl,
      }));
      toast.success("Upload ảnh chính thành công!");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi upload ảnh");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleUploadAdditionalImages = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, BMP)");
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 32 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Kích thước file không được vượt quá 32 MB");
      return;
    }

    try {
      setUploadingImages(true);
      const urls = await imageService.uploadImages(files);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...urls],
      }));
      toast.success(`Upload ${urls.length} ảnh thành công!`);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi upload ảnh");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleUploadVariantImage = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, BMP)");
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 32 MB");
      return;
    }

    try {
      setUploadingVariantImages((prev) => ({ ...prev, [variantIndex]: true }));
      const imageUrl = await imageService.uploadImage(file);
      handleVariantChange(variantIndex, "imageUrl", imageUrl);
      toast.success("Upload ảnh biến thể thành công!");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi upload ảnh");
    } finally {
      setUploadingVariantImages((prev) => ({ ...prev, [variantIndex]: false }));
      e.target.value = "";
    }
  };

  const handleAddImageUrls = () => {
    if (imageUrlsInput.trim()) {
      const urls = imageUrlsInput
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...urls],
      }));
      setImageUrlsInput("");
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index),
    }));
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          id: undefined,
          colorId: 0,
          sizeIds: [],
          imageUrl: "",
        },
      ],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newVariants = [...(prev.variants || [])];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const handleAddSizeToVariant = (variantIndex: number) => {
    setFormData((prev) => {
      const newVariants = [...(prev.variants || [])];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        sizeIds: [
          ...(newVariants[variantIndex].sizeIds || []),
          { id: undefined, idSize: 0, stock: 0 },
        ],
      };
      return { ...prev, variants: newVariants };
    });
  };

  const handleRemoveSizeFromVariant = (
    variantIndex: number,
    sizeIndex: number
  ) => {
    setFormData((prev) => {
      const newVariants = [...(prev.variants || [])];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        sizeIds: newVariants[variantIndex].sizeIds?.filter(
          (_, i) => i !== sizeIndex
        ),
      };
      return { ...prev, variants: newVariants };
    });
  };

  const handleSizeChange = (
    variantIndex: number,
    sizeIndex: number,
    field: string,
    value: any
  ) => {
    setFormData((prev) => {
      const newVariants = [...(prev.variants || [])];
      const newSizeIds = [...(newVariants[variantIndex].sizeIds || [])];
      newSizeIds[sizeIndex] = { ...newSizeIds[sizeIndex], [field]: value };
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        sizeIds: newSizeIds,
      };
      return { ...prev, variants: newVariants };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        toast.error("Vui lòng nhập tên sản phẩm");
        setLoading(false);
        return;
      }

      if (formData.categoryId === 0) {
        toast.error("Vui lòng chọn danh mục");
        setLoading(false);
        return;
      }

      if (formData.brandId === 0) {
        toast.error("Vui lòng chọn thương hiệu");
        setLoading(false);
        return;
      }

      if (formData.price <= 0) {
        toast.error("Vui lòng nhập giá sản phẩm");
        setLoading(false);
        return;
      }

      if (formData.variants && formData.variants.length > 0) {
        for (let i = 0; i < formData.variants.length; i++) {
          const variant = formData.variants[i];
          if (variant.colorId === 0) {
            toast.error(`Vui lòng chọn màu cho variant ${i + 1}`);
            setLoading(false);
            return;
          }
          if (!variant.sizeIds || variant.sizeIds.length === 0) {
            toast.error(`Variant ${i + 1} phải có ít nhất một size`);
            setLoading(false);
            return;
          }
          for (let j = 0; j < variant.sizeIds.length; j++) {
            const size = variant.sizeIds[j];
            if (size.idSize === 0) {
              toast.error(`Vui lòng chọn size cho variant ${i + 1}`);
              setLoading(false);
              return;
            }
          }
        }
      }

      await productService.updateProduct(productId, formData);
      toast.success("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi cập nhật sản phẩm";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy sản phẩm</p>
            <Link
              href="/admin/products"
              className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
            >
              Quay lại danh sách
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
            href="/admin/products"
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
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chỉnh sửa sản phẩm
          </h1>
          <p className="text-gray-600">Cập nhật thông tin sản phẩm bên dưới</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 space-y-6"
        >
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin cơ bản
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={0}>Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={0}>Chọn thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá khuyến mãi
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice || ""}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tồn kho
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh chính
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-center">
                      {uploadingImage ? (
                        <span className="text-gray-600">Đang upload...</span>
                      ) : (
                        <span className="text-gray-700">
                          Chọn ảnh từ máy tính
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadMainImage}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                 
                  {formData.imageUrl && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, imageUrl: "" }))
                        }
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh phụ
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-center">
                      {uploadingImages ? (
                        <span className="text-gray-600">Đang upload...</span>
                      ) : (
                        <span className="text-gray-700">
                          Chọn nhiều ảnh từ máy tính
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadAdditionalImages}
                        disabled={uploadingImages}
                        className="hidden"
                      />
                    </label>
                  </div>
                 
                  {formData.imageUrls && formData.imageUrls.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative ">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md z-10"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Kích hoạt sản phẩm
                </label>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Biến thể sản phẩm
              </h2>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Thêm biến thể
              </button>
            </div>

            {formData.variants && formData.variants.length > 0 && (
              <div className="space-y-6">
                {formData.variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Biến thể {variantIndex + 1}{" "}
                        {variant.id && `(ID: ${variant.id})`}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variantIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Màu <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={variant.colorId}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "colorId",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value={0}>Chọn màu</option>
                          {colors.map((color) => (
                            <option key={color.id} value={color.id}>
                              {color.name}
                            </option>
                          ))}
                        </select>
                      </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh biến thể
                          </label>
                          <div className="space-y-2">
                            <label className="block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-center">
                              {uploadingVariantImages[variantIndex] ? (
                                <span className="text-gray-600">Đang upload...</span>
                              ) : (
                                <span className="text-gray-700">Chọn ảnh từ máy tính</span>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUploadVariantImage(variantIndex, e)}
                                disabled={uploadingVariantImages[variantIndex]}
                                className="hidden"
                              />
                            </label>
                            {variant.imageUrl && (
                              <div className="mt-2 relative inline-block">
                                <img
                                  src={variant.imageUrl}
                                  alt="Preview"
                                  className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVariantChange(variantIndex, "imageUrl", "")}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md z-10"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Sizes
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddSizeToVariant(variantIndex)}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            + Thêm size
                          </button>
                        </div>
                        {variant.sizeIds && variant.sizeIds.length > 0 && (
                          <div className="space-y-2">
                            {variant.sizeIds.map((size, sizeIndex) => (
                              <div key={sizeIndex} className="flex gap-2">
                                <select
                                  value={size.idSize}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      variantIndex,
                                      sizeIndex,
                                      "idSize",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value={0}>Chọn size</option>
                                  {sizes.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  value={size.stock}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      variantIndex,
                                      sizeIndex,
                                      "stock",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  min="0"
                                  placeholder="Tồn kho"
                                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSizeFromVariant(
                                      variantIndex,
                                      sizeIndex
                                    )
                                  }
                                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Đang xử lý..." : "Cập nhật sản phẩm"}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
