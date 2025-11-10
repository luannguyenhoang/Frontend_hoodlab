import { all } from "redux-saga/effects";
import { watchAuthSaga } from "./authSaga";
import { watchProductSaga } from "./productSaga";
import { watchCartSaga } from "./cartSaga";
import { watchOrderSaga } from "./orderSaga";

export default function* rootSaga(): Generator<any, void, any> {
  yield all([
    watchAuthSaga(),
    watchProductSaga(),
    watchCartSaga(),
    watchOrderSaga(),
  ]);
}
