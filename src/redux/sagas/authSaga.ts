import { call, put, takeEvery } from "redux-saga/effects";
import {
  LOGIN_REQUEST,
  REGISTER_REQUEST,
  LoginRequestAction,
  RegisterRequestAction,
} from "../types/authTypes";
import {
  loginSuccess,
  loginFailure,
  registerSuccess,
  registerFailure,
} from "../actions/authActions";
import { authService } from "../../services/authService";

function* loginSaga(action: LoginRequestAction): Generator<any, void, any> {
  try {
    const response = yield call(authService.login, action.payload);
    yield put(loginSuccess(response.token, response.user));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Đăng nhập thất bại";
    yield put(loginFailure(errorMessage));
  }
}

function* registerSaga(
  action: RegisterRequestAction
): Generator<any, void, any> {
  try {
    const response = yield call(authService.register, action.payload);
    yield put(registerSuccess(response.token, response.user));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Đăng ký thất bại";
    yield put(registerFailure(errorMessage));
  }
}

export function* watchAuthSaga(): Generator<any, void, any> {
  yield takeEvery(LOGIN_REQUEST, loginSaga);
  yield takeEvery(REGISTER_REQUEST, registerSaga);
}
