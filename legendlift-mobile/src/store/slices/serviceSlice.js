import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_CONFIG } from '../../constants';

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async ({ token, filters = {} }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/services/schedules?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch services');
    }
  }
);

export const fetchTodayServices = createAsyncThunk(
  'services/fetchTodayServices',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/services/schedules/today`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch today services');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async ({ token, serviceId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/services/schedules/${serviceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch service');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ token, serviceId, serviceData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/services/schedules/${serviceId}`,
        serviceData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update service');
    }
  }
);

export const createServiceReport = createAsyncThunk(
  'services/createServiceReport',
  async ({ token, reportData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/services/reports`,
        reportData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create service report');
    }
  }
);

export const updateServiceReport = createAsyncThunk(
  'services/updateServiceReport',
  async ({ token, reportId, reportData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/services/reports/${reportId}`,
        reportData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update service report');
    }
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    todayServices: [],
    selectedService: null,
    activeReport: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    setActiveReport: (state, action) => {
      state.activeReport = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch today services
      .addCase(fetchTodayServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayServices.fulfilled, (state, action) => {
        state.loading = false;
        state.todayServices = action.payload;
      })
      .addCase(fetchTodayServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch service by ID
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update service
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        state.selectedService = action.payload;
      })
      // Create service report
      .addCase(createServiceReport.fulfilled, (state, action) => {
        state.activeReport = action.payload;
      })
      // Update service report
      .addCase(updateServiceReport.fulfilled, (state, action) => {
        state.activeReport = action.payload;
      });
  },
});

export const { clearError, clearSelectedService, setActiveReport } = serviceSlice.actions;
export default serviceSlice.reducer;
