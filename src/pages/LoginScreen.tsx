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
      console.log('LoginScreen: Attempting login...');
      
      // Panggil API login
      const response = await loginUser(username, password);
      
      console.log('LoginScreen: API Response:', response.data);
      
      // Simpan token untuk persistensi
      if (response.data.success && response.data.token) {
        console.log('LoginScreen: Login successful, saving token');
        await login(response.data.token); // Simpan token dan trigger redirect
      } else {
        Alert.alert("Login Gagal", "Token tidak diterima dari server");
      }
    } catch (error: any) {
      console.log('LoginScreen: Login error:', error);
      Alert.alert("Login Gagal", "Username atau password salah!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mini E-Commerce</Text>
      

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Setelah login, tutup app dan buka kembali - akan langsung ke Home
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 30, color: "#666" },
  input: {
    width: "80%",
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
    width: "80%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  note: { marginTop: 20, fontSize: 12, color: "#888", textAlign: "center", paddingHorizontal: 20 },
});