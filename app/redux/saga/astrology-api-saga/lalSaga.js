// import { all, call, put, takeLatest } from 'redux-saga/effects';
// import {
//   submitFormRequest,
//   submitFormSuccess,
//   submitFormFailure
// } from '../../reducer/astrology-api/lalkitabSlice';
// import axios from 'axios';
// import { API_ENDPOINTS } from '../../config/apiConfig';
// import { localStorageHelper } from '../../../../src/helpers/localStorageHelper';


// const sendapi = (payload) => {


//   return axios.post(API_ENDPOINTS.LAL_KITAB, payload);

// }
// const USER_ID = "618742";
// const API_KEY = "7c20599eb23be276e8c8ace8bef880c2";
// // NEXT_PUBLIC_ASTROLOGY_API_USERNAME=618742
// // NEXT_PUBLIC_ASTROLOGY_API_PASSWORD=7c20599eb23be276e8c8ace8bef880c2

// // Encode for Basic Auth header
// const basicAuth = "Basic " + btoa(`${USER_ID}:${API_KEY}`);

// function* handleFormSubmit(action) {
//   try {
//     const { formData, slug } = action.payload;

//     console.log("Form Data:", formData); 

//     const res = yield call(axios.post, API_ENDPOINTS.LAL_KITAB, payload, {
//       headers: {
//         "Authorization": basicAuth,
//         "Content-Type": "application/json"
//       }
//     });

//     if (res.data) {
//       yield put(submitFormSuccess({ formData, responseData: res.data }));
//     } else {
//       throw new Error('No data received');
//     }
//   } catch (err) {
//     yield put(submitFormFailure(err.message));
//   }
// }

// export default function* lalSaga() {
//   yield all([
//     takeLatest(submitFormRequest.type, handleFormSubmit),
//   ]);
// }

import { all, call, put, takeLatest } from 'redux-saga/effects';
import {
  submitFormRequest,
  submitFormSuccess,
  submitFormFailure,
} from '../../reducer/astrology-api/lalkitabSlice';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';

// Basic Auth Details
const USER_ID = '618742';
const API_KEY = '7c20599eb23be276e8c8ace8bef880c2';
const basicAuth = 'Basic ' + btoa(`${USER_ID}:${API_KEY}`);

// Worker Saga
function* handleFormSubmit(action) {
  try {
    const { formData } = action.payload;

    const response = yield call(axios.post, API_ENDPOINTS.LAL_KITAB, formData, {
      headers: {
        Authorization: basicAuth,
        'Content-Type': 'application/json',
      },
    });

    if (response.data) {
      yield put(submitFormSuccess({ formData, responseData: response.data }));
    } else {
      throw new Error('No data received');
    }
  } catch (error) {
    console.error('Saga Error:', error);
    yield put(submitFormFailure(error.message));
  }
}

// Watcher Saga
export default function* lalSaga() {
  yield all([takeLatest(submitFormRequest.type, handleFormSubmit)]);
}
