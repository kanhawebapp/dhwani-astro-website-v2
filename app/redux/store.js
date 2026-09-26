// "use client";
// import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage"; 

// import { astrologyApi } from "./services/astrologyAPI";

// import authSlice from "./reducer/auth/authSlice";
// import astrologerSlice from "./reducer/astrologer/astrlogerSlice";
// import intakeSlice from "./reducer/auth/intakeSlice";
// import packSlice from "./reducer/payment/packSlice";
// import rechargeSlice from "./reducer/payment/rechargeSlice.js";
// import userSlice from "./reducer/auth/userSlice.js";
// import TempChat from "./reducer/chat/TempSlice.js";
// import sendRequestSlice from "./reducer/chat/sendRequestSlice.js";
// import chatCompletSlice from "./reducer/chat/chatCompletSlice.js";
// import ChatAlertSlice from "./reducer/chat/ChatAlertSlice.js";
// import lalkitabSlice from "./reducer/astrology-api/lalkitabSlice.js";
// import formInputReducer from "./reducer/formInput/formInputSlice.js";
// import CallingSlice from "./reducer/Calling/CallingSlice.js";
// //import CallingResponse from "./reducer/Calling/CallingResponse.js";
// import BookingReducer from "./reducer/Booking/BookingReducer.js";
// import PaymentSlice from "./reducer/Booking/PaymentSlice.js";
// import intakeStoreSlice from "./reducer/auth/intakeStoreSlice.js";
// import UserFollowSlice from "./reducer/astrologer/UserFollowSlice.js";
// import getFollowHistory from "./reducer/astrologer/getFollowHistory.js";
// import callCompletSlice from "./reducer/Calling/callCompletSlice.js";
// import phonecallSlice from "./reducer/Calling/phonecallSlice.js";

// // ammy slice reducer 
// import daUserFormReducer from "./services/daUserFormSlice";
// import idSlice from "./reducer/chat/idSlice.js";

// import chatButton from "./reducer/chat/chatButton.js";
// import getIntakeData from "./reducer/intake/getIntakeData.js";

// import AstrologerDetail from "./reducer/astrologer/AstrologerDetail.js";

// import sendCallRequestSlice from "./reducer/call/sendCallRequestSlice.js";
// import reviewSlice from "./reducer/auth/reviewSlice.js";
// import giftSlice from "./reducer/giftSlice/giftSlice.js";
// import getCouponList from "./reducer/coupon/getCouponList.js";



// const daUserFormPersistConfig = {
//   key: "daUserForm",
//   storage,
//   whitelist: [
//     "name",
//     "day",
//     "month",
//     "year",
//     "hour",
//     "min",
//     "lat",
//     "lon",
//     "tzone",
//     "birthplace"
//   ],
// };




// const userDetailPersistConfig = {
//   key: "getuserDetail",
//   storage,
// }

// const userIntakePersistConfig = {
//   key: "intake",
//   storage,
// };

// // const rechagepackage = {
// //   key: "packrecharge",
// //   storage,
// // }

// const persistedDaUserFormReducer = persistReducer(daUserFormPersistConfig, daUserFormReducer);
// const persistedUserReducer = persistReducer(userDetailPersistConfig, userSlice);


// const persistedUserIntake = persistReducer(userIntakePersistConfig, intakeSlice);




// const rootReducer = combineReducers({
//   auth: authSlice,
//  astrologerReducer: astrologerSlice,
//   intake: persistedUserIntake,
//   packrecharge: packSlice,
//   recharge_payment: rechargeSlice,
//   getuserDetail: persistedUserReducer,
//   temp_chat: TempChat,
//   send_request_chat: sendRequestSlice,
//   chat_completed: chatCompletSlice,
//   chatAlert: ChatAlertSlice,
//   formInput: formInputReducer,
//   lalkitab: lalkitabSlice,
//   callingreducer: CallingSlice,
//   //callingresponse: CallingResponse,
//   bookingserver: BookingReducer,
//   payment: PaymentSlice,
//   intakefrom: intakeStoreSlice,
//   followastrologer: UserFollowSlice,
//   getfollowhistory: getFollowHistory,
//   call_completed: callCompletSlice,
//   phonecall: phonecallSlice,

//   id_slice:idSlice,

//  daUserForm: persistedDaUserFormReducer, 
//  chatbutton:chatButton,
//  getintakedata:getIntakeData,
//  astrologerdetail:AstrologerDetail,
//  send_request_call:sendCallRequestSlice,
//  review:reviewSlice,
//  gift:giftSlice,
//  getcoupon:getCouponList,

//   [astrologyApi.reducerPath]: astrologyApi.reducer
// });





// export const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       thunk: true, 
//       serializableCheck: false,
//     }).concat(astrologyApi.middleware)
// });



// export const persistor = persistStore(store);
