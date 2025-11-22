import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import KTPUploadComponent from '../components/KTPUploadComponent';

export default function KTPVerificationScreen() {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');

  const handleUploadComplete = (result: any) => {
    if (result.success) {
      setVerificationStatus('verified');
      Alert.alert('Sukses', 'KTP berhasil diupload dan sedang diverifikasi!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Verifikasi KTP</Text>
      
      <Text style={styles.description}>
        Upload foto KTP Anda untuk verifikasi akun dan akses fitur premium
      </Text>

      <KTPUploadComponent
        onUploadComplete={handleUploadComplete}
        autoUpload={true}
        uploadUrl="https://api.example.com/upload/ktp"
      />

      {/* Status Info */}
      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>Status Verifikasi:</Text>
        <View style={[
          styles.statusBadge,
          verificationStatus === 'verified' && styles.statusVerified,
          verificationStatus === 'rejected' && styles.statusRejected
        ]}>
          <Text style={styles.statusText}>
            {verificationStatus === 'pending' && 'Menunggu Upload'}
            {verificationStatus === 'verified' && 'Terverifikasi ✓'}
            {verificationStatus === 'rejected' && 'Ditolak ✗'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    fontSize: 16,
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#ffc107',
  },
  statusVerified: {
    backgroundColor: '#28a745',
  },
  statusRejected: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});