import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Diskon from "../pages/products/Diskon";
import Populer from "../pages/products/Populer";
import Terbaru from "../pages/products/Terbaru";
import AddProductScreen from "../pages/AddProductScreen"; // 👈 TAMBAH INI

const TopTab = createMaterialTopTabNavigator();

export default function ProductTopTabs() {
  return (
    <TopTab.Navigator
      screenOptions={{
        swipeEnabled: true,
        tabBarIndicatorStyle: { backgroundColor: "#007AFF" },
        tabBarLabelStyle: { fontWeight: "bold" },
      }}
    >
      <TopTab.Screen name="Diskon" component={Diskon} />
      <TopTab.Screen name="Populer" component={Populer} />
      <TopTab.Screen name="Terbaru" component={Terbaru} />
      <TopTab.Screen 
        name="Tambah" 
        component={AddProductScreen}
        options={{
          tabBarLabel: "+ Tambah", // 👈 TAB BARU
        }}
      />
    </TopTab.Navigator>
  );
}