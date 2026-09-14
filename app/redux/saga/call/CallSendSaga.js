import { call, put, takeLatest } from "redux-saga/effects";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/apiConfig";
import axios from "axios";
import {  sendCallRequest, sendCallReqAdd, sendCallReqFail } from "../../reducer/call/sendCallRequestSlice";


const send_request = async (payload) => {
  const token = getAuthHeaders();
  const headers = {
         Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
  };


  return await axios.post(API_ENDPOINTS.NEW_CALL_REQUEST, payload, { headers });
};

function* send_new_request(action) {
  try {
    const response = yield call(send_request, action.payload);


    if (response?.status === 200) {
      yield put(sendCallReqAdd(response?.data));
    } else {
      yield put(sendCallReqFail(response?.data));
    }
  } catch (error) {

    yield put(sendCallReqFail(error?.message));
  }
}

export default function* CallSendSaga() {
  yield takeLatest(sendCallRequest.type, send_new_request);
}
