import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import Home from "../pages/Home";
import Products from "../pages/Product";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import CustomDrawerContent from "../components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: true,
            }}
        >
            {/* Swipe drawer dimatikan di Home */}
            <Drawer.Screen
                name="Home"
                component={Home}
                options={{
                    swipeEnabled: false,
                }}
            />

            {/* Halaman lain tetap bisa swipe */}
            <Drawer.Screen name="Products" component={Products} />
            <Drawer.Screen name="Profile" component={Profile} />
            <Drawer.Screen name="Settings" component={Settings} />
        </Drawer.Navigator>
    );
}
