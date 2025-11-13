import React, { useCallback } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Diskon from "../pages/products/Diskon";
import Populer from "../pages/products/Populer";
import Terbaru from "../pages/products/Terbaru";

const TopTab = createMaterialTopTabNavigator();

export default function ProductTopTabs() {
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      // ❌ Nonaktifkan gesture Drawer saat berada di tab produk
      navigation.getParent()?.setOptions({ swipeEnabled: false });
      return () => {
        // ✅ Aktifkan lagi saat keluar dari tab
        navigation.getParent()?.setOptions({ swipeEnabled: true });
      };
    }, [navigation])
  );

  return (
    <TopTab.Navigator
      screenOptions={{
        swipeEnabled: true, // biar tetap bisa swipe antar tab
      }}
    >
      <TopTab.Screen name="Diskon" component={Diskon} />
      <TopTab.Screen name="Populer" component={Populer} />
      <TopTab.Screen name="Terbaru" component={Terbaru} />
    </TopTab.Navigator>
  );
}
