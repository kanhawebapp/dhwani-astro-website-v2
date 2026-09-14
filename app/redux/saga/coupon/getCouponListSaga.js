import axios from "axios";
import {call,put,takeLatest} from "redux-saga/effects";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/apiConfig";
import { sendRequestCoupon,fetchCouponList,fetchFailCouponList } from "../../reducer/coupon/getCouponList";





const couponlist = () =>{
    const token = getAuthHeaders();
  const headers = {
         Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
  };
    return axios.get(API_ENDPOINTS.COUPON_LIST, { headers })
}



function* getCouponList(){
    try {

const response= yield call(couponlist);

if(response?.status === 200){
    yield put(fetchCouponList(response?.data))
}else{
    yield put(fetchFailCouponList(response?.data))

}
 } catch (error) {
console.log("error",error?.message);
yield put(fetchFailCouponList(error?.message)) 
    }

}



export default  function* getCouponListSaga(){
   yield takeLatest(sendRequestCoupon.type,getCouponList);
}