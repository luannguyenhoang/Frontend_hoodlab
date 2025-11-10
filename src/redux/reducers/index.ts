import { combineReducers, Reducer, AnyAction } from 'redux';
import authReducer from './authReducer';
import productReducer from './productReducer';
import cartReducer from './cartReducer';
import { orderReducer } from './orderReducer';
import { AuthState } from '../types/authTypes';
import { ProductsState } from '../types/productTypes';
import { CartState } from '../types/cartTypes';
import { OrdersState } from '../types/orderTypes';

export interface RootState {
  auth: AuthState;
  products: ProductsState;
  cart: CartState;
  orders: OrdersState;
}

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  cart: cartReducer,
  orders: orderReducer,
}) as unknown as Reducer<RootState, AnyAction>;

export default rootReducer;

