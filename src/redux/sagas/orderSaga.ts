import { call, put, takeEvery } from 'redux-saga/effects';
import {
  GET_ORDERS_REQUEST,
  GET_ORDERS_SUCCESS,
  GET_ORDERS_FAILURE,
  GET_ORDER_REQUEST,
  GET_ORDER_SUCCESS,
  GET_ORDER_FAILURE,
} from '../types/orderTypes';
import { orderService } from '../../services/orderService';
import { Order } from '../types/orderTypes';

function* getOrdersSaga(action: any): Generator<any, void, any> {
  try {
    const page = action.payload?.page || 1;
    const pageSize = action.payload?.pageSize || 10;
    const response: any = yield call(orderService.getOrders, page, pageSize);
    
    const pagination = {
      page: response.page,
      pageSize: response.pageSize,
      totalCount: response.totalCount,
      totalPages: response.totalPages,
      hasPreviousPage: response.hasPreviousPage,
      hasNextPage: response.hasNextPage,
    };
    
    yield put({ 
      type: GET_ORDERS_SUCCESS, 
      payload: { orders: response.data, pagination } 
    });
  } catch (error: any) {
    yield put({
      type: GET_ORDERS_FAILURE,
      payload: error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng',
    });
  }
}

function* getOrderSaga(action: any): Generator<any, void, any> {
  try {
    const order: Order = yield call(orderService.getOrder, action.payload);
    yield put({ type: GET_ORDER_SUCCESS, payload: order });
  } catch (error: any) {
    yield put({
      type: GET_ORDER_FAILURE,
      payload: error.response?.data?.message || 'Lỗi khi tải thông tin đơn hàng',
    });
  }
}

export function* watchOrderSaga(): Generator<any, void, any> {
  yield takeEvery(GET_ORDERS_REQUEST, getOrdersSaga);
  yield takeEvery(GET_ORDER_REQUEST, getOrderSaga);
}

