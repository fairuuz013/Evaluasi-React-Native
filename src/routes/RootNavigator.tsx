import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import DrawerNavigator from "./DrawerNavigator";
import Checkout from "../pages/Checkout";

const RootStack = createStackNavigator();

export default function RootNavigator() {
  const routeNameRef = useRef<string>(undefined);

  // Helper untuk mendapatkan route aktif dari state nested
  const getActiveRouteName = (state: any): string => {
    if (!state || !state.routes || state.routes.length === 0) return "Unknown";
    const route = state.routes[state.index || 0];
    // Recursively get nested state
    if (route.state) return getActiveRouteName(route.state);
    return route.name;
  };

  return (
    <NavigationContainer
      onReady={() => {
        routeNameRef.current = "MainDrawer"; // default saat app ready
      }}
      onStateChange={(state) => {
        const currentRouteName = getActiveRouteName(state);
        if (currentRouteName !== routeNameRef.current) {
          console.log(`[ANALYTICS] Rute dikunjungi: ${currentRouteName}`);
          routeNameRef.current = currentRouteName;
        }
      }}
    >
      <RootStack.Navigator>
        <RootStack.Screen
          name="MainDrawer"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Checkout"
          component={Checkout}
          options={{
            presentation: "modal",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
