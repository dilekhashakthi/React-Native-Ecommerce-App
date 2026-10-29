import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useProfileMutation } from "../../redux/slices/userApiSlice";
import { setCredentials } from "../../redux/slices/authSlice";
import { Colors } from "../../constants/Utils";
import Message from "../../components/Message";
import Toast from "react-native-toast-message";

const AccountInformation = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        name: userInfo.name || "",
        email: userInfo.email || "",
      }));
    }
  }, [userInfo]);

  const submitHandler = async () => {
    Keyboard.dismiss();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
        position: "top",
        visibilityTime: 4000,
      });
      return;
    }

    try {
      const updateData = {
        _id: userInfo?._id,
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await updateProfile(updateData).unwrap();

      dispatch(setCredentials({ ...response }));
      setError("");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully",
        position: "top",
        visibilityTime: 7000,
      });
    } catch (error) {
      const errorMsg =
        error?.data?.message ||
        error?.data?.Message ||
        error?.error ||
        "Failed to update profile";
      setError(errorMsg);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: errorMsg,
        position: "top",
        visibilityTime: 7000,
      });
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="arrow-back-circle" size={40} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Account Information</Text>
          </View>

          <View style={styles.formContainer}>
            {error ? (
              <Message variant="error">{error}</Message>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                placeholderTextColor={Colors.secondaryTextColor}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor={Colors.secondaryTextColor}
                value={formData.email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  placeholderTextColor={Colors.secondaryTextColor}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, password: text }))
                  }
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm password"
                  placeholderTextColor={Colors.secondaryTextColor}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, confirmPassword: text }))
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.updateButton,
                loadingUpdateProfile && styles.updateButtonDisabled,
              ]}
              onPress={submitHandler}
              disabled={loadingUpdateProfile}
            >
              {loadingUpdateProfile ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.updateButtonText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AccountInformation;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 0,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "left",
  },
  formContainer: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.darkGray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
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
    fontSize: 15,
    color: Colors.textColor,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: Colors.textColor,
  },
  eyeIcon: {
    padding: 12,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
