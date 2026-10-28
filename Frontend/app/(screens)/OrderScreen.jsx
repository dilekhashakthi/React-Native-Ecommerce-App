import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { BlurView } from "@react-native-community/blur";

import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useCreatePaypalOrderMutation,
  useCapturePaypalOrderMutation,
  useGetPaypalClientIdQuery,
  useDeliverOrderMutation,
} from "../../redux/slices/ordersApiSlice";
import { Colors } from "../../constants/Utils";

import OrderDetails from "../../components/OrderDetails";
import PaymentStatus from "../../components/PaymentStatus";
import OrderItems from "../../components/OrderItems";
import OrderSummary from "../../components/OrderSummary";
import PayPalPayment from "../../components/PayPalPayment";

export default function OrderScreen() {
  const { orderId } = useLocalSearchParams();

  // --- State ---
  const [showWebViewModal, setShowWebViewModal] = useState(false);
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const webviewRef = useRef(null);

  // --- RTK Query Hooks ---
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useGetOrderDetailsQuery(orderId);

  const [
    createPayPalOrder,
    { isLoading: isCreatingPayPalOrder },
  ] = useCreatePaypalOrderMutation();

  const [
    capturePayPalOrder,
    { isLoading: isCapturingPayPalOrder },
  ] = useCapturePaypalOrderMutation();

  const [payOrder, { isLoading: isPayingOrder }] = usePayOrderMutation();

  const [deliverOrder, { isLoading: isLoadingDeliver, error: deliverError }] =
    useDeliverOrderMutation();

  const {
    data: paypalConfig,
    isLoading: isLoadingPayPalConfig,
    error: paypalConfigError,
  } = useGetPaypalClientIdQuery();

  // --- Redux State ---
  const { userInfo } = useSelector((state) => state.auth);

  // --- Effects ---
  useEffect(() => {
    if (orderError) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: orderError?.data?.message || "Failed to load order details.",
        position: "top",
        visibilityTime: 7000,
      });
    }
    if (deliverError) {
      Toast.show({
        type: "error",
        text1: "Delivery Error",
        text2:
          deliverError?.data?.message || "Failed to mark order as delivered.",
        position: "top",
        visibilityTime: 7000,
      });
    }
  }, [orderError, deliverError]);

  /**
   * Step 1 — User taps "Pay with PayPal".
   * Creates the order on the backend and gets the PayPal-hosted checkout URL.
   * Opens the WebView modal with that URL.
   */
  const handlePaypalPress = useCallback(async () => {
    if (!order) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Order details not loaded. Please try again.",
        position: "top",
        visibilityTime: 7000,
      });
      return;
    }
    if (!order.totalPrice || order.totalPrice <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Invalid order amount. Please try again.",
        position: "top",
        visibilityTime: 7000,
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await createPayPalOrder(order.totalPrice).unwrap();

      // The backend returns approvalUrl (or it's in the links array)
      const approvalUrl =
        res.approvalUrl ||
        res.links?.find((l) => l.rel === "approve")?.href;

      if (!approvalUrl) {
        throw new Error(
          "PayPal did not return a checkout URL. Please try again."
        );
      }

      setPaypalApprovalUrl(approvalUrl);
      setShowWebViewModal(true);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "PayPal Error",
        text2:
          err?.data?.message ||
          err?.data?.details ||
          err?.message ||
          "Failed to start PayPal checkout. Please try again.",
        position: "top",
        visibilityTime: 7000,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  }, [order, createPayPalOrder]);

  /**
   * Step 2 — PayPal redirects to the return URL after the user approves.
   * The WebView intercepts this URL and calls this handler with the PayPal order token.
   * We capture the payment and mark the order as paid.
   */
  const handlePaypalApproved = useCallback(
    async (paypalOrderId) => {
      setShowWebViewModal(false);
      setPaypalApprovalUrl(null);
      setIsProcessingPayment(true);

      try {
        const captureResponse = await capturePayPalOrder(paypalOrderId).unwrap();

        if (captureResponse.status === "COMPLETED") {
          await payOrder({
            orderId,
            paymentId: captureResponse.id,
            status: captureResponse.status,
            update_time:
              captureResponse.update_time || new Date().toISOString(),
            email_address:
              captureResponse.payer?.email_address ||
              captureResponse.payer?.emailAddress ||
              "not.provided@example.com",
          }).unwrap();

          Toast.show({
            type: "success",
            text1: "Payment Successful!",
            text2: "Your order has been paid.",
            position: "top",
            visibilityTime: 7000,
          });
          refetchOrder();
        } else {
          Toast.show({
            type: "error",
            text1: "Payment Failed",
            text2: `PayPal payment status: ${captureResponse.status || "Unknown"}`,
            position: "top",
            visibilityTime: 7000,
          });
        }
      } catch (err) {
        const errorMessage =
          err?.data?.details ||
          err?.data?.message ||
          err?.message ||
          "Unknown error occurred";
        Toast.show({
          type: "error",
          text1: "Payment Error",
          text2: `Failed to capture PayPal payment: ${errorMessage}`,
          position: "top",
          visibilityTime: 7000,
        });
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [orderId, capturePayPalOrder, payOrder, refetchOrder]
  );

  /**
   * Step 2 (alt) — User cancelled on the PayPal page.
   */
  const handlePaypalCancelled = useCallback(() => {
    setShowWebViewModal(false);
    setPaypalApprovalUrl(null);
    Toast.show({
      type: "info",
      text1: "Payment Cancelled",
      text2: "You cancelled the PayPal payment.",
      position: "top",
      visibilityTime: 5000,
    });
  }, []);

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap();
      refetchOrder();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Order marked as delivered!",
        position: "top",
        visibilityTime: 7000,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Delivery Error",
        text2: err?.data?.message || "Could not mark order as delivered.",
        position: "top",
        visibilityTime: 7000,
      });
    }
  };

  if (isLoadingOrder) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (orderError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Error: {orderError?.data?.message || "Failed to load order details"}
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Order not found or no data available.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.mainTitle}>Order {order._id}</Text>

        <OrderDetails order={order} />
        <PaymentStatus order={order} />
        <OrderItems items={order.orderItems} />
        <OrderSummary
          order={order}
          userInfo={userInfo}
          isLoadingDeliver={isLoadingDeliver}
          isLoadingPayPalConfig={isLoadingPayPalConfig}
          isCreatingPayPalOrder={isCreatingPayPalOrder || isProcessingPayment}
          isCapturingPayPalOrder={isCapturingPayPalOrder}
          isPayingOrder={isPayingOrder}
          paypalConfigError={paypalConfigError}
          paypalConfig={paypalConfig}
          onPayWithPayPal={handlePaypalPress}
          onMarkAsDelivered={deliverHandler}
        />
      </ScrollView>

      {/* PayPal WebView Modal — opens the real PayPal checkout page */}
      <PayPalPayment
        visible={showWebViewModal}
        onClose={() => {
          setShowWebViewModal(false);
          setPaypalApprovalUrl(null);
        }}
        approvalUrl={paypalApprovalUrl}
        onPaymentApproved={handlePaypalApproved}
        onPaymentCancelled={handlePaypalCancelled}
        webviewRef={webviewRef}
      />

      {isProcessingPayment && (
        <View style={styles.loadingOverlay}>
          {Platform.OS === "ios" ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={5}
            />
          ) : (
            <View style={styles.androidBlur} />
          )}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Processing your payment...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 24,
    textAlign: "start",
  },
  loadingText: {
    marginTop: 10,
    color: Colors.secondaryTextColor,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  errorText: {
    color: Colors.danger,
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  androidBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
