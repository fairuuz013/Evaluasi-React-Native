import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';

// 1. Definisikan Interface untuk tipe data User
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  // Anda bisa menambahkan properti lain dari respons API jika diperlukan,
  // seperti address, phone, website, company, dll.
}

const UserListWithError = () => {
  // 2. Gunakan tipe data eksplisit pada useState
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // error bisa berupa string atau null

  useEffect(() => {
    const controller = new AbortController();
    
    // 3. Tambahkan tipe data Promise<void> untuk fungsi async
    const fetchUsers = async (): Promise<void> => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          // Tangani kasus non-200 OK
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 4. Lakukan casting ke tipe User[] saat mengambil data
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err: any) { // Gunakan 'any' untuk menangkap error karena tipe error bisa bervariasi
        if (err.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        
        // Pastikan err.message adalah string sebelum menyetel state atau Alert
        const errorMessage = err.message || 'An unknown error occurred';
        setError(errorMessage);
        Alert.alert('Network Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => controller.abort();
  }, []); // Dependensi kosong, dijalankan sekali saat mount

  // 5. Komponen Render
  if (loading) return <ActivityIndicator size="large" style={styles.loading} />;
  
  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Error: {error}</Text>
    </View>
  );

  return (
    // 6. Tentukan tipe untuk properti FlatList 'data' dan 'renderItem'
    <FlatList<User>
      data={users}
      keyExtractor={(item: User) => item.id.toString()}
      renderItem={({ item }: { item: User }) => (
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.name}</Text>
        </View>
      )}
    />
  );
};

// Opsional: Menambahkan StyleSheet untuk tampilan yang lebih baik
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
  },
});

export default UserListWithError;