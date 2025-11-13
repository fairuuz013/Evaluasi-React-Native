import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProductTopTabs from "./ProductTopTabs"; // 🔥 ubah ke sini
import ProductDetail from "../pages/ProductDetail";
import { TouchableOpacity } from "react-native";
import Icon from "@react-native-vector-icons/fontawesome6";
import { DrawerActions, useNavigation } from "@react-navigation/native";

const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  const navigation = useNavigation<any>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProductTopTabs"
        component={ProductTopTabs}
        options={{
          title: "Produk Kami",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={{ marginLeft: 15 }}
            >
              <Icon iconStyle="solid"  name="bars" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={{ title: "Detail Produk" }}
      />
    </Stack.Navigator>
  );
}
