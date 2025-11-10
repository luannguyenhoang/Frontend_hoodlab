import {
  ProductsState,
  ProductActionTypes,
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAILURE,
  GET_PRODUCT_REQUEST,
  GET_PRODUCT_SUCCESS,
  GET_PRODUCT_FAILURE,
} from '../types/productTypes';

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
};

const productReducer = (state = initialState, action: ProductActionTypes): ProductsState => {
  switch (action.type) {
    case GET_PRODUCTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_PRODUCTS_SUCCESS:
      return {
        ...state,
        products: action.payload,
        loading: false,
        error: null,
      };

    case GET_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        products: [],
      };

    case GET_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        currentProduct: null,
      };

    case GET_PRODUCT_SUCCESS:
      return {
        ...state,
        currentProduct: action.payload,
        loading: false,
        error: null,
      };

    case GET_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        currentProduct: null,
      };

    default:
      return state;
  }
};

export default productReducer;

