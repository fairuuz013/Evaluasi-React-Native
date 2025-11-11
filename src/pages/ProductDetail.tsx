import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation, CommonActions, DrawerActions } from "@react-navigation/native";

export default function ProductDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { name, image, price } = route.params;

  const handleResetAndCloseDrawer = () => {
    // 🔁 Reset stack ke halaman utama
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Produk" }], // ubah sesuai nama route awal
      })
    );

    // 🚪 Tutup drawer di parent navigator
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.dispatch(DrawerActions.closeDrawer());
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>Rp {price.toLocaleString()}</Text>
      <Text style={styles.desc}>
        Ini adalah deskripsi singkat tentang {name}. Produk ini populer karena kualitas dan rasanya yang khas.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleResetAndCloseDrawer}>
        <Text style={styles.buttonText}>Kembali ke Halaman Utama</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 15 },
  name: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  price: { fontSize: 18, color: "green", marginBottom: 15 },
  desc: { fontSize: 14, color: "#555", marginBottom: 30 },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
