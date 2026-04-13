import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const res = await API.post('/orders', orderData);
    return res.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyOrders = createAsyncThunk('orders/myOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/orders/myorders');
    return res.data.orders;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await API.get(`/orders/${id}`);
    return res.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/orders/admin');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    order: null,
    allOrders: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: { clearOrderState: (state) => { state.success = false; state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; })
      .addCase(createOrder.fulfilled, (state, action) => { state.loading = false; state.order = action.payload; state.success = true; })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.orders = action.payload; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.order = action.payload; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.allOrders = action.payload.orders; });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
