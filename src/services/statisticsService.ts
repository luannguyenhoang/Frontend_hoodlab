import api from './api';

export interface RevenueStatistics {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface StatisticsRequest {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'month' | 'year';
}

export interface StatisticsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueByPeriod?: RevenueStatistics[];
}

export interface ProductSalesStatistics {
  productId: number;
  productName: string;
  imageUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
  orderCount: number;
}

export interface ProductSalesResponse {
  totalProductsSold: number;
  totalQuantitySold: number;
  products?: ProductSalesStatistics[];
}

export const statisticsService = {
  getStatistics: async (request?: StatisticsRequest): Promise<StatisticsResponse> => {
    const queryParams = new URLSearchParams();
    if (request?.startDate) queryParams.append('startDate', request.startDate);
    if (request?.endDate) queryParams.append('endDate', request.endDate);
    if (request?.groupBy) queryParams.append('groupBy', request.groupBy);

    const response = await api.get<StatisticsResponse>(`/statistics?${queryParams.toString()}`);
    return response.data;
  },
  getProductSales: async (request?: StatisticsRequest): Promise<ProductSalesResponse> => {
    const queryParams = new URLSearchParams();
    if (request?.startDate) queryParams.append('startDate', request.startDate);
    if (request?.endDate) queryParams.append('endDate', request.endDate);
    if (request?.groupBy) queryParams.append('groupBy', request.groupBy);

    const response = await api.get<ProductSalesResponse>(`/statistics/products?${queryParams.toString()}`);
    return response.data;
  },
};

