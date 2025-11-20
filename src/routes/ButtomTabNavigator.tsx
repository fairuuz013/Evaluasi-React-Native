import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../pages/Home";
import ProductTopTabs from "./ProductTopTabs";
import Profile from "../pages/Profile";
import Icon from "@react-native-vector-icons/fontawesome6";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: any = "circle"; // default - pakai 'any' untuk bypass TypeScript

          if (route.name === "Home") iconName = "house";
          else if (route.name === "Product") iconName = "box-open";
          else if (route.name === "Profile") iconName = "user";

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { 
          backgroundColor: "#fff", 
          height: 60, 
          paddingBottom: 5 
        },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Product" component={ProductTopTabs} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}