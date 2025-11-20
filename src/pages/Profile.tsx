import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext'; // BARU
import { storage } from '../utils/storage';

export default function Profile() {
  const { token, logout } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist(); // BARU

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      `Pilih cara logout:\n\n• Logout biasa: tetap simpan keranjang & wishlist\n• Logout + hapus keranjang: ${cart.length} item akan dihapus`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Logout Biasa', 
          onPress: () => logout() // Tidak hapus cart & wishlist
        },
        { 
          text: `Logout + Hapus Keranjang (${cart.length})`, 
          style: 'destructive',
          onPress: () => logout({ clearCart: true }) // Hapus cart saja, wishlist tetap
        },
      ]
    );
  };

  const handleDebug = async () => {
    const debugInfo = await storage.debugStorage();
    Alert.alert(
      'Debug Storage',
      `Total keys: ${debugInfo.keys.length}\n\nKeys:\n${debugInfo.keys.join('\n')}\n\n${debugInfo.keychainStatus}\n\nWishlist: ${debugInfo.wishlistCount} items`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.status}>
          Status: {token ? '✅ Masuk' : '❌ Keluar'}
        </Text>
        <Text style={styles.cartInfo}>
          Keranjang: {cart.length} item
        </Text>
        <Text style={styles.wishlistInfo}> {/* BARU */}
          Wishlist: {wishlistCount} item
        </Text>
      </View>

      {token && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>🚪 Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.debugButton} onPress={handleDebug}>
            <Text style={styles.debugText}>🐛 Debug Storage</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  statusCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  status: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  cartInfo: { fontSize: 14, color: '#666', marginBottom: 4 },
  wishlistInfo: { fontSize: 14, color: '#e91e63', fontWeight: '500' }, // BARU
  menu: { gap: 12 },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugText: {
    color: '#666',
    fontSize: 14,
  },
});