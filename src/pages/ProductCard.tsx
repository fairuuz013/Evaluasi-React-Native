// import { useNavigation, } from "@react-navigation/native";
// import React from "react";
// import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

// interface ProductCardProps {
//   name: string;
//   price: number;
//   image: string;
//   onPress: () => void;
// }



// export default function ProductCard({ name, price, image, }: ProductCardProps) {
//     const Navigation = useNavigation<any>()
//   return (
//     <TouchableOpacity style={styles.card} onPress={() => Navigation.navigate('ProductDetail' , {name, price, image })}>
//       <Image source={{ uri: image }} style={styles.image} />
//       <Text style={styles.name}>{name}</Text>
//       <Text style={styles.price}>Rp {price.toLocaleString()}</Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 10,
//     margin: 8,
//     alignItems: "center",
//     elevation: 3,
//   },
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   name: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   price: {
//     color: "#555",
//   },
// });
