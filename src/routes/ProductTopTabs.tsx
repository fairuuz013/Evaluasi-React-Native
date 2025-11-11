import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import HomeStackNavigator from "./HomeStackNavigator";
import Diskon from "../pages/products/Diskon";
import Populer from "../pages/products/Populer";
import Terbaru from "../pages/products/Terbaru";

const TopTab = createMaterialTopTabNavigator();

export default function ProductTopTabs() {
  return (
    <TopTab.Navigator>
      <TopTab.Screen name="Diskon" component={Diskon} />
      <TopTab.Screen name="Populer" component={Populer} />
      <TopTab.Screen name="Terbaru" component={Terbaru} />
    </TopTab.Navigator>
  );
}
