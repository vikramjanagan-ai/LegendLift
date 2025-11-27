import { createSlice } from '@reduxjs/toolkit';

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    selectedPayment: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
