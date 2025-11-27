import { createSlice } from '@reduxjs/toolkit';

const contractSlice = createSlice({
  name: 'contracts',
  initialState: {
    contracts: [],
    selectedContract: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = contractSlice.actions;
export default contractSlice.reducer;
