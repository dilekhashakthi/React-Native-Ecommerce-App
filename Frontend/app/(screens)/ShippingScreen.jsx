import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { saveShippingAddress } from "../../redux/slices/cartSlice";
import { Colors } from "../../constants/Utils";

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [formData, setFormData] = useState({
    address: shippingAddress.address || "",
    city: shippingAddress.city || "",
    postalCode: shippingAddress.postalCode || "",
    country: shippingAddress.country || "",
  });

  const dispatch = useDispatch();
  const router = useRouter();

  const submitHandler = () => {
    Keyboard.dismiss();

    if (!formData.address || !formData.city || !formData.postalCode || !formData.country) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all shipping details to continue",
        position: "top",
        visibilityTime: 7000,
      });
      return;
    }

    dispatch(
      saveShippingAddress({
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      }),
    );
    router.push("(screens)/PaymentScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Shipping</Text>
          <View style={styles.actualFormContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Address"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, address: text }))
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter City"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, city: text }))
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Postal Code"
                value={formData.postalCode}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, postalCode: text }))
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Country"
                value={formData.country}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, country: text }))
                }
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={submitHandler}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ShippingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  actualFormContainer: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "start",
    padding: 20,
  },
  inputContainer: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textColor,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textColor,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
