import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  submitFormRequest,
  submitFormSuccess,
  submitFormFailure,
} from "../../reducer/astrology-api/kundliSlice";
import { API_ENDPOINTS } from "../../config/apiConfig";

// Astrology API credentials
const USER_ID = "618742";
const API_KEY = "7c20599eb23be276e8c8ace8bef880c2";

// Encode for Basic Auth header
const basicAuth = "Basic " + btoa(`${USER_ID}:${API_KEY}`);

function* handleKundliFormSubmit(action) {
  try {
    const payload = action.payload;

    const formattedData = {
      day: formData.day,
      month: formData.month,
      year: formData.year,
      hour: formData.hour,
      min: formData.min,
      lat: formData.lat,
      lon: formData.lon,
      tzone: formData.tzone,
    };

    const response = yield call(axios.post, API_ENDPOINTS.JANAM_KUNDLI, formattedData, { headers });

    yield put(submitFormSuccess({ formData, responseData: response.data }));
  } catch (error) {
    console.error("Error in saga:", error);
    yield put(submitFormFailure(error?.response?.data?.message || error.message));
  }
}

// Watcher saga
export default function* kundliSaga() {
  yield takeLatest(submitFormRequest.type, handleKundliFormSubmit);
}
