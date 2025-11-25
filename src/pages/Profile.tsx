import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import KTPUploadComponent from '../components/KTPUploadComponent'; // 👈 IMPORT

export default function ProfileScreen() {
  const [ktpVerified, setKtpVerified] = useState(false);

  const handleKTPUploaded = (ktpPhoto: any) => {
    console.log('KTP diupload:', ktpPhoto);
  };

  const handleUploadComplete = (result: any) => {
    console.log('Upload selesai:', result);
    if (result.success) {
      setKtpVerified(true);
      Alert.alert('Sukses', 'KTP berhasil diverifikasi!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profil Saya</Text>
      
      {/* Section Data Diri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Diri</Text>
        <Text>Nama: Fairuuz</Text>
        <Text>Email: Ruuz@gmail.com</Text>
        {/* ... data lainnya */}
      </View>

      {/* 🔥 SECTION BARU: Verifikasi KTP */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verifikasi Identitas</Text>
        
        <KTPUploadComponent
          onKTPUploaded={handleKTPUploaded}
          onUploadComplete={handleUploadComplete}
          autoUpload={true}
          uploadUrl="https://api.example.com/upload/ktp" // 👈 GANTI DENGAN URL API MU
        />

        {ktpVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Terverifikasi</Text>
          </View>
        )}
      </View>

      {/* Section lainnya... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  verifiedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});