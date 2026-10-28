import React, { useCallback } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "../constants/Utils";

// These must match the return/cancel URLs set in the backend's create-order call.
const RETURN_URL_MARKER = "paypal-return";
const CANCEL_URL_MARKER = "paypal-cancel";

/**
 * Parse query parameters from a URL string without relying on URLSearchParams
 * (not available in all RN environments).
 */
function parseQueryParams(url) {
  const queryString = url.split("?")[1] || "";
  const params = {};
  queryString.split("&").forEach((pair) => {
    const eqIdx = pair.indexOf("=");
    if (eqIdx > -1) {
      const key = decodeURIComponent(pair.slice(0, eqIdx));
      const value = decodeURIComponent(pair.slice(eqIdx + 1));
      params[key] = value;
    }
  });
  return params;
}

const PayPalPayment = ({
  visible,
  onClose,
  approvalUrl,
  onPaymentApproved,
  onPaymentCancelled,
  webviewRef,
}) => {
  /**
   * Central handler for any URL the WebView is about to visit.
   * Returns true if the URL was handled (caller should block WebView from loading it).
   */
  const handleUrl = useCallback(
    (url) => {
      if (!url) return false;

      if (url.includes(RETURN_URL_MARKER)) {
        // PayPal approved — extract the token (= PayPal order ID) from query params
        const params = parseQueryParams(url);
        const paypalOrderId = params.token;
        if (paypalOrderId && onPaymentApproved) {
          onPaymentApproved(paypalOrderId);
        }
        return true;
      }

      if (url.includes(CANCEL_URL_MARKER)) {
        onPaymentCancelled && onPaymentCancelled();
        return true;
      }

      return false;
    },
    [onPaymentApproved, onPaymentCancelled]
  );

  /**
   * Primary intercept — fires before the page loads.
   * Return false to block navigation to our redirect URLs.
   */
  const handleShouldStartLoad = useCallback(
    (request) => {
      const handled = handleUrl(request.url);
      return !handled; // false = don't load this URL
    },
    [handleUrl]
  );

  /**
   * Fallback intercept — fires after navigation state changes.
   * Catches any redirects that onShouldStartLoadWithRequest might miss on Android.
   */
  const handleNavigationStateChange = useCallback(
    (navState) => {
      if (navState.url) {
        handleUrl(navState.url);
      }
    },
    [handleUrl]
  );

  if (!approvalUrl) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom"]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Complete Payment</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <AntDesign
              style={styles.closeButtonIcon}
              name="close-circle"
              size={27}
            />
          </Pressable>
        </View>

        <View style={styles.webViewModalContainer}>
          <WebView
            ref={webviewRef}
            // Load the real PayPal-hosted checkout page directly — no JS SDK embedding
            source={{ uri: approvalUrl }}
            userAgent={
              Platform.OS === "android"
                ? "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                : "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
            }
            javaScriptEnabled={true}
            domStorageEnabled={true}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            javaScriptCanOpenWindowsAutomatically={true}
            setSupportMultipleWindows={false}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading PayPal...</Text>
              </View>
            )}
            // Primary: intercept before the WebView loads the redirect URL
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            // Fallback: catch redirects that slipped through on Android
            onNavigationStateChange={handleNavigationStateChange}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              // Ignore errors caused by blocking our redirect URLs
              if (
                nativeEvent.url &&
                (nativeEvent.url.includes(RETURN_URL_MARKER) ||
                  nativeEvent.url.includes(CANCEL_URL_MARKER))
              ) {
                return;
              }
              console.warn("PayPal WebView error:", nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { statusCode, url } = syntheticEvent.nativeEvent;
              // Ignore errors from our redirect sentinel URLs
              if (
                url &&
                (url.includes(RETURN_URL_MARKER) ||
                  url.includes(CANCEL_URL_MARKER))
              ) {
                return;
              }
              if (statusCode >= 400 && url && url.includes("paypal.com")) {
                console.warn(`PayPal HTTP error ${statusCode} at ${url}`);
              }
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  closeButton: {
    padding: 8,
    borderRadius: 5,
  },
  closeButtonIcon: {
    color: Colors.white,
  },
  webViewModalContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.secondaryTextColor,
  },
});

export default PayPalPayment;
