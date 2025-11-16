import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import BottomTabNavigator from "./ButtomTabNavigator";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { TouchableOpacity } from "react-native";
import Icon from "@react-native-vector-icons/fontawesome6";
import CartScreen from "../pages/CartScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <Icon iconStyle="solid" name="bars" size={28} style={{ marginLeft: 15 }} />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="Home"
        component={BottomTabNavigator}
        options={{ title: "Beranda" }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{ title: "Profil Saya" }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{ title: "Pengaturan" }}
      />

      <Drawer.Screen 
      name="CartScreen"
      component={CartScreen}
      
      />

   
    </Drawer.Navigator>
  );
}
