import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../pages/Home";
import ProductTopTabs from "./ProductTopTabs";
import Profile from "../pages/Profile";
// @ts-ignore → biar TS ga rewel soal tipe name
import Icon from "@react-native-vector-icons/fontawesome6";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "circle"; // default

          if (route.name === "Home") iconName = "house";
          else if (route.name === "Product") iconName = "box-open";
          else if (route.name === "Profile") iconName = "user";

          // pakai `as any` biar TS gak error
          return <Icon name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#fff", height: 60, paddingBottom: 5 },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Product" component={ProductTopTabs} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
