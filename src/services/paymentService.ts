import api from './api';

export interface PaymentRequest {
  orderId: number;
  paymentMethod?: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  orderNumber: string;
}

export const paymentService = {
  createVNPayPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>('/payment/vnpay', request);
    return response.data;
  },

  createMoMoPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>('/payment/momo', request);
    return response.data;
  },

  createShipPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>('/payment/ship', request);
    return response.data;
  },
};

