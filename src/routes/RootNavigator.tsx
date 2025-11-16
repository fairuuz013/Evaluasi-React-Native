import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../pages/LoginScreen";
import ProductDetail from "../pages/ProductDetail";
import Checkout from "../pages/Checkout";
import DrawerNavigator from "./DrawerNavigator";
import CartScreen from "../pages/CartScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen name="Drawer" component={DrawerNavigator} />

      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="Checkout" component={Checkout} />

      
      
    </Stack.Navigator>
  );
}
