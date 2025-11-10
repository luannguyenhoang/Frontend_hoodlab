import {
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAILURE,
  GET_PRODUCT_REQUEST,
  GET_PRODUCT_SUCCESS,
  GET_PRODUCT_FAILURE,
  GetProductsRequestAction,
  GetProductsSuccessAction,
  GetProductsFailureAction,
  GetProductRequestAction,
  GetProductSuccessAction,
  GetProductFailureAction,
  GetProductsParams,
  Product,
} from '../types/productTypes';

export const getProductsRequest = (params?: GetProductsParams): GetProductsRequestAction => ({
  type: GET_PRODUCTS_REQUEST,
  payload: params,
});

export const getProductsSuccess = (products: Product[]): GetProductsSuccessAction => ({
  type: GET_PRODUCTS_SUCCESS,
  payload: products,
});

export const getProductsFailure = (error: string): GetProductsFailureAction => ({
  type: GET_PRODUCTS_FAILURE,
  payload: error,
});

export const getProductRequest = (id: number): GetProductRequestAction => ({
  type: GET_PRODUCT_REQUEST,
  payload: id,
});

export const getProductSuccess = (product: Product): GetProductSuccessAction => ({
  type: GET_PRODUCT_SUCCESS,
  payload: product,
});

export const getProductFailure = (error: string): GetProductFailureAction => ({
  type: GET_PRODUCT_FAILURE,
  payload: error,
});

