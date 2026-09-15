import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { createReviewRequest,createReviewSuccess,createReviewFailure } from "../../reducer/auth/reviewSlice";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/apiConfig";







const reviewapi = (payload) =>{
 const token = getAuthHeaders(); 
  const headers = {
         Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
  };
return axios.post(API_ENDPOINTS.REVIEW_STORE,payload,{headers});



}

function* createReviewSaga(action) {
  try {
    const response = yield call(reviewapi, action.payload, {
      withCredentials: true, 
    });

    yield put(createReviewSuccess(response.data.review));
  } catch (error) {
    yield put(createReviewFailure(error.response?.data?.error || "Something went wrong"));
  }
}

export default function* reviewSaga() {
  yield takeLatest(createReviewRequest.type, createReviewSaga);
}
