import axios from "axios";
import { call, put, takeLatest,select } from "redux-saga/effects";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/apiConfig";
import {
  RequestAstrologerDetail,
  getAstrologerData,
  getFailAstrologer,
} from "../../reducer/astrologer/AstrologerDetail";


const astrologerapi = (payload) => {
 return axios.get(API_ENDPOINTS.ASTROLOGER_DETAIL, {
 params: payload, 
  });
};


function* getAstrologerDetail(action) {
  try {
const existingData = yield select((state) => state.astrologerdetail.astrologerdata);



if (existingData && existingData.length > 0) {
  return;
}

 const { astro_id } = action.payload;
const response = yield call(astrologerapi, { astro_id });
 yield put(getAstrologerData(response?.data?.profile));
  } catch (error) {



    yield put(getFailAstrologer(error?.message));
  }
}


export default function* AstrologerDetailSaga() {
  yield takeLatest(RequestAstrologerDetail.type, getAstrologerDetail);
}
