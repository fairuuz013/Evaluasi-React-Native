import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Profile from "../pages/Profile";
import HomeStackNavigator from "./HomeStackNavigator";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ route }: any) {
  const { userID } = route.params || {};

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: "Home" }} />
      <Tab.Screen name="Profile" component={Profile} initialParams={{ userID }} />
    </Tab.Navigator>
  );
}
