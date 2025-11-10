'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { getProductsRequest } from '../../redux/actions/productActions';
import { adminService, Category, Brand } from '../../services/adminService';
import Link from 'next/link';
import { encodeId } from '../../utils/idEncoder';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state: RootState) => state.products);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [loadingFilters, setLoadingFilters] = useState(true);

  useEffect(() => {
    dispatch(getProductsRequest() as any);
    loadFilters();
  }, [dispatch]);

  const loadFilters = async () => {
    try {
      setLoadingFilters(true);
      const [categoriesData, brandsData] = await Promise.all([
        adminService.getCategories(),
        adminService.getBrands(),
      ]);
      setCategories(categoriesData.filter((c) => c.isActive));
      setBrands(brandsData.filter((b) => b.isActive));
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params: any = {};
    if (search.trim()) params.search = search.trim();
    if (selectedCategoryId) params.categoryId = selectedCategoryId;
    if (selectedBrandId) params.brandId = selectedBrandId;
    if (minPrice.trim()) params.minPrice = parseFloat(minPrice.trim());
    if (maxPrice.trim()) params.maxPrice = parseFloat(maxPrice.trim());
    dispatch(getProductsRequest(params) as any);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategoryId(undefined);
    setSelectedBrandId(undefined);
    setMinPrice('');
    setMaxPrice('');
    dispatch(getProductsRequest() as any);
  };

  const hasActiveFilters = selectedCategoryId || selectedBrandId || minPrice.trim() || maxPrice.trim();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Danh sách sản phẩm</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thương hiệu
                  </label>
                  <select
                    value={selectedBrandId || ''}
                    onChange={(e) => setSelectedBrandId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Từ (₫)"
                      min="0"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Đến (₫)"
                      min="0"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Loading State */}
            {(loading || loadingFilters) && (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {loadingFilters ? 'Đang tải bộ lọc...' : 'Đang tải sản phẩm...'}
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-8">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Không tìm thấy sản phẩm nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${encodeId(product.id)}`}
                        className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-64 w-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-400">Không có hình ảnh</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{product.brandName}</p>
                          <div className="flex items-center gap-2 mb-2">
                            {product.salePrice ? (
                              <>
                                <span className="text-lg font-bold text-indigo-600">
                                  {formatPrice(product.salePrice)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-indigo-600">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Còn lại: {product.stock} sản phẩm
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

