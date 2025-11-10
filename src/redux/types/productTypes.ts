export const GET_PRODUCTS_REQUEST = 'GET_PRODUCTS_REQUEST';
export const GET_PRODUCTS_SUCCESS = 'GET_PRODUCTS_SUCCESS';
export const GET_PRODUCTS_FAILURE = 'GET_PRODUCTS_FAILURE';

export const GET_PRODUCT_REQUEST = 'GET_PRODUCT_REQUEST';
export const GET_PRODUCT_SUCCESS = 'GET_PRODUCT_SUCCESS';
export const GET_PRODUCT_FAILURE = 'GET_PRODUCT_FAILURE';

export interface ProductVariantSize {
  idSize: number;
  nameSize: string;
  stock: number;
}

export interface ProductVariant {
  id: number;
  colorId: number;
  colorName: string;
  colorHexCode: string;
  sizeIds?: ProductVariantSize[];
  stock: number;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  variants?: ProductVariant[];
}

export interface GetProductsParams {
  search?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
}

export interface GetProductsRequestAction {
  type: typeof GET_PRODUCTS_REQUEST;
  payload?: GetProductsParams;
}

export interface GetProductsSuccessAction {
  type: typeof GET_PRODUCTS_SUCCESS;
  payload: Product[];
}

export interface GetProductsFailureAction {
  type: typeof GET_PRODUCTS_FAILURE;
  payload: string;
}

export interface GetProductRequestAction {
  type: typeof GET_PRODUCT_REQUEST;
  payload: number;
}

export interface GetProductSuccessAction {
  type: typeof GET_PRODUCT_SUCCESS;
  payload: Product;
}

export interface GetProductFailureAction {
  type: typeof GET_PRODUCT_FAILURE;
  payload: string;
}

export type ProductActionTypes =
  | GetProductsRequestAction
  | GetProductsSuccessAction
  | GetProductsFailureAction
  | GetProductRequestAction
  | GetProductSuccessAction
  | GetProductFailureAction;

