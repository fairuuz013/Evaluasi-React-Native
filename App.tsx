// App.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Product, ProductForm } from './types/Product';
import ProductList from './src/components/ProductList';
import AddProductButton from './src/components/AddProductButton';
import ProductModal from './src/components/ProductModal';

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Redmi 13 Pro 5g',
    price: 4499000,
    imageUrl: 'https://i02.appmifile.com/709_operator_sg/26/02/2024/871d14cb5d56df5cb1fd9aededb830c2.jpg?f=webp',
    description: 'High-performance smartphone with great camera'
  },
  {
    id: '2',
    name: 'Laptop Asus K16',
    price: 10000000,
    imageUrl: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQmk5lYl_3YueISA3tcSqS1H0reSJkEqsUiDOpxk6b5rQwSYkBfBkVav-1fcFRPPa3C4fcAWTAQmo08lv4y1VD1wEU0cw8W9wqZJp7hsG8zhxzY9qfh-xHoYsMCLi3Z5fSQXQ&usqp=CAc',
    description: 'Powerful laptop for work and gaming'
  },
  {
    id: '3',
    name: 'Headphones',
    price: 499000,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    description: 'Wireless noise-canceling headphones'
  },
  {
    id: '4',
    name: 'Smart Watch',
    price: 1299000,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    description: 'Fitness tracking smartwatch'
  },
  {
    id: '5',
    name: 'Tablet',
    price: 4599000,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    description: 'Versatile tablet for entertainment'
  }
];

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [modalVisible, setModalVisible] = useState(false);

  const addProduct = (productData: ProductForm) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productData.name,
      price: Number(productData.price),
      imageUrl: productData.imageUrl,
      description: productData.description,
    };

    setProducts(prevProducts => [newProduct, ...prevProducts]);
    setModalVisible(false);
    Alert.alert('Success', 'Product added successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mini E-Commerce</Text>
      </View>

      <ProductList products={products} />

      <AddProductButton onPress={() => setModalVisible(true)} />

      <ProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addProduct}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});