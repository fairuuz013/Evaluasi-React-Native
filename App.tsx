import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RootNavigator from './src/routes/RootNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (

    <ThemeProvider>

      <View style={styles.container}>
        <RootNavigator />
      </View>

    </ThemeProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});