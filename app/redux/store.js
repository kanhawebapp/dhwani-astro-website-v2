"use client";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 

import { astrologyApi } from "./services/astrologyAPI";


import sendRequestSlice from "./reducer/chat/sendRequestSlice.js";

import formInputReducer from "./reducer/formInput/formInputSlice.js";

import daUserFormReducer from "./services/daUserFormSlice";

const daUserFormPersistConfig = {
  key: "daUserForm",
  storage,
  whitelist: [
    "name",
    "day",
    "month",
    "year",
    "hour",
    "min",
    "lat",
    "lon",
    "tzone",
    "birthplace"
  ],
};


const userIntakePersistConfig = {
  key: "intake",
  storage,
};

const persistedDaUserFormReducer = persistReducer(daUserFormPersistConfig, daUserFormReducer);

const rootReducer = combineReducers({
  send_request_chat: sendRequestSlice,
  formInput: formInputReducer,

 daUserForm: persistedDaUserFormReducer, 

  [astrologyApi.reducerPath]: astrologyApi.reducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true, 
      serializableCheck: false,
    }).concat(astrologyApi.middleware)
});



export const persistor = persistStore(store);
