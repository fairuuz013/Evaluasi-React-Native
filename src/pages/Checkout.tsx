import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import ProtectedRoute from "../components/ProtectedRoute"; // IMPORT BARU

function CheckoutContent() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { product } = route.params || {};
  const { addToCart } = useCart();

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Tidak ada produk untuk checkout</Text>
      </View>
    );
  }

  const handleAddToCartAndGo = () => {
    addToCart({
      id: product.id,
      name: product.name ?? product.title ?? "Produk",
      price: product.price ?? 0,
      imageUrl: product.imageUrl ?? product.thumbnail ?? "",
      quantity: 1,
    });
    navigation.navigate("Drawer", {
      screen: "CartScreen"
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.label}>Produk:</Text>
      <Text style={styles.text}>{product.name ?? product.title}</Text>
      <Text style={styles.label}>Harga:</Text>
      <Text style={styles.text}>Rp {product.price}</Text>

      <TouchableOpacity style={styles.confirmButton} onPress={handleAddToCartAndGo}>
        <Text style={styles.confirmText}>Masukkan ke Keranjang</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>Tutup</Text>
      </TouchableOpacity>
    </View>
  );
}

// EXPORT BARU: Wrap dengan ProtectedRoute
export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  text: { fontSize: 18, marginBottom: 10 },
  confirmButton: { marginTop: 20, backgroundColor: "#28a745", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  confirmText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  closeButton: { marginTop: 16, backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", fontSize: 18 },
});