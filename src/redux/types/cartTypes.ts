import { CartItem, AddToCartRequest, UpdateCartRequest } from '../../services/cartService';

export const GET_CART_REQUEST = 'GET_CART_REQUEST';
export const GET_CART_SUCCESS = 'GET_CART_SUCCESS';
export const GET_CART_FAILURE = 'GET_CART_FAILURE';

export const ADD_TO_CART_REQUEST = 'ADD_TO_CART_REQUEST';
export const ADD_TO_CART_SUCCESS = 'ADD_TO_CART_SUCCESS';
export const ADD_TO_CART_FAILURE = 'ADD_TO_CART_FAILURE';

export const UPDATE_CART_REQUEST = 'UPDATE_CART_REQUEST';
export const UPDATE_CART_SUCCESS = 'UPDATE_CART_SUCCESS';
export const UPDATE_CART_FAILURE = 'UPDATE_CART_FAILURE';

export const REMOVE_FROM_CART_REQUEST = 'REMOVE_FROM_CART_REQUEST';
export const REMOVE_FROM_CART_SUCCESS = 'REMOVE_FROM_CART_SUCCESS';
export const REMOVE_FROM_CART_FAILURE = 'REMOVE_FROM_CART_FAILURE';

export interface CartState {
  items: CartItem[];
  loading: boolean;
  updatingItems: Set<number>; // Track which items are being updated
  error: string | null;
}

export interface GetCartRequestAction {
  type: typeof GET_CART_REQUEST;
}

export interface GetCartSuccessAction {
  type: typeof GET_CART_SUCCESS;
  payload: CartItem[];
}

export interface GetCartFailureAction {
  type: typeof GET_CART_FAILURE;
  payload: string;
}

export interface AddToCartRequestAction {
  type: typeof ADD_TO_CART_REQUEST;
  payload: AddToCartRequest;
}

export interface AddToCartSuccessAction {
  type: typeof ADD_TO_CART_SUCCESS;
  payload: CartItem;
}

export interface AddToCartFailureAction {
  type: typeof ADD_TO_CART_FAILURE;
  payload: string;
}

export interface UpdateCartRequestAction {
  type: typeof UPDATE_CART_REQUEST;
  payload: { id: number; request: UpdateCartRequest };
}

export interface UpdateCartSuccessAction {
  type: typeof UPDATE_CART_SUCCESS;
  payload: CartItem;
}

export interface UpdateCartFailureAction {
  type: typeof UPDATE_CART_FAILURE;
  payload: string;
}

export interface RemoveFromCartRequestAction {
  type: typeof REMOVE_FROM_CART_REQUEST;
  payload: number;
}

export interface RemoveFromCartSuccessAction {
  type: typeof REMOVE_FROM_CART_SUCCESS;
  payload: number;
}

export interface RemoveFromCartFailureAction {
  type: typeof REMOVE_FROM_CART_FAILURE;
  payload: string;
}

export type CartActionTypes =
  | GetCartRequestAction
  | GetCartSuccessAction
  | GetCartFailureAction
  | AddToCartRequestAction
  | AddToCartSuccessAction
  | AddToCartFailureAction
  | UpdateCartRequestAction
  | UpdateCartSuccessAction
  | UpdateCartFailureAction
  | RemoveFromCartRequestAction
  | RemoveFromCartSuccessAction
  | RemoveFromCartFailureAction;

