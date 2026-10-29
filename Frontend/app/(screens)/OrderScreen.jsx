import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
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
// import { useRoute } from "@react-navigation/native"; ✅
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
  // const route = useRoute(); ✅✅
  // const { orderId } = route.params || {}; ✅✅

  // ✅✅
  const { orderId } = useLocalSearchParams();

  // --- State ---
  const [showWebViewModal, setShowWebViewModal] = useState(false);
  const webviewRef = useRef(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- RTK Query Hooks ---
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useGetOrderDetailsQuery(orderId);

  const [
    createPayPalOrder,
    { isLoading: isCreatingPayPalOrder, error: createPayPalError },
  ] = useCreatePaypalOrderMutation();
  const [
    capturePayPalOrder,
    { isLoading: isCapturingPayPalOrder, error: capturePayPalError },
  ] = useCapturePaypalOrderMutation();
  const [payOrder, { isLoading: isPayingOrder, error: payOrderError }] =
    usePayOrderMutation();
  const [deliverOrder, { isLoading: isLoadingDeliver, error: deliverError }] =
    useDeliverOrderMutation();

  const {
    data: paypalConfig,
    isLoading: isLoadingPayPalConfig,
    error: paypalConfigError,
  } = useGetPaypalClientIdQuery();

  // --- Redux State ---
  const { userInfo } = useSelector((state) => state.auth);

  // --- Effects & Memos ---
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
  }, [orderError, paypalConfig, order, deliverError]);

  const handlePaypalPress = useCallback(() => {
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
    if (!paypalConfig?.clientId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "PayPal configuration not loaded. Please try again.",
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
    setShowWebViewModal(true);
  }, [order, paypalConfig]);

  const paypalHtml = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Security-Policy" content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://*.paypal.com https://*.sandbox.paypal.com;">
        <title>PayPal Payment</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            padding: 20px;
          }
          #paypal-button-container {
            width: 100%;
            max-width: 400px;
            margin-bottom: 20px;
          }
          .status {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
            width: 100%;
            max-width: 400px;
            text-align: center;
          }
          .error { background-color: #ffebee; color: #c62828; }
          .success { background-color: #e8f5e9; color: #2e7d32; }
          .info { background-color: #e3f2fd; color: #1565c0; }
        </style>
      </head>
      <body>
        <div id="paypal-button-container"></div>
        <div id="status-container"></div>
        <script>
          // Show initial loading state
          function showStatus(message, type = 'info') {
            const container = document.getElementById('status-container');
            const div = document.createElement('div');
            div.className = 'status ' + type;
            div.textContent = message;
            container.innerHTML = ''; // Clear previous messages
            container.appendChild(div);
            if (type !== 'error') {
              setTimeout(() => div.remove(), 5000);
            }
          }

          showStatus('Loading PayPal...', 'info');

          // Handle navigation errors
          window.addEventListener('error', function(e) {
            if (e.target.tagName === 'IFRAME' || e.target.tagName === 'IMG') {
              // Ignore resource loading errors
              return;
            }
            showStatus('Navigation error occurred. Please try again.', 'error');
          }, true);

          // Load PayPal SDK with retry mechanism
          function loadPayPalSDK(retryCount = 0) {
            const script = document.createElement('script');
            script.src = "https://www.paypal.com/sdk/js?client-id=${paypalConfig?.clientId}&currency=USD&intent=capture";
            script.async = true;
            
            script.onload = function() {
              showStatus('PayPal SDK loaded successfully', 'success');
              initializePayPalButtons();
            };
            
            script.onerror = function() {
              if (retryCount < 3) {
                showStatus('Retrying PayPal SDK load...', 'info');
                setTimeout(() => loadPayPalSDK(retryCount + 1), 2000);
              } else {
                showStatus('Failed to load PayPal SDK. Please try again later.', 'error');
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYPAL_ERROR',
                  error: 'Failed to load PayPal SDK after multiple attempts'
                }));
              }
            };
            
            document.head.appendChild(script);
          }

          function initializePayPalButtons() {
            if (!window.paypal) {
              showStatus('PayPal SDK not initialized properly', 'error');
              return;
            }

            paypal.Buttons({
              createOrder: function(data, actions) {
                showStatus('Creating PayPal order...', 'info');
                return new Promise((resolve, reject) => {
                  window.resolveCreateOrderPromise = resolve;
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'REQUEST_PAYPAL_ORDER_ID'
                  }));
                  
                  setTimeout(() => {
                    if (window.resolveCreateOrderPromise) {
                      const error = 'PayPal Order ID request timed out';
                      showStatus(error, 'error');
                      reject(new Error(error));
                      window.resolveCreateOrderPromise = null;
                    }
                  }, 30000);
                });
              },
              
              onApprove: function(data, actions) {
                showStatus('Payment approved! Processing...', 'success');
                // Immediately notify React Native to close modal and show loading
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYPAL_APPROVED',
                  orderID: data.orderID,
                  payerID: data.payerID,
                  paymentID: data.paymentID
                }));
              },
              
              onCancel: function(data) {
                showStatus('Payment cancelled by user', 'info');
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYPAL_CANCELLED'
                }));
              },
              
              onError: function(err) {
                const errorMessage = err.message || err.toString();
                // Check if the error is related to authentication
                if (errorMessage.includes('blocked') || errorMessage.includes('authentication')) {
                  showStatus('Session expired. Please try again.', 'error');
                  // Close the WebView after a short delay
                  setTimeout(() => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'PAYPAL_AUTH_ERROR',
                      error: 'Authentication session expired'
                    }));
                  }, 2000);
                } else {
                  showStatus('Payment error: ' + errorMessage, 'error');
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAYPAL_ERROR',
                    error: errorMessage
                  }));
                }
              }
            }).render('#paypal-button-container')
              .catch(error => {
                showStatus('Failed to render PayPal buttons: ' + error, 'error');
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYPAL_ERROR',
                  error: 'Failed to render PayPal buttons: ' + error
                }));
              });
          }

          function handleReactNativeMessage(event) {
            try {
              const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
              if (data.type === 'SET_PAYPAL_ORDER_ID' && window.resolveCreateOrderPromise) {
                window.resolveCreateOrderPromise(data.orderID);
                window.resolveCreateOrderPromise = null;
                showStatus('Processing payment...', 'info');
              } else if (data.type === 'PAYPAL_ERROR_FROM_RN') {
                showStatus(data.error, 'error');
              }
            } catch (e) {
              showStatus('Communication error: ' + e.message, 'error');
            }
          }

          document.addEventListener('message', handleReactNativeMessage);
          window.addEventListener('message', handleReactNativeMessage);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.onMessage = handleReactNativeMessage;
          }

          // Start loading PayPal SDK
          loadPayPalSDK();
        </script>
      </body>
    </html>
  `,
    [paypalConfig?.clientId]
  );

  const onMessage = useCallback(
    async (event) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case "PAYPAL_APPROVED":
            // Close the modal and show loading indicator
            setShowWebViewModal(false);
            setIsProcessingPayment(true);

            try {
              const captureResponse = await capturePayPalOrder(
                data.orderID
              ).unwrap();

              if (captureResponse.status === "COMPLETED") {
                const paymentResult = {
                  orderId,
                  paymentId: captureResponse.id,
                  status: captureResponse.status,
                  update_time: new Date().toISOString(),
                  email_address:
                    captureResponse.payer?.email_address ||
                    "not.provided@example.com",
                };

                await payOrder({
                  orderId: orderId,
                  ...paymentResult,
                }).unwrap();

                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Payment successful! Your order has been placed.",
                  position: "top",
                  visibilityTime: 7000,
                });
                refetchOrder();
              } else {
                Toast.show({
                  type: "error",
                  text1: "Payment Failed",
                  text2: `PayPal payment capture failed. Status: ${
                    captureResponse.status || "Unknown"
                  }`,
                  position: "top",
                  visibilityTime: 7000,
                });
              }
            } catch (err) {
              const errorMessage =
                err?.data?.details ||
                err?.data?.message ||
                err.message ||
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
            break;

          case "PAYPAL_AUTH_ERROR":
            setShowWebViewModal(false);
            setIsProcessingPayment(false);
            Toast.show({
              type: "info",
              text1: "PayPal Session Expired",
              text2: "Please try the payment again.",
              position: "top",
              visibilityTime: 7000,
            });
            break;

          case "REQUEST_PAYPAL_ORDER_ID":
            if (!order || !order.totalPrice) {
              const errorMessage =
                "Order details or total price missing for PayPal order creation.";
              Toast.show({
                type: "error",
                text1: "Payment Error",
                text2: errorMessage,
                position: "top",
                visibilityTime: 7000,
              });
              webviewRef.current?.postMessage(
                JSON.stringify({
                  type: "PAYPAL_ERROR_FROM_RN",
                  error: errorMessage,
                })
              );
              setShowWebViewModal(false);
              return;
            }
            try {
              const res = await createPayPalOrder(order.totalPrice).unwrap();
              if (res.id) {
                webviewRef.current?.postMessage(
                  JSON.stringify({
                    type: "SET_PAYPAL_ORDER_ID",
                    orderID: res.id,
                  })
                );
              } else {
                const errorMessage =
                  "No PayPal ID received from backend create order response.";
                Toast.show({
                  type: "error",
                  text1: "Payment Error",
                  text2: errorMessage,
                  position: "top",
                  visibilityTime: 7000,
                });
                webviewRef.current?.postMessage(
                  JSON.stringify({
                    type: "PAYPAL_ERROR_FROM_RN",
                    error: errorMessage,
                  })
                );
                setShowWebViewModal(false);
              }
            } catch (err) {
              const errorMessage = `Failed to create PayPal order on backend: ${
                err?.data?.details ||
                err?.data?.message ||
                err?.data?.error ||
                err.message ||
                err.toString()
              }`;
              Toast.show({
                type: "error",
                text1: "Payment Error",
                text2: errorMessage,
                position: "top",
                visibilityTime: 7000,
              });
              webviewRef.current?.postMessage(
                JSON.stringify({
                  type: "PAYPAL_ERROR_FROM_RN",
                  error: errorMessage,
                })
              );
              setShowWebViewModal(false);
            }
            break;

          case "PAYPAL_CANCELLED":
            Toast.show({
              type: "info",
              text1: "Payment Cancelled",
              text2: "You cancelled the PayPal payment process.",
              position: "top",
              visibilityTime: 7000,
            });
            setShowWebViewModal(false);
            break;

          case "PAYPAL_ERROR":
            Toast.show({
              type: "error",
              text1: "Payment Error",
              text2: `An error occurred during PayPal payment: ${data.error}`,
              position: "top",
              visibilityTime: 7000,
            });
            setShowWebViewModal(false);
            break;

          default:
            Toast.show({
              type: "error",
              text1: "Error",
              text2:
                "An unexpected error occurred with the PayPal payment message.",
              position: "top",
              visibilityTime: 7000,
            });
            setShowWebViewModal(false);
        }
      } catch (e) {
        setIsProcessingPayment(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An unexpected error occurred processing the payment.",
          position: "top",
          visibilityTime: 7000,
        });
      }
    },
    [
      order,
      orderId,
      createPayPalOrder,
      capturePayPalOrder,
      payOrder,
      refetchOrder,
    ]
  );

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
          isCreatingPayPalOrder={isCreatingPayPalOrder}
          isCapturingPayPalOrder={isCapturingPayPalOrder}
          isPayingOrder={isPayingOrder}
          paypalConfigError={paypalConfigError}
          paypalConfig={paypalConfig}
          onPayWithPayPal={handlePaypalPress}
          onMarkAsDelivered={deliverHandler}
        />
      </ScrollView>

      <PayPalPayment
        visible={showWebViewModal}
        onClose={() => setShowWebViewModal(false)}
        paypalHtml={paypalHtml}
        onMessage={onMessage}
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
