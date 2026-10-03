import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  chatData: [],
  chatStatusCode: null,

  // ✅ MULTIPLE REQUESTS
  activeRequests:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("activeRequests")) || []
      : [],
};

const sendRequestSlice = createSlice({
  name: "send_request_chat",

  initialState,

  reducers: {
    sendChatRequest: (state) => {
      state.loading = true;
      state.chatStatusCode = 0;
    },

    sendChatReqAdd: (state, action) => {
      state.loading = false;
      state.chatStatusCode = 200;
      state.chatData = action.payload;
    },

    sendChatReqFail: (state) => {
      state.loading = false;
      state.chatStatusCode = 400;
    },

    resetCode: (state) => {
      state.chatStatusCode = null;
    },

    // ✅ ADD REQUEST
    addActiveRequest: (state, action) => {
      const exists = state.activeRequests.find(
        (item) => item.roomId === action.payload.roomId
      );

      // duplicate room avoid
      if (!exists) {
        state.activeRequests.push(action.payload);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "activeRequests",
            JSON.stringify(state.activeRequests)
          );
        }
      }
    },

    // ✅ REMOVE SINGLE REQUEST
    removeActiveRequest: (state, action) => {
      state.activeRequests = state.activeRequests.filter(
        (item) => item.roomId !== action.payload
      );

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "activeRequests",
          JSON.stringify(state.activeRequests)
        );
      }
    },

    // ✅ CLEAR ALL
    clearAllActiveRequests: (state) => {
      state.activeRequests = [];

      if (typeof window !== "undefined") {
        localStorage.removeItem("activeRequests");
      }
    },
  },
});

export const {
  sendChatRequest,
  sendChatReqAdd,
  sendChatReqFail,
  resetCode,

  addActiveRequest,
  removeActiveRequest,
  clearAllActiveRequests,
} = sendRequestSlice.actions;

export default sendRequestSlice.reducer;