
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function ProductDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { product } = route.params || {};

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Produk tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>Rp {product.price}</Text>
      <Text style={styles.desc}>{product.description}</Text>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => navigation.navigate("Checkout", { product })}
      >
        <Text style={styles.checkoutText}>Checkout Sekarang</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  image: { width: "100%", height: 250, borderRadius: 12, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: "bold", color: "#333" },
  price: { fontSize: 18, color: "#007AFF", marginVertical: 10 },
  desc: { fontSize: 16, color: "#555", lineHeight: 22, marginBottom: 40 },
  checkoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", fontSize: 18 },
});

