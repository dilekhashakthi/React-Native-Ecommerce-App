import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateCart } from "../../constants/CartUtils";

const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: "PayPal",
  itemsPrice: "0.00",
  shippingPrice: "0.00",
  taxPrice: "0.00",
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartFromStorage: (state, action) => {
      return action.payload;
    },

    addToCart: (state, action) => {
      const { user, rating, numReviews, reviews, ...item } = action.payload;
      const itemId = item._id || item.product;
      item.product = itemId;

      const existingItem = state.cartItems.find(
        (x) => (x._id || x.product) === itemId,
      );

      if (existingItem) {
        state.cartItems = state.cartItems.map((x) =>
          (x._id || x.product) === itemId ? item : x,
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      return updateCart(state);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => (x._id || x.product) !== action.payload,
      );
      return updateCart(state);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      AsyncStorage.setItem("cart", JSON.stringify(state));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      AsyncStorage.setItem("cart", JSON.stringify(state));
    },

    clearCartItems: (state) => {
      state.cartItems = [];
      AsyncStorage.setItem("cart", JSON.stringify(state));
    },

    restCart: (state) => {
      const newState = initialState;
      AsyncStorage.removeItem("cart");
      return newState;
    },
  },
});

export const {
  setCartFromStorage,
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  restCart,
} = cartSlice.actions;

export default cartSlice.reducer;
