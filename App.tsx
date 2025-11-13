import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import DrawerNavigator from "./src/routes/DrawerNavigator";
import RootNavigator from "./src/routes/RootNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
