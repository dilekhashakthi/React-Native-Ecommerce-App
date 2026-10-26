import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation } from "../../redux/slices/userApiSlice";
import { setCredentials } from "../../redux/slices/authSlice";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Toast from "react-native-toast-message";
import FormContainer from "../../components/FormContainer";
import { Colors } from "../../constants/Utils";

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const localSearchParams = useLocalSearchParams();
  const redirect = localSearchParams.redirect || "/";

  useEffect(() => {
    if (userInfo) {
      router.replace(redirect);
    }
  }, [userInfo, redirect, router]);

  const submitHandler = async () => {
    Keyboard.dismiss();
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();
      dispatch(setCredentials({ ...response }));
      router.replace(redirect);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error?.data?.message || error.error,
        position: "top",
        visibilityTime: 7000,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <FormContainer>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.slogan}>One Login. Endless Choices</Text>
        </View>

        <Text style={styles.title}>Sign In</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address: </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, email: text }))
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password: </Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter Password"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, password: text }))
              }
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.passwordToggle}
            >
              {showPassword ? (
                <FontAwesome6
                  name="eye-slash"
                  size={20}
                  color={Colors.primary}
                />
              ) : (
                <FontAwesome6 name="eye" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={submitHandler}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            New User?{" "}
            <Link
              href={{
                pathname: "/RegisterScreen",
                params: redirect !== "/" ? { redirect } : {},
              }}
              style={styles.registerLink}
            >
              Register
            </Link>
          </Text>
        </View>
      </FormContainer>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 10,
  },
  slogan: {
    fontSize: 20,
    color: Colors.secondaryTextColor,
    textAlign: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: Colors.textColor,
  },
  formGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textColor,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    backgroundColor: Colors.white,
    color: Colors.textColor,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: Colors.textColor,
  },
  passwordToggle: {
    padding: 10,
    position: "absolute",
    right: 5,
  },
  button: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: Colors.secondaryTextColor,
  },
  registerLink: {
    color: Colors.primary,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
