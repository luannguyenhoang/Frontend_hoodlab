"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { statisticsService, StatisticsResponse, ProductSalesResponse } from "../../../services/statisticsService";
import Link from "next/link";

export default function StatisticsPage() {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [productSales, setProductSales] = useState<ProductSalesResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'revenue' | 'products'>('revenue');
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'year'>('day');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (!token || user?.role !== "Admin") {
      router.push("/");
      return;
    }

    loadStatistics();
  }, [token, user, router, groupBy]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [statsData, salesData] = await Promise.all([
        statisticsService.getStatistics({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          groupBy: groupBy,
        }),
        statisticsService.getProductSales({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          groupBy: groupBy,
        }),
      ]);
      setStatistics(statsData);
      setProductSales(salesData);
    } catch (error: any) {
      toast.error("Lỗi khi tải thống kê");
      console.error(error);
    } finally {
      setLoading(false);
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
    if (groupBy === 'day') {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }).format(date);
    } else if (groupBy === 'month') {
      return new Intl.DateTimeFormat("vi-VN", {
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
      }).format(date);
    }
  };

  const getMaxRevenue = () => {
    if (!statistics?.revenueByPeriod || statistics.revenueByPeriod.length === 0) return 0;
    return Math.max(...statistics.revenueByPeriod.map(r => r.revenue));
  };

  const getBarHeight = (revenue: number) => {
    const maxRevenue = getMaxRevenue();
    if (maxRevenue === 0) return 0;
    return (revenue / maxRevenue) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải thống kê...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thống kê doanh thu và sản phẩm</h1>
          <p className="text-gray-600">Xem thống kê chi tiết về doanh thu và sản phẩm</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhóm theo</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'day' | 'month' | 'year')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="day">Theo ngày</option>
                <option value="month">Theo tháng</option>
                <option value="year">Theo năm</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadStatistics}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Lọc
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'revenue'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Doanh thu
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sản phẩm đã bán
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Tổng doanh thu</h3>
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {statistics ? formatPrice(statistics.totalRevenue) : "0 ₫"}
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Tổng đơn hàng</h3>
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {statistics?.totalOrders || 0}
            </p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Tổng sản phẩm</h3>
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {statistics?.totalProducts || 0}
            </p>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Tổng khách hàng</h3>
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {statistics?.totalCustomers || 0}
            </p>
          </div>
        </div>

        {/* Revenue Tab Content */}
        {activeTab === 'revenue' && (
          <>
            {/* Revenue Chart */}
            {statistics?.revenueByPeriod && statistics.revenueByPeriod.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Biểu đồ doanh thu</h2>
            <div className="flex items-end justify-between gap-4" style={{ minHeight: '320px' }}>
              {statistics.revenueByPeriod.map((item, index) => {
                const barHeight = getBarHeight(item.revenue);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-3">
                    <div className="relative w-full" style={{ height: '280px' }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 rounded-t-lg overflow-hidden shadow-inner" style={{ height: '100%' }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-700 ease-out shadow-lg flex flex-col items-center justify-start pt-2 min-h-[20px]"
                          style={{ height: `${barHeight}%` }}
                        >
                          {barHeight > 15 && (
                            <span className="text-white text-xs font-bold whitespace-nowrap">
                              {formatPrice(item.revenue)}
                            </span>
                          )}
                        </div>
                      </div>
                      {barHeight <= 15 && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-1">
                          <span className="text-indigo-600 text-xs font-bold whitespace-nowrap bg-white px-2 py-1 rounded shadow">
                            {formatPrice(item.revenue)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700">
                        {formatDate(item.date)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.orderCount} đơn
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Revenue Table */}
        {statistics?.revenueByPeriod && statistics.revenueByPeriod.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết doanh thu</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {groupBy === 'day' ? 'Ngày' : groupBy === 'month' ? 'Tháng' : 'Năm'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trung bình/đơn
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.revenueByPeriod.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.orderCount > 0
                          ? formatPrice(item.revenue / item.orderCount)
                          : "0 ₫"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

            {(!statistics?.revenueByPeriod || statistics.revenueByPeriod.length === 0) && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-600 text-lg">Không có dữ liệu thống kê trong khoảng thời gian này</p>
              </div>
            )}
          </>
        )}

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <>
            {/* Summary Cards for Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Tổng sản phẩm đã bán</h3>
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {productSales?.totalProductsSold || 0}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Tổng số lượng đã bán</h3>
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {productSales?.totalQuantitySold || 0}
                </p>
              </div>
            </div>

            {/* Products Table */}
            {productSales?.products && productSales.products.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Chi tiết sản phẩm đã bán</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sản phẩm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng đã bán
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doanh thu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số đơn hàng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productSales.products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.imageUrl && (
                                <img
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  className="h-12 w-12 rounded-lg object-cover mr-4"
                                />
                              )}
                              <div className="text-sm font-medium text-gray-900">
                                {product.productName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.totalQuantitySold}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(product.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.orderCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-600 text-lg">Không có sản phẩm nào được bán trong khoảng thời gian này</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

