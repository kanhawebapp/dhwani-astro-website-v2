// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   formData: {
//     namee: '',
//     day: '',
//     month: '',
//     year: '',
//     birthHour: '',
//     birthMinute: '',
//     birthplace: '',
//     type: 'Cheiro / Chaldean',
//   },
// };

// const formInputSlice = createSlice({
//   name: 'formInput',
//   initialState,
//   reducers: {
//     setFormData: (state, action) => {
//       state.formData = { ...state.formData, ...action.payload };
//     },
//     resetFormData: (state) => {
//       state.formData = initialState.formData;
//     },
//   },
// });


// export const { setFormData, resetFormData } = formInputSlice.actions;
// export const selectFormData = (state) => state.formInput.formData;
// export default formInputSlice.reducer;