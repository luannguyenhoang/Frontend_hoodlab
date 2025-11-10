import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGOUT,
  LoginRequestAction,
  LoginSuccessAction,
  LoginFailureAction,
  RegisterRequestAction,
  RegisterSuccessAction,
  RegisterFailureAction,
  LogoutAction,
} from '../types/authTypes';

export const loginRequest = (email: string, password: string): LoginRequestAction => ({
  type: LOGIN_REQUEST,
  payload: { email, password },
});

export const loginSuccess = (token: string, user: any): LoginSuccessAction => ({
  type: LOGIN_SUCCESS,
  payload: { token, user },
});

export const loginFailure = (error: string): LoginFailureAction => ({
  type: LOGIN_FAILURE,
  payload: error,
});

export const registerRequest = (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  address: string
): RegisterRequestAction => ({
  type: REGISTER_REQUEST,
  payload: { email, password, fullName, phone, address },
});

export const registerSuccess = (token: string, user: any): RegisterSuccessAction => ({
  type: REGISTER_SUCCESS,
  payload: { token, user },
});

export const registerFailure = (error: string): RegisterFailureAction => ({
  type: REGISTER_FAILURE,
  payload: error,
});

export const logout = (): LogoutAction => ({
  type: LOGOUT,
});

