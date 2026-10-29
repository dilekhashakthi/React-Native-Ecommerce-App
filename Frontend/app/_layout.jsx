import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider, useDispatch } from "react-redux";
import store, { persistor } from "../redux/store/store";
import Toast from "react-native-toast-message";
import { PersistGate } from "redux-persist/integration/react";
import { loadCartFromStorage } from "../redux/slices/cartSlice";

const RootLayoutNav = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadCartFromStorage());
  }, [dispatch]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(screens)" options={{ headerShown: false }} />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutNav />
        <Toast />
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
