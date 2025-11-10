import { call, put, takeEvery } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import {
  GET_CART_REQUEST,
  ADD_TO_CART_REQUEST,
  UPDATE_CART_REQUEST,
  REMOVE_FROM_CART_REQUEST,
} from '../types/cartTypes';
import {
  getCartSuccess,
  getCartFailure,
  addToCartSuccess,
  addToCartFailure,
  updateCartSuccess,
  updateCartFailure,
  removeFromCartSuccess,
  removeFromCartFailure,
} from '../actions/cartActions';
import { cartService } from '../../services/cartService';

function* getCartSaga(): Generator<any, void, any> {
  try {
    const items = yield call(cartService.getCart);
    yield put(getCartSuccess(items));
  } catch (error: any) {
    yield put(getCartFailure(error.response?.data?.message || error.message || 'Lỗi khi lấy giỏ hàng'));
  }
}

function* addToCartSaga(action: any): Generator<any, void, any> {
  try {
    const item = yield call(cartService.addToCart, action.payload);
    yield put(addToCartSuccess(item));
    // Refresh cart to get updated list
    const items = yield call(cartService.getCart);
    yield put(getCartSuccess(items));
    // Show success toast
    toast.success('Đã thêm vào giỏ hàng thành công!');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi thêm vào giỏ hàng';
    yield put(addToCartFailure(errorMessage));
    // Show error toast
    toast.error(errorMessage);
  }
}

function* updateCartSaga(action: any): Generator<any, void, any> {
  try {
    const item = yield call(cartService.updateCart, action.payload.id, action.payload.request);
    yield put(updateCartSuccess(item));
    // Don't refresh cart - reducer already updates the item
    // Don't show toast for every quantity change to avoid spam
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi cập nhật giỏ hàng';
    yield put(updateCartFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* removeFromCartSaga(action: any): Generator<any, void, any> {
  try {
    yield call(cartService.removeFromCart, action.payload);
    yield put(removeFromCartSuccess(action.payload));
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi xóa khỏi giỏ hàng';
    yield put(removeFromCartFailure(errorMessage));
    // Reload cart to restore the item if deletion failed
    const items = yield call(cartService.getCart);
    yield put(getCartSuccess(items));
    toast.error(errorMessage);
  }
}

export function* watchCartSaga(): Generator<any, void, any> {
  yield takeEvery(GET_CART_REQUEST, getCartSaga);
  yield takeEvery(ADD_TO_CART_REQUEST, addToCartSaga);
  yield takeEvery(UPDATE_CART_REQUEST, updateCartSaga);
  yield takeEvery(REMOVE_FROM_CART_REQUEST, removeFromCartSaga);
}

