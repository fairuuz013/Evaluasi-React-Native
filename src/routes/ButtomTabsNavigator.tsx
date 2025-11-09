import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from "@react-native-vector-icons/fontawesome6";
import HomeScreen from '../pages/Home';
import ProfileScreen from '../pages/Profile';
import ProductsScreen from '../pages/Product'; // ✅ Import yang benar

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: 'crimson',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                }
            }}
        >
            <Tab.Screen
                name='Home'
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon iconStyle="solid" name="house" size={size} color={color} />
                    ),
                    title: 'Home'
                }}
            />
            <Tab.Screen
                name='Products'
                component={ProductsScreen} // ✅ Ini harus ProductsScreen
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon iconStyle="solid" name="box" size={size} color={color} />
                    ),
                    title: 'Products'
                }}
            />
            <Tab.Screen
                name='Profile'
                component={ProfileScreen} // ✅ Ini harus ProfileScreen
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="user" size={size} color={color} />
                    ),
                    title: 'Profile'
                }}
            />
        </Tab.Navigator>
    );
}