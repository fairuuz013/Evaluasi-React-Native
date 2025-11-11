import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProductTopTabs from "./ProductTopTabs";
import ProductDetail from "../pages/ProductDetail";

const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Produk"
        component={ProductTopTabs}
        options={{ title: "Produk Populer" }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={{ title: "Detail Produk" }}
      />
    </Stack.Navigator>
  );
}
