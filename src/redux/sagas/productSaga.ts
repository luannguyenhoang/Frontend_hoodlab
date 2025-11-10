import { call, put, takeEvery } from 'redux-saga/effects';
import {
  GET_PRODUCTS_REQUEST,
  GET_PRODUCT_REQUEST,
  GetProductsRequestAction,
  GetProductRequestAction,
} from '../types/productTypes';
import {
  getProductsSuccess,
  getProductsFailure,
  getProductSuccess,
  getProductFailure,
} from '../actions/productActions';
import { productService } from '../../services/productService';

function* getProductsSaga(action: GetProductsRequestAction): Generator<any, void, any> {
  try {
    const products = yield call(productService.getProducts, action.payload);
    yield put(getProductsSuccess(products));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi lấy danh sách sản phẩm';
    yield put(getProductsFailure(errorMessage));
  }
}

function* getProductSaga(action: GetProductRequestAction): Generator<any, void, any> {
  try {
    const product = yield call(productService.getProduct, action.payload);
    yield put(getProductSuccess(product));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi lấy chi tiết sản phẩm';
    yield put(getProductFailure(errorMessage));
  }
}

export function* watchProductSaga(): Generator<any, void, any> {
  yield takeEvery(GET_PRODUCTS_REQUEST, getProductsSaga);
  yield takeEvery(GET_PRODUCT_REQUEST, getProductSaga);
}

