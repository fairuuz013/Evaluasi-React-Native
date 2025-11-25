import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useCart } from "../context/CartContext";
import apiClient from "../api/apiClient";
import { storage } from "../utils/storage";
import ProtectedRoute from "../components/ProtectedRoute"; // IMPORT BARU

function CartScreenContent() {
  const { cart, getLocalTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [total, setTotal] = useState<number>(getLocalTotal());
  const [connectionType, setConnectionType] = useState<string>("unknown");
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Pantau koneksi network
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setConnectionType(state.type);
      setIsOnline(!!state.isConnected);
    });
    return () => unsub();
  }, []);

  // Polling GET tiap 15 detik; stop kalau connectionType === 'cellular'
  useEffect(() => {
    let intervalId: number | null = null;

    // Kalau seluler atau offline, hentikan polling dan gunakan total lokal
    if (connectionType === "cellular" || !isOnline) {
      console.log("📵 Polling OFF (cellular/offline) - hemat kuota");
      setTotal(getLocalTotal());
      return;
    }

    const fetchTotalFromApi = async () => {
      try {
        console.log("🔄 Polling cart total from API...");
        const res = await apiClient.get("/carts/1");

        if (res?.data?.total !== undefined) {
          setTotal(res.data.total);
        } else if (res?.data?.products) {
          const sum = res.data.products.reduce(
            (acc: number, it: any) => acc + it.price * (it.quantity ?? it.qty ?? 1),
            0
          );
          setTotal(sum);
        } else {
          setTotal(getLocalTotal());
        }
      } catch (err) {
        console.log("Error fetch cart total:", err);
        setTotal(getLocalTotal());
      }
    };

    // Panggil sekali di awal
    fetchTotalFromApi();

    // Set interval polling tiap 15 detik
    intervalId = setInterval(() => {
      fetchTotalFromApi();
    }, 15000) as unknown as number;

    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionType, isOnline, cart]);

  // Test Quota Exceeded (untuk development)
  const testQuotaExceeded = async () => {
    try {
      // Simulasi data besar untuk trigger quota error
      const largeData = Array(1000).fill({
        id: Date.now() + Math.random(),
        name: "Test Product Large Data",
        price: 100,
        quantity: 1,
        largeField: "x".repeat(1000) // Large string
      });

      await storage.saveCart(largeData);
      Alert.alert("Success", "Large data saved");
    } catch (error: any) {
      if (error?.message?.includes('QuotaExceededError')) {
        Alert.alert(
          "Storage Full",
          "Cart data cleared automatically. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  };

  // Manual sync cart ke server (jika online)
  const syncCartToServer = async () => {
    if (!isOnline) {
      Alert.alert("Offline", "Cannot sync while offline");
      return;
    }

    try {
      // Contoh sync cart ke server
      await apiClient.post("/carts/sync", { cart });
      Alert.alert("Success", "Cart synced to server");
    } catch (error) {
      Alert.alert("Sync Failed", "Failed to sync cart to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keranjang Belanja</Text>

      {/* Connection Status */}
      <View style={[
        styles.connectionStatus,
        { backgroundColor: isOnline ? '#4CAF50' : '#f44336' }
      ]}>
        <Text style={styles.connectionText}>
          {isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'} - {connectionType}
        </Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFromCart(item.id)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.itemSub}>
              Rp {item.price.toLocaleString()}
            </Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Text>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantityText}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Keranjang kosong</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: Rp {total.toLocaleString()}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.syncButton]}
            onPress={syncCartToServer}
            disabled={!isOnline}
          >
            <Text style={styles.buttonText}>
              {isOnline ? '🔄 Sync' : '🔴 Offline'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearCart}
          >
            <Text style={styles.buttonText}>🗑️ Clear</Text>
          </TouchableOpacity>

          {/* Hanya untuk testing - bisa dihapus di production */}
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testQuotaExceeded}
          >
            <Text style={styles.buttonText}>🧪 Test Quota</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// EXPORT BARU: Wrap dengan ProtectedRoute
export default function CartScreen() {
  return (
    <ProtectedRoute>
      <CartScreenContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },

  connectionStatus: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  connectionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  item: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  itemSub: { marginBottom: 8, color: "#444", fontSize: 14 },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },

  removeBtn: {
    width: 24,
    height: 24,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  removeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },

  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  syncButton: {
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#ff4444',
  },
  testButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});