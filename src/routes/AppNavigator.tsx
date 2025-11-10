import { View, Text } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import Populer from '../pages/products/Populer'
import Diskon from '../pages/products/Diskon'
import Terbaru from '../pages/products/Terbaru'

const Tabs = createMaterialTopTabNavigator()

export default function AppNavigator() {
  return (

    <Tabs.Navigator screenOptions={{
      lazyPreloadDistance: 1,
      swipeEnabled: true, 
      tabBarScrollEnabled: true
    }}>
      <Tabs.Screen name='Populer' component={Populer} />
      <Tabs.Screen name='Diskon' component={Diskon} />
      <Tabs.Screen name='Terbaru' component={Terbaru} />
    </Tabs.Navigator>
  )
}