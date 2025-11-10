import api from './api';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productVariantId: number;
  sizeId: number;
  colorName: string;
  sizeName: string;
  price: number;
  salePrice?: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
}

export interface AddToCartRequest {
  productVariantId: number;
  sizeId: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    const response = await api.get<CartItem[]>('/cart');
    return response.data;
  },

  addToCart: async (request: AddToCartRequest): Promise<CartItem> => {
    const response = await api.post<CartItem>('/cart', request);
    return response.data;
  },

  updateCart: async (id: number, request: UpdateCartRequest): Promise<CartItem> => {
    const response = await api.put<CartItem>(`/cart/${id}`, request);
    return response.data;
  },

  removeFromCart: async (id: number): Promise<void> => {
    await api.delete(`/cart/${id}`);
  },
};

