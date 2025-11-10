export const GET_ORDERS_REQUEST = 'GET_ORDERS_REQUEST';
export const GET_ORDERS_SUCCESS = 'GET_ORDERS_SUCCESS';
export const GET_ORDERS_FAILURE = 'GET_ORDERS_FAILURE';

export const GET_ORDER_REQUEST = 'GET_ORDER_REQUEST';
export const GET_ORDER_SUCCESS = 'GET_ORDER_SUCCESS';
export const GET_ORDER_FAILURE = 'GET_ORDER_FAILURE';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  colorName: string;
  sizeName: string;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
}

export interface GetOrdersRequestAction {
  type: typeof GET_ORDERS_REQUEST;
  payload?: { page: number; pageSize: number };
}

export interface GetOrdersSuccessAction {
  type: typeof GET_ORDERS_SUCCESS;
  payload: { orders: Order[]; pagination: PaginationInfo };
}

export interface GetOrdersFailureAction {
  type: typeof GET_ORDERS_FAILURE;
  payload: string;
}

export interface GetOrderRequestAction {
  type: typeof GET_ORDER_REQUEST;
  payload: number;
}

export interface GetOrderSuccessAction {
  type: typeof GET_ORDER_SUCCESS;
  payload: Order;
}

export interface GetOrderFailureAction {
  type: typeof GET_ORDER_FAILURE;
  payload: string;
}

export type OrderActionTypes =
  | GetOrdersRequestAction
  | GetOrdersSuccessAction
  | GetOrdersFailureAction
  | GetOrderRequestAction
  | GetOrderSuccessAction
  | GetOrderFailureAction;

