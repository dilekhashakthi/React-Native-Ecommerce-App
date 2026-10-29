import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "../constants/Utils";

const PayPalPayment = ({
  visible,
  onClose,
  paypalHtml,
  onMessage,
  webviewRef,
}) => {
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
              name="closecircle"
              size={27}
            />
          </Pressable>
        </View>
        <View style={styles.webViewModalContainer}>
          <WebView
            ref={webviewRef}
            originWhitelist={["*"]}
            source={{
              html: paypalHtml,
              baseUrl: "https://www.paypal.com",
            }}
            onMessage={onMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            thirdPartyCookiesEnabled={true}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccessFromFileURLs={true}
            mixedContentMode="always"
            style={styles.webView}
            startInLoadingState={true}
            onError={(syntheticEvent) => {
              Alert.alert(
                "Error",
                "Failed to load PayPal payment. Please try again."
              );
            }}
            onHttpError={(syntheticEvent) => {
              Alert.alert(
                "Error",
                `Payment error: ${syntheticEvent.nativeEvent.statusCode}`
              );
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
});

export default PayPalPayment;
