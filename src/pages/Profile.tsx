import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext"; // IMPORT BARU

export default function Profile() {
  const { logout, token } = useAuth(); // GUARD FLOW

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ini halaman Profile</Text>
      
      {/* TAMBAHAN FITUR LOGOUT - OPTIONAL */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
});