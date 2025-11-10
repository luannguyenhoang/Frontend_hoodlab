import api from './api';

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  orderItemId: number;
  rating: number;
  comment?: string;
  imageUrls?: string[];
  createdAt: string;
}

export interface CreateReviewRequest {
  orderId: number;
  orderItemId: number;
  productId: number;
  rating: number;
  comment?: string;
  imageUrls?: string[];
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
  imageUrls?: string[];
}

export const reviewService = {
  getProductReviews: async (productId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/reviews/product/${productId}`);
    return response.data;
  },

  getOrderReviews: async (orderId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/reviews/order/${orderId}`);
    return response.data;
  },

  createReview: async (request: CreateReviewRequest): Promise<Review> => {
    const response = await api.post<Review>('/reviews', request);
    return response.data;
  },

  updateReview: async (id: number, request: UpdateReviewRequest): Promise<Review> => {
    const response = await api.put<Review>(`/reviews/${id}`, request);
    return response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};

