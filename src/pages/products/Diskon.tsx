import React from "react";
import { FlatList, View, Text, Image, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const dummyData = [
  {
    id: "1",
    name: "Kopi Hitam",
    price: 15000,
    description: "Kopi hitam asli dari biji pilihan.",
    imageUrl: "data:image/jpeg;base64,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",
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
