import React, { useState, useEffect } from "react";
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, Alert, 
  ActivityIndicator, ScrollView, RefreshControl 
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { productApi, Product } from "../api/productApi";
import { productCache } from "../utils/cache";
import Icon from "@react-native-vector-icons/fontawesome6";

export default function ProductDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { product: initialProduct, productId } = route.params || {};
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [refreshing, setRefreshing] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<'none' | 'cached' | 'api'>('none');
  const [error, setError] = useState<string | null>(null);

  const currentProductId = initialProduct?.id || productId;

  useEffect(() => {
    if (initialProduct) {
      setCacheStatus('none');
      return;
    }

    if (currentProductId) {
      loadProduct();
    }
  }, [currentProductId, initialProduct]);

  const loadProduct = async (forceRefresh: boolean = false) => {
    if (!currentProductId) return;

    try {
      setLoading(true);
      setError(null);
      
      let productData: Product;
      
      if (forceRefresh) {
        console.log(`🔄 Force refreshing product ${currentProductId}`);
        productData = await productApi.refreshProduct(currentProductId);
        setCacheStatus('api');
      } else {
        productData = await productApi.getProduct(currentProductId);
        const cached = await productCache.getProduct(currentProductId);
        setCacheStatus(cached ? 'cached' : 'api');
      }
      
      setProduct(productData);
    } catch (error: any) {
      console.error('Error loading product:', error);
      setError(error.message || 'Gagal memuat detail produk');
      
      // Fallback ke cache untuk offline support
      const staleCache = await productCache.getProduct(currentProductId);
      if (staleCache) {
        console.log(`🔄 Using stale cache as final fallback: ${currentProductId}`);
        setProduct(staleCache);
        setError(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProduct(true);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      imageUrl: product.thumbnail,
      quantity: 1,
    });
    Alert.alert('Success', 'Produk ditambahkan ke keranjang!');
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    try {
      const added = await toggleWishlist(product.id);
      if (added) {
        Alert.alert('Success', 'Ditambahkan ke wishlist! 💖');
      } else {
        Alert.alert('Success', 'Dihapus dari wishlist!');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengupdate wishlist');
    }
  };

  // Error state
  if (error && !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Gagal Memuat Produk</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadProduct()}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat detail produk...</Text>
      </View>
    );
  }

  // Error state - no product found
  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Produk tidak ditemukan</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadProduct()}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            ⚠️ {error}
          </Text>
        </View>
      )}

      {/* Cache Status Indicator */}
      {cacheStatus !== 'none' && (
        <View style={[
          styles.cacheStatus,
          cacheStatus === 'cached' ? styles.cacheStatusCached : styles.cacheStatusApi
        ]}>
          <Text style={styles.cacheStatusText}>
            {cacheStatus === 'cached' ? '💾 Data dari Cache' : '🌐 Data dari Server'}
          </Text>
        </View>
      )}

      {/* Product Content */}
      <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="cover" />
      
      <View style={styles.header}>
        <Text style={styles.name}>{product.title}</Text>
        <TouchableOpacity 
          style={[
            styles.wishlistButton,
            isWishlisted && styles.wishlistButtonActive
          ]}
          onPress={handleToggleWishlist}
        >
          <Icon name="heart" size={24} color={isWishlisted ? "#ff4444" : "#666"}  />
        </TouchableOpacity>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>Rp {product.price?.toLocaleString()}</Text>
        {product.discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {product.discountPercentage}% OFF
            </Text>
          </View>
        )}
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>⭐ {product.rating}/5</Text>
        <Text style={styles.stock}>Stok: {product.stock}</Text>
      </View>

      <Text style={styles.brand}>Merk: {product.brand}</Text>
      <Text style={styles.category}>Kategori: {product.category}</Text>
      
      <Text style={styles.desc}>{product.description}</Text>

      {/* Product Images */}
      {product.images && product.images.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>Gambar Lainnya</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {product.images.map((image, index) => (
              <Image 
                key={index}
                source={{ uri: image }} 
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.wishlistButtonLarge}
          onPress={handleToggleWishlist}
        >
          <Icon 
            name="heart" 
            size={20} 
            color={isWishlisted ? "#ff4444" : "#666"} 
           
          />
          <Text style={[
            styles.wishlistText,
            isWishlisted && styles.wishlistTextActive
          ]}>
            {isWishlisted ? 'Hapus Wishlist' : 'Tambah Wishlist'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate("Checkout", { product })}
        >
          <Text style={styles.checkoutText}>Checkout Sekarang</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.cartText}>+ Keranjang</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  cacheStatus: {
    padding: 8,
    borderRadius: 6,
    margin: 16,
    marginBottom: 0,
    alignItems: 'center',
  },
  cacheStatusCached: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  cacheStatusApi: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  cacheStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  image: { 
    width: "100%", 
    height: 300, 
    marginBottom: 20 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  name: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  wishlistButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  wishlistButtonActive: {
    backgroundColor: '#fff5f5',
    borderColor: '#ff4444',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  price: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: "#007AFF", 
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: '600',
  },
  stock: {
    fontSize: 14,
    color: '#666',
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  desc: { 
    fontSize: 16, 
    color: "#555", 
    lineHeight: 22, 
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  imagesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  actions: {
    gap: 12,
    padding: 16,
    paddingTop: 0,
  },
  wishlistButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  wishlistText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  wishlistTextActive: {
    color: '#ff4444',
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  cartButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cartText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  error: { 
    color: "red", 
    fontSize: 18,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorBannerText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  errorTitle: {
    color: "red", 
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: "#666", 
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});