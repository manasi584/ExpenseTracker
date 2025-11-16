import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AuthHeader = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing information", "Please enter email and password.");
      return;
    }
    // placeholder: replace with real auth flow
    Alert.alert("Logged in", `Welcome back, ${email.split("@")[0]}!`);
    setEmail("");
    setPassword("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.inner}
      >
        <View style={styles.brand}>
          <Text style={styles.title}>Expense Tracker</Text>
          <Text style={styles.subtitle}>Sign in to manage your budget and expenses</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9AA0A6"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9AA0A6"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity onPress={() => Alert.alert("Forgot password", "Password reset flow (placeholder).")} >
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={styles.helpText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => Alert.alert("Create account", "Account creation flow (placeholder).")}>
              <Text style={styles.link}> Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  brand: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 320,
  },
  form: {
    marginTop: 6,
  },
  label: {
    color: Colors.gray,
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#0b1114",
    color: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  forgot: {
    color: Colors.tintColor,
    marginTop: 10,
    textAlign: "right",
    marginRight: 4,
  },
  loginBtn: {
    marginTop: 18,
    backgroundColor: Colors.tintColor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  helpText: {
    color: Colors.gray,
  },
  link: {
    color: Colors.tintColor,
    fontWeight: "700",
  },
});
