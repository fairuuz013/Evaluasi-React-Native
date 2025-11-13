import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Product() {
  const navigation = useNavigation<any>();

  const products = [
    {
      id: 1,
      name: "Kopi Arabica",
      price: 25000,
      image: require("../images/foto.jpg"),
    },
    {
      id: 2,
      name: "Kopi Robusta",
      price: 20000,
      image: require("../images/foto.jpg"),
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ProductDetail", item)}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>Rp {item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  price: {
    color: "#4CAF50",
  },
});
