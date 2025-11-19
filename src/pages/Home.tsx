import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useCategories } from '../context/CategoryContext';

export default function Home() {
  const { categories, loading } = useCategories();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      
      {/* FITUR BARU: Tampilkan categories dengan cache */}
      <Text style={styles.subtitle}>Categories ({categories.length})</Text>
      
      {loading ? (
        <Text>Loading categories...</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <Text>{item.name}</Text>
            </View>
          )}
        />
      )}

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  categoryItem: { padding: 12, backgroundColor: '#f0f0f0', marginBottom: 4 },
});