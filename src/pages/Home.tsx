// pages/Home.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


type HomeNavigationProp = StackNavigationProp<any, 'HomeMain'>;

export default function Home() {
  const navigation = useNavigation<HomeNavigationProp>();

  const goToProducts = () => {
    navigation.navigate('ProductsTopTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Mini E-Commerce</Text>
      <TouchableOpacity style={styles.button} onPress={goToProducts}>
        <Text style={styles.buttonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});