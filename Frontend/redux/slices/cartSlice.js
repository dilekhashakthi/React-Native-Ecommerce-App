import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateCart } from "../../constants/CartUtils";
import { REHYDRATE } from "redux-persist";

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
      if (action.payload) {
        return {
          ...state,
          ...action.payload,
          cartItems: action.payload.cartItems || [],
        };
      }
      return state;
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
      AsyncStorage.setItem("cart", JSON.stringify(state)).catch((err) =>
        console.log("Error saving shipping address:", err)
      );
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      AsyncStorage.setItem("cart", JSON.stringify(state)).catch((err) =>
        console.log("Error saving payment method:", err)
      );
    },

    clearCartItems: (state) => {
      state.cartItems = [];
      AsyncStorage.setItem("cart", JSON.stringify(state)).catch((err) =>
        console.log("Error clearing cart items:", err)
      );
    },

    restCart: (state) => {
      const newState = initialState;
      AsyncStorage.removeItem("cart").catch((err) =>
        console.log("Error resetting cart:", err)
      );
      return newState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      const persistedCart = action.payload?.cart;
      if (
        persistedCart &&
        Array.isArray(persistedCart.cartItems) &&
        persistedCart.cartItems.length > 0
      ) {
        return {
          ...state,
          ...persistedCart,
        };
      }
      return state;
    });
  },
});

export const loadCartFromStorage = () => async (dispatch) => {
  try {
    const storedCart = await AsyncStorage.getItem("cart");
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      if (
        parsedCart &&
        Array.isArray(parsedCart.cartItems) &&
        parsedCart.cartItems.length > 0
      ) {
        dispatch(setCartFromStorage(parsedCart));
      }
    }
  } catch (error) {
    console.log("Error loading cart from storage:", error);
  }
};

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
