import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";
import {
  sendOtpRequest,
  sendOtpSuccess,
  sendOtpFailure,
  verifyOtpFailure,
  verifyOtpSuccess,
  verifyOtpRequest,
  sendRequestName,
  updateNameDone
} from "../reducer/auth/authSlice";
import { API_ENDPOINTS } from "../config/apiConfig";

const sendOtpApi = (payload) => axios.post(API_ENDPOINTS.CUSTOMER_LOGIN, payload);
const verifyOtpApi = (payload) => axios.post(API_ENDPOINTS.OTP_VERIFY, payload);
const updatename = (payload) => axios.post(API_ENDPOINTS.USERNAME_UPDATE, payload);




function* handleSendOtp(action) {
  try {

    const response = yield call(sendOtpApi, action.payload);
  if (response.status === 200 || response.status === 201) {


  yield put(sendOtpSuccess({ otp:response?.data?.otp,type:response?.data?.type}));
    } else {
      yield put(sendOtpFailure("Failed to send OTP"));
    }
  } catch (error) {
    yield put(sendOtpFailure(error?.response?.data?.message || "Failed to send OTP"));
  }
}

function* handleVerifyOtp(action) {
  try {
    const response = yield call(verifyOtpApi, action.payload);



    if (response?.data?.success) {
      yield put(
        verifyOtpSuccess({
          user: response?.data?.user,
          token: response?.data?.access_token,
        })
      );
    } else {
      yield put(verifyOtpFailure("Invalid OTP"));
    }
  } catch (error) {

    yield put(verifyOtpFailure("Invalid OTP"));
  }
}



function* HandleUpdateName(action){
 try {
   const response= yield call(updatename,action.payload);
  if(response?.status === 200){
    yield put(updateNameDone(response?.data))
  }
 } catch (error) {
  console.log("error",error?.message);
 }

}

export default function* authSaga() {
  yield takeLatest(sendOtpRequest.type, handleSendOtp);
  yield takeLatest(verifyOtpRequest.type, handleVerifyOtp);
  yield takeLatest(sendRequestName.type,HandleUpdateName);
}
