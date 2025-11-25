import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Icon from "@react-native-vector-icons/fontawesome6";

interface ProductItemProps {
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    thumbnail?: string;
    description?: string;
  };
}

export default function ProductItem({ product }: ProductItemProps) {
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || product.thumbnail || '',
      quantity: 1,
    });
    Alert.alert('Success', 'Produk ditambahkan ke keranjang!');
  };

  const handleToggleWishlist = async () => {
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

  const handleProductPress = () => {
    navigation.navigate('ProductDetail', { product });
  };

  const isWishlisted = isInWishlist(product.id);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleProductPress}>
        <Image 
          source={{ uri: product.imageUrl || product.thumbnail }} 
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>Rp {product.price.toLocaleString()}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.cartText}>+ Keranjang</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.wishlistButton,
              isWishlisted && styles.wishlistButtonActive
            ]}
            onPress={handleToggleWishlist}
          >
            <Icon 
              name={isWishlisted ? "heart" : "heart"} 
              size={16} 
              color={isWishlisted ? "#ff4444" : "#666"} 
          
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  cartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  wishlistButton: {
    width: 36,
    height: 36,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  wishlistButtonActive: {
    backgroundColor: '#fff5f5',
    borderColor: '#ff4444',
  },
});