// App.tsx (atau index)
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/routes/RootNavigator"; // path sesuai project lo
import { CartProvider } from "./src/context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </CartProvider>
  );
}
