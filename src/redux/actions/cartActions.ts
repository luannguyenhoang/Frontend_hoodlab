import {
  GET_CART_REQUEST,
  GET_CART_SUCCESS,
  GET_CART_FAILURE,
  ADD_TO_CART_REQUEST,
  ADD_TO_CART_SUCCESS,
  ADD_TO_CART_FAILURE,
  UPDATE_CART_REQUEST,
  UPDATE_CART_SUCCESS,
  UPDATE_CART_FAILURE,
  REMOVE_FROM_CART_REQUEST,
  REMOVE_FROM_CART_SUCCESS,
  REMOVE_FROM_CART_FAILURE,
} from '../types/cartTypes';
import type { CartActionTypes } from '../types/cartTypes';
import { CartItem, AddToCartRequest, UpdateCartRequest } from '../../services/cartService';

export const getCartRequest = (): CartActionTypes => ({
  type: GET_CART_REQUEST,
});

export const getCartSuccess = (items: CartItem[]): CartActionTypes => ({
  type: GET_CART_SUCCESS,
  payload: items,
});

export const getCartFailure = (error: string): CartActionTypes => ({
  type: GET_CART_FAILURE,
  payload: error,
});

export const addToCartRequest = (request: AddToCartRequest): CartActionTypes => ({
  type: ADD_TO_CART_REQUEST,
  payload: request,
});

export const addToCartSuccess = (item: CartItem): CartActionTypes => ({
  type: ADD_TO_CART_SUCCESS,
  payload: item,
});

export const addToCartFailure = (error: string): CartActionTypes => ({
  type: ADD_TO_CART_FAILURE,
  payload: error,
});

export const updateCartRequest = (id: number, request: UpdateCartRequest): CartActionTypes => ({
  type: UPDATE_CART_REQUEST,
  payload: { id, request },
});

export const updateCartSuccess = (item: CartItem): CartActionTypes => ({
  type: UPDATE_CART_SUCCESS,
  payload: item,
});

export const updateCartFailure = (error: string): CartActionTypes => ({
  type: UPDATE_CART_FAILURE,
  payload: error,
});

export const removeFromCartRequest = (id: number): CartActionTypes => ({
  type: REMOVE_FROM_CART_REQUEST,
  payload: id,
});

export const removeFromCartSuccess = (id: number): CartActionTypes => ({
  type: REMOVE_FROM_CART_SUCCESS,
  payload: id,
});

export const removeFromCartFailure = (error: string): CartActionTypes => ({
  type: REMOVE_FROM_CART_FAILURE,
  payload: error,
});

