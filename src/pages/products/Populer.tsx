import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import ProductCard from "../ProductCard";

export default function Populer() {
  const products = [
    { id: "1", name: "Kopi Arabica", price: 35000, image: "https://picsum.photos/200" },
    { id: "2", name: "Teh Hijau", price: 25000, image: "https://picsum.photos/201" },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard name={item.name} price={item.price} image={item.image} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f8f8f8" },
});
