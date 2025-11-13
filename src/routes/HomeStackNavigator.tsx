import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../pages/LoginScreen";
import DrawerNavigator from "./DrawerNavigator";
import Checkout from "../pages/Checkout";

const RootStack = createStackNavigator();

export default function RootNavigator() {
  return (
    <RootStack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="MainDrawer" component={DrawerNavigator} />
      <RootStack.Screen name="Checkout" component={Checkout} />
    </RootStack.Navigator>
  );
}
/*  */