import React from "react";
import { FlatList, View, Text, Image, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const dummyData = [
  {
    id: "1",
    name: "Kopi Hitam",
    price: 15000,
    description: "Kopi hitam asli dari biji pilihan.",
    imageUrl: "https://i.ibb.co/2F0c6s9/kopi-hitam.jpg",
  },
  {
    id: "2",
    name: "Latte",
    price: 20000,
    description: "Latte creamy dengan susu segar.",
    imageUrl: "https://i.ibb.co/3RkN7vL/latte.jpg",
  },
  {
    id: "3",
    name: "Cappuccino",
    price: 25000,
    description: "Cappuccino klasik dengan foam lembut.",
    imageUrl: "https://i.ibb.co/k6nZyCq/cappuccino.jpg",
  },
  {
    id: "4",
    name: "Espresso",
    price: 18000,
    description: "Espresso pekat untuk semangatmu.",
    imageUrl: "https://i.ibb.co/TkmR0Gm/espresso.jpg",
  },
];

export default function Populer() {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 3 : 2;

  return (
    <FlatList
      data={dummyData}
      numColumns={numColumns}
      key={numColumns}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.card, { width: width / numColumns - 20 }]}
          onPress={() => navigation.navigate("ProductDetail", { product: item })}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.container}
    />
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
});
