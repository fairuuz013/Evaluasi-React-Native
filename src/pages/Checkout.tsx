import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Checkout() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { product } = route.params || {};

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Tidak ada produk untuk checkout</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.label}>Produk:</Text>
      <Text style={styles.text}>{product.name}</Text>
      <Text style={styles.label}>Harga:</Text>
      <Text style={styles.text}>Rp {product.price}</Text>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>Tutup</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  text: { fontSize: 18, marginBottom: 10 },
  closeButton: { marginTop: 30, backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 8 },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', fontSize: 18 },
});
