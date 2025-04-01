import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthScreen() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const dataToSend = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    };
    const url = isSignup
      ? "https://aichatbot-backend-hxs8.onrender.com/api/auth/signup"
      : "https://aichatbot-backend-hxs8.onrender.com/api/auth/login";
    try {
      const response = await axios.post(
        url,
        isSignup ? dataToSend : { email: formData.email, password: formData.password }
      );
      if (isSignup && response.status === 200) {
        setSignupSuccess(true);
        setError("Signup successful! Please log in.");
        return;
      }
      if (!isSignup && (response.status === 200 || response.status === 201)) {
        const token = response.data.token;
        const loginFirstName =
          response.data.user.fullName.split(" ")[0] || "User";
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("firstName", loginFirstName);
        router.replace({ pathname: "/chat", params: { firstName: loginFirstName } });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.authScreen}>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>{isSignup ? "Sign Up" : "Login"}</Text>
        {error ? (
          <Text style={[styles.errorText, signupSuccess && { color: "green" }]}>
            {error}
          </Text>
        ) : null}
        {isSignup && (
          <TextInput
            style={styles.authInput}
            placeholder="Full Name"
            value={formData.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
          />
        )}
        <TextInput
          style={styles.authInput}
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.authInput}
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.authButton, isLoading && styles.authButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.authButtonText}>
              {isSignup ? "Sign Up" : "Login"}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIsSignup(!isSignup);
            setSignupSuccess(false);
            setError("");
          }}
        >
          <Text style={styles.authToggle}>
            {isSignup
              ? "Already have an account? Login"
              : "Need an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  authScreen: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3b82f6",
  },
  authCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 450,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  authInput: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    color: "#111827",
    marginVertical: 10,
  },
  authButton: {
    width: "100%",
    padding: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    alignItems: "center",
  },
  authButtonDisabled: {
    backgroundColor: "#6b7280",
  },
  authButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  authToggle: {
    marginTop: 10,
    color: "#3b82f6",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});