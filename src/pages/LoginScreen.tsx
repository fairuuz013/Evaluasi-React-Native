import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Username:', username);
      console.log('Password:', password);
      
      const response = await loginUser(username, password);
      
      console.log('=== LOGIN RESPONSE ===');
      console.log('Full response data:', response.data);
      console.log('Token received:', response.data.token);
      console.log('Success flag:', response.data.success);
      
      if (response.data.success && response.data.token) {
        console.log('✅ Login successful, saving token:', response.data.token);
        await login(response.data.token);
        Alert.alert("Success", "Login berhasil!");
      } else {
        console.log('❌ Missing token or success flag');
        Alert.alert("Login Gagal", "Token tidak diterima dari server");
      }
    } catch (error: any) {
      console.log('=== LOGIN ERROR ===');
      console.log('Error response:', error.response?.data);
      
      Alert.alert("Login Gagal", error.response?.data?.message || "Username atau password salah!");
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mini E-Commerce</Text>
      
      <Text style={styles.note}>
        Gunakan: emilys / emilyspass
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.credentialButtons}>
        <Text style={styles.credentialTitle}>Test Credentials:</Text>
        
        <TouchableOpacity 
          style={styles.credentialButton}
          onPress={() => fillCredentials('emilys', 'emilyspass')}
        >
          <Text style={styles.credentialButtonText}>emilys / emilyspass</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  note: { 
    fontSize: 16, 
    marginBottom: 20, 
    color: "#666", 
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  credentialButtons: {
    width: "100%",
    marginTop: 20,
  },
  credentialTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  credentialButton: {
    backgroundColor: "#34C759",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  credentialButtonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
});