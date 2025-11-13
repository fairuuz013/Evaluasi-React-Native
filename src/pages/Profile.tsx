import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function Profile() {
  const route = useRoute<any>();
  const { userID } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Page</Text>
      <Text style={styles.user}>UserID: {userID || 'Tidak ada'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
  user: { fontSize: 18, marginTop: 10 },
});
