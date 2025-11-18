import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [username, setUsername] = useState("");              //username emilys
  const [password, setPassword] = useState("");              //password emilyspass
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      // AXIOS RETURN RESPONSE DALAM .data
      const response = await loginUser(username, password);                    
      
      // AKSES TOKEN DARI response.data
      if (response.data.success && response.data.token) {
        login(response.data.token); // SIMPAN TOKEN
      } else {
        // FALLBACK KE FLOW LAMA JIKA TIDAK ADA TOKEN
        navigation.replace("Drawer");
      }
    } catch (error) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
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
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});