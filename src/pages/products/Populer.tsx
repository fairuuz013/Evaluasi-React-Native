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
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import apiClient from "../../api/apiClient";
import { getStoredProductAssets, ImageAsset } from "../../utils/imagePicker";

export default function Populer() {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();

  const [data, setData] = useState<any[]>([]);
  const [uploadedProducts, setUploadedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string>("unknown");

  const isLandscape = width > height;
  const numColumns = isLandscape ? 3 : 2;

  // 🔥 FUNCTION UNTUK LOAD FOTO YANG SUDAH DIUPLOAD
  const loadUploadedProducts = async () => {
    try {
      const storedAssets = await getStoredProductAssets();
      
      if (storedAssets.length > 0) {
        // Convert ImageAsset jadi format product
        const products = storedAssets.map((asset: ImageAsset, index: number) => ({
          id: `uploaded-${Date.now()}-${index}`,
          title: `Produk Upload ${index + 1}`,
          name: `Produk Upload ${index + 1}`,
          price: Math.floor(Math.random() * 1000000) + 100000,
          description: "Produk hasil upload penjual",
          thumbnail: asset.uri,
          image: asset.uri,
          category: "Uploaded",
          rating: 4.5,
          stock: 10,
          brand: "Local",
          isUploaded: true,
        }));
        
        setUploadedProducts(products);
      } else {
        setUploadedProducts([]);
      }
    } catch (error) {
      console.error('Error loading uploaded products:', error);
    }
  };

  // 🔥 FETCH DATA DARI API
  const fetchProducts = async () => {
    if (isConnected === false) {
      setLoading(false);
      setRefreshing(false);
      setError("Anda sedang Offline. Cek koneksi Anda.");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      setError("Request timeout. Coba lagi ya.");
      setLoading(false);
      setRefreshing(false);
    }, 7000);

    try {
      const res = await apiClient.get("/products?limit=10", {
        signal: controller.signal,
      });

      setData(res.data.products);
      setError("");
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      setError("Gagal memuat data produk");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔥 LOAD DATA SAAT COMPONENT MOUNT
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadUploadedProducts();
      await fetchProducts();
    };
    
    loadData();
  }, [isConnected]);

  // 🔥 CEK KONEKSI INTERNET
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isInternetReachable === true);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 REFRESH DATA SETIAP KALI SCREEN FOCUS
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        await loadUploadedProducts();
        if (isConnected) {
          await fetchProducts();
        }
      };
      refreshData();
    }, [isConnected])
  );

  // 🔥 HANDLE REFRESH
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUploadedProducts();
    await fetchProducts();
  };

  // 🔥 GABUNGIN DATA API + UPLOADAN
  const combinedData = [...uploadedProducts, ...data];

  // 🔥 RENDER PRODUCT ITEM
  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { width: width / numColumns - 20 }]}
      onPress={() =>
        navigation.navigate("ProductDetail", { product: item })
      }
    >
      <Image
        source={{ uri: item.thumbnail || item.image }}
        style={styles.image}
        resizeMode="cover"
      />

      {item.isUploaded && (
        <View style={styles.uploadedBadge}>
          <Text style={styles.uploadedBadgeText}>UPLOAD</Text>
        </View>
      )}

      <Text style={styles.name} numberOfLines={1}>
        {item.title || item.name}
      </Text>

      <Text style={styles.price}>
        Rp {(item.price || 0).toLocaleString('id-ID')}
      </Text>

      {item.rating && (
        <Text style={styles.rating}>
          ⭐ {item.rating} {item.brand ? `• ${item.brand}` : ''}
        </Text>
      )}
    </TouchableOpacity>
  );

  // 🔥 OFFLINE UI
  if (isConnected === false && !loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 16 }}>
          Anda sedang Offline. Cek koneksi Anda.
        </Text>
        <Text style={{ marginTop: 10 }}>Koneksi: {connectionType}</Text>
        
        {uploadedProducts.length > 0 && (
          <View style={styles.offlineContainer}>
            <Text style={styles.offlineTitle}>
              Produk yang diupload tersedia offline ({uploadedProducts.length})
            </Text>
            <FlatList
              data={uploadedProducts}
              numColumns={numColumns}
              key={numColumns}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.container}
              renderItem={renderProductItem}
            />
          </View>
        )}
      </View>
    );
  }

  // 🔥 LOADING UI
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading data...</Text>
      </View>
    );
  }

  // 🔥 ERROR UI
  if (error && combinedData.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
        <Text style={{ marginTop: 10 }}>Koneksi: {connectionType}</Text>
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔥 LIST PRODUK
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Menampilkan {combinedData.length} produk
          {uploadedProducts.length > 0 && ` (${uploadedProducts.length} diupload)`}
        </Text>
      </View>

      <FlatList
        data={combinedData}
        numColumns={numColumns}
        key={numColumns}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        renderItem={renderProductItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Belum ada produk populer</Text>
            <TouchableOpacity 
              style={styles.addProductButton}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <Text style={styles.addProductButtonText}>+ Tambah Produk</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.statusBar}>
        <Text style={{ fontSize: 12, opacity: 0.7 }}>
          Koneksi: {connectionType} • {combinedData.length} produk
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 10,
    flexGrow: 1,
  },
  card: {
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  image: { 
    width: "100%", 
    height: 100, 
    borderRadius: 8 
  },
  name: { 
    marginTop: 8, 
    fontSize: 14, 
    fontWeight: "600",
    textAlign: 'center',
  },
  price: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#28a745',
  },
  rating: {
    marginTop: 2,
    fontSize: 10,
    color: '#666',
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  statusBar: {
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  infoBar: {
    padding: 10,
    backgroundColor: '#e9f7fe',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  uploadedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#28a745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadedBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  offlineContainer: {
    width: '100%',
    padding: 10,
  },
  offlineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addProductButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addProductButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});