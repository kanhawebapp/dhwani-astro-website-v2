import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/apiConfig.js";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchIntakeRequest,
  fetchIntakeSuccess,
  fetchIntakeFailure,
} from "../../reducer/auth/intakeSlice";

const intakeData = (payload) => {
  const token = getAuthHeaders(); 
  const headers = {
         Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
  };



  return axios.get(API_ENDPOINTS.CUSTOMER_INTAKE_DATA, { headers });
};

function* fetchCustomerIntakeDataWorker(action) {


  try {
    const response = yield call(intakeData, action.payload);


   yield put(fetchIntakeSuccess(response.data));
  } catch (error) {

    yield put(
      fetchIntakeFailure(error.message || "Failed to fetch intake data")
    );
  }
}

export default function* intakeSaga() {
  yield takeLatest(fetchIntakeRequest.type, fetchCustomerIntakeDataWorker);
}
