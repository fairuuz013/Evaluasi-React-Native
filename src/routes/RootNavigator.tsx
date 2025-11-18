import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../pages/LoginScreen";
import ProductDetail from "../pages/ProductDetail";
import Checkout from "../pages/Checkout";
import DrawerNavigator from "./DrawerNavigator";
import CartScreen from "../pages/CartScreen";
import { useAuth } from "../context/AuthContext"; // IMPORT BARU
import { ActivityIndicator, View } from "react-native"; // IMPORT BARU

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { token, isLoading } = useAuth(); // GUARD FLOW

  // Tampilkan loading saat cek token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={token ? "Drawer" : "Login"} // AUTO REDIRECT
      screenOptions={{ headerShown: false }}
    >
      {!token ? (
        // User belum login
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // User sudah login
        <>
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} />
          <Stack.Screen name="Checkout" component={Checkout} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}