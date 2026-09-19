import { localStorageHelper } from "../../../src/helpers/localStorageHelper";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5002/api/";
const API_AUTH_URL = process.env.NEXT_PUBLIC_API_AUTH_URL || "http://localhost:5003/api/";
const PAYMENT_MICRO = process.env.NEXT_PUBLIC_PAYMENT_MICRO || "http://localhost:5005/api/";
const CHAT_MICRO = process.env.NEXT_PUBLIC_CHAT_MICRO || "http://localhost:8001/api/";
const ASTROLOGY_API_BASE_URL = process.env.NEXT_PUBLIC_ASTROLOGY_API_BASE_URL || "https://json.astrologyapi.com/";
export const customer_url =  process.env.customer_url || "https://customer-dashboard-1-1piy.onrender.com/dashboard";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const graphqlEndpoint = `${BASE_URL}/userAuth/graphql` ;

// const httpLink = new HttpLink({
//   uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5003/graphql",
// });
export const API_ENDPOINTS = {
  CHAT_HISTORY: `${API_BASE_URL}expertchathistory?expert_id=1191`,
  CALL_HISTORY: `${API_BASE_URL}call-history`,
  LOGIN_DASHBOARD: `${API_BASE_URL}login`,
  CUSTOMER_LOGIN: `${API_AUTH_URL}auth/login`,
  ASTROLOGER_LIST: ``,
  CUSTOMER_INTAKE_DATA: `${API_AUTH_URL}user/intake_data`,
  RECHARGE_PACKAGE: `${PAYMENT_MICRO}recharge/pack`,
  PAYMENT_DETAIL: `${PAYMENT_MICRO}payment/detail`,
  OTP_VERIFY: `${API_AUTH_URL}auth/verifyotp`,
  GET_USER: `${API_AUTH_URL}user/getDetail`,
  CHAT_TEMP_ORDER: `${CHAT_MICRO}chat/temp`,
  NEW_CHAT_REQUEST: `${CHAT_MICRO}chat/request`,
  COMPLETED_CHAT: `${CHAT_MICRO}chat/completed`,
  LAL_KITAB: `${ASTROLOGY_API_BASE_URL}lalkitab`,
  Calling_Astrologer: `${API_BASE_URL}astrologer/calling`,
  Calling_Response: `${API_BASE_URL}astrologer/calling_detail`,
  SERVICE_BOOKING: `${PAYMENT_MICRO}service/booking`,
  SERVICE_BOOKING_PAYMENT: `${PAYMENT_MICRO}service/payment`,
  INTAKE_FROM_SAVE: `${API_AUTH_URL}user/intakefrom`,
  AstrologerFollow: `${API_BASE_URL}astrologer_follow`,
  AstrologerFollowHistory: `${API_BASE_URL}get_follow_history`,
  COMPLETED_CALL: `${CHAT_MICRO}call_complted`,
  COMPLETED_PHONECALL: `${CHAT_MICRO}phonecall_complted`,
  ASTROLOGER_DETAIL:`${API_BASE_URL}get_astrologer_profile`,
  NEW_CALL_REQUEST: `${CHAT_MICRO}call/request`,
  REVIEW_STORE: `${API_AUTH_URL}review_save`,
  GET_REVIEW : `${API_AUTH_URL}astrologer_review_site`,
  GIFT_STORE:`${API_AUTH_URL}giftsend`,
  USERNAME_UPDATE : `${API_AUTH_URL}auth/username`,
  COUPON_LIST:`${PAYMENT_MICRO}couponlist`
};





export const getAuthHeaders = () => {
  if (typeof window === "undefined") return null; 

  try {
    let user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user?.name;
    return token;
  } catch (err) {
    console.error("getAuthHeaders error:", err);
    return null;
  }
};

