import {
  GET_ORDERS_REQUEST,
  GET_ORDERS_SUCCESS,
  GET_ORDERS_FAILURE,
  GET_ORDER_REQUEST,
  GET_ORDER_SUCCESS,
  GET_ORDER_FAILURE,
  Order,
} from '../types/orderTypes';

export const getOrdersRequest = (page?: number, pageSize?: number) => ({
  type: GET_ORDERS_REQUEST,
  payload: page !== undefined && pageSize !== undefined ? { page, pageSize } : undefined,
});

export const getOrdersSuccess = (orders: Order[], pagination: any) => ({
  type: GET_ORDERS_SUCCESS,
  payload: { orders, pagination },
});

export const getOrdersFailure = (error: string) => ({
  type: GET_ORDERS_FAILURE,
  payload: error,
});

export const getOrderRequest = (id: number) => ({
  type: GET_ORDER_REQUEST,
  payload: id,
});

export const getOrderSuccess = (order: Order) => ({
  type: GET_ORDER_SUCCESS,
  payload: order,
});

export const getOrderFailure = (error: string) => ({
  type: GET_ORDER_FAILURE,
  payload: error,
});

