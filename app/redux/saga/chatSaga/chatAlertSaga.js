import { call, put, takeLatest } from "redux-saga/effects";
import { setChatAlertData, setChatAlertLoading} from "../../reducer/chat/ChatAlertSlice";




function*fetchChatAlertData(action) {
  try {
  const { data } = action.payload;



yield put(setChatAlertData(action.payload));
} catch (error) {
    throw new Error("Failed to fetch chat alert data");
  }
}

  
export function* chatAlertSaga() {
yield takeLatest(setChatAlertLoading.type, fetchChatAlertData);
}