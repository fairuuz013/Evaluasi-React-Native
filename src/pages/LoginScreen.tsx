import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const handleLogin = () => {
    // Simulasi login berhasil
    navigation.replace('DrawerRoot', { userID: 'U123' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Halaman Login</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login (Kirim userID)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
  button: { backgroundColor: '#2196F3', padding: 10, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
