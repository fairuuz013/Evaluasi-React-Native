import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

export default function Home() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Selamat Datang di Mini E-Commerce ☕</Text>
      <Image
        source={require("../images/Foto.jpg")}
        style={styles.banner}
        resizeMode="cover"
      />

      <Text style={styles.subtitle}></Text>
      <Text style={styles.desc}>
        Nikmati pengalaman belanja yang menyenangkan dengan berbagai pilihan

      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 20 },
  banner: { width: "100%", height: 200, borderRadius: 12, marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#007AFF", marginBottom: 10 },
  desc: { fontSize: 16, color: "#555", lineHeight: 24, textAlign: "center" },
});
