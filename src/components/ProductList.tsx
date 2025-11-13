import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const products = [
  {
    id: '1',
    name: 'Sneakers Putih',
    price: 250000,
    description: 'Sneakers nyaman untuk sehari-hari.',
    imageUrl: 'https://i.ibb.co/2P5QY6Z/sneakers-putih.jpg',
  },
  {
    id: '2',
    name: 'Jaket Denim',
    price: 350000,
    description: 'Jaket denim stylish untuk musim dingin.',
    imageUrl: 'https://i.ibb.co/8bVb3yD/jaket-denim.jpg',
  },
  {
    id: '3',
    name: 'Tas Ransel',
    price: 180000,
    description: 'Tas ransel ringan dan tahan lama.',
    imageUrl: 'https://i.ibb.co/k1Bv1V4/tas-ransel.jpg',
  },
];

export default function ProductListScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>Rp {item.price}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9f9f9' },
  image: { width: '100%', height: 200 },
  name: { fontSize: 18, fontWeight: 'bold', padding: 8, color: '#333' },
  price: { fontSize: 16, paddingHorizontal: 8, paddingBottom: 8, color: '#007AFF' },
});
