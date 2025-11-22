import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import apiClient from "../../api/apiClient"; // 👉 axios instance

export default function Populer() {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string>("unknown");

  const isLandscape = width > height;
  const numColumns = isLandscape ? 3 : 2;

  // 🔥 Cek koneksi internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isInternetReachable === true);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Fetch pakai Axios + timeout + abort
  useEffect(() => {
    if (isConnected === false) {
      setLoading(false);
      setError("Anda sedang Offline. Cek koneksi Anda.");
      return;
    }

    const controller = new AbortController();

    // Timeout 7 detik
    const timeout = setTimeout(() => {
      controller.abort();
      setError("Request timeout. Coba lagi ya.");
      setLoading(false);
    }, 7000);

    const fetchProducts = async () => {
      try {
        const res = await apiClient.get("/products?limit=10", {
          signal: controller.signal, // abort axios
        });

        setData(res.data.products);
      } catch (err: any) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setError("Gagal memuat data produk");
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [isConnected]);

  // 🔥 Offline UI
  if (isConnected === false) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 16 }}>
          Anda sedang Offline. Cek koneksi Anda.
        </Text>
        <Text style={{ marginTop: 10 }}>Koneksi: {connectionType}</Text>
      </View>
    );
  }

  // 🔥 Loading UI
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading data...</Text>
      </View>
    );
  }

  // 🔥 Error UI
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
        <Text style={{ marginTop: 10 }}>Koneksi: {connectionType}</Text>
      </View>
    );
  }

  // 🔥 List Produk
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        numColumns={numColumns}
        key={numColumns}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: width / numColumns - 20 }]}
            onPress={() =>
              navigation.navigate("ProductDetail", { product: item })
            }
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.image}
              resizeMode="cover"
            />

            <Text style={styles.name} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.statusBar}>
        <Text style={{ fontSize: 12, opacity: 0.7 }}>
          Koneksi: {connectionType}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: {
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    elevation: 3,
  },
  image: { width: "100%", height: 100, borderRadius: 8 },
  name: { marginTop: 8, fontSize: 14, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusBar: {
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
});
