import api from './api';

export interface OrderItemRequest {
  productVariantId: number;
  sizeId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  paymentMethod: string;
  shippingAddress?: string;
  phone?: string;
  notes?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  colorName: string;
  sizeName: string;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number;
  userName?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface PaginatedOrdersResponse {
  data: Order[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const orderService = {
  createOrder: async (request: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/orders', request);
    return response.data;
  },

  getOrders: async (page: number = 1, pageSize: number = 10): Promise<PaginatedOrdersResponse> => {
    const response = await api.get<PaginatedOrdersResponse>(`/orders?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: number, orderStatus: string, paymentStatus?: string): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/status`, {
      orderStatus,
      paymentStatus,
    });
    return response.data;
  },
};

