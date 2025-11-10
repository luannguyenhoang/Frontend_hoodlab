import {
  CartState,
  CartActionTypes,
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

const initialState: CartState = {
  items: [],
  loading: false,
  updatingItems: new Set<number>(),
  error: null,
};

const cartReducer = (state = initialState, action: CartActionTypes): CartState => {
  switch (action.type) {
    case GET_CART_REQUEST:
    case ADD_TO_CART_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_CART_REQUEST:
      // Add item id to updatingItems set
      const updatingId = (action as any).payload.id;
      return {
        ...state,
        updatingItems: new Set([...state.updatingItems, updatingId]),
        error: null,
      };

    case REMOVE_FROM_CART_REQUEST:
      // Optimistic update: remove item immediately without loading state
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        error: null,
      };

    case GET_CART_SUCCESS:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null,
      };

    case ADD_TO_CART_SUCCESS:
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        (item) => item.productVariantId === action.payload.productVariantId
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = action.payload;
        return {
          ...state,
          items: updatedItems,
          loading: false,
          error: null,
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, action.payload],
          loading: false,
          error: null,
        };
      }

    case UPDATE_CART_SUCCESS:
      // Remove item id from updatingItems set
      const updatedId = action.payload.id;
      const newUpdatingItems = new Set(state.updatingItems);
      newUpdatingItems.delete(updatedId);
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
        updatingItems: newUpdatingItems,
        loading: false,
        error: null,
      };

    case REMOVE_FROM_CART_SUCCESS:
      // Item already removed in REMOVE_FROM_CART_REQUEST (optimistic update)
      // Just clear any error state
      return {
        ...state,
        error: null,
      };

    case GET_CART_FAILURE:
    case ADD_TO_CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_CART_FAILURE:
      // Remove all updating items on error (simpler approach)
      return {
        ...state,
        updatingItems: new Set<number>(),
        loading: false,
        error: action.payload,
      };

    case REMOVE_FROM_CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default cartReducer;

