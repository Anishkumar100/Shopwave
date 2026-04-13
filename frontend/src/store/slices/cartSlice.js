import { createSlice } from '@reduxjs/toolkit';

const cartFromStorage = JSON.parse(localStorage.getItem('cart')) || [];
const shippingFromStorage = JSON.parse(localStorage.getItem('shippingAddress')) || {};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: cartFromStorage,
    shippingAddress: shippingFromStorage,
    paymentMethod: 'cashfree',
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.cartItems.find(x => x._id === item._id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, item.stock);
      } else {
        state.cartItems.push(item);
      }
      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(x => x._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find(x => x._id === id);
      if (item) item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cart');
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, saveShippingAddress, setPaymentMethod } = cartSlice.actions;

export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);

export default cartSlice.reducer;
