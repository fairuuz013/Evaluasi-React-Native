import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { 
  openImageLibraryWithBase64,  // PAKAI YANG BARU
  getBase64Previews,           
  ImageAsset 
} from '../utils/imagePicker';

const AddProductScreen: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImageAsset[]>([]);
  const [offlinePreviews, setOfflinePreviews] = useState<any[]>([]);

  // LOAD PREVIEW OFFLINE SAAT COMPONENT MOUNT
  useEffect(() => {
    loadOfflinePreviews();
  }, []);

  const loadOfflinePreviews = async () => {
    try {
      const previews = await getBase64Previews();
      setOfflinePreviews(previews);
      console.log('Loaded offline previews:', previews.length);
    } catch (error) {
      console.error('Error loading offline previews:', error);
    }
  };

  const handleSelectImages = async () => {
    try {
      const images = await openImageLibraryWithBase64();
      setSelectedImages(images);
      
      if (images.length > 0) {
        Alert.alert('Success', `${images.length} foto berhasil dipilih!`);
        await loadOfflinePreviews();
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  // FUNCTION UNTUK TAMPILIN IMAGE (PRIORITAS BASE64 DULU)
  const renderImagePreview = (image: ImageAsset, index: number) => {
    const source = image.base64 
      ? { uri: `data:image/jpeg;base64,${image.base64}` }
      : { uri: image.uri };

    return (
      <View key={index} style={styles.imageContainer}>
        <Image source={source} style={styles.image} />
        <Text style={styles.fileName}>{image.fileName}</Text>
        {image.base64 && (
          <Text style={styles.base64Badge}>⚡ OFFLINE</Text>
        )}
      </View>
    );
  };

  const handleSubmit = () => {
    if (!productName || !productPrice || selectedImages.length === 0) {
      Alert.alert('Error', 'Harap isi semua field dan pilih minimal 1 foto');
      return;
    }

    Alert.alert(
      'Success', 
      `Produk "${productName}" berhasil dibuat dengan ${selectedImages.length} foto`
    );

    setProductName('');
    setProductPrice('');
    setSelectedImages([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tambah Produk Baru</Text>

      {/* Info Offline Previews */}
      {offlinePreviews.length > 0 && (
        <View style={styles.offlineInfo}>
          <Text style={styles.offlineText}>
            ⚡ {offlinePreviews.length} preview tersedia offline
          </Text>
        </View>
      )}

      {/* Form Input */}
      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Nama Produk"
          value={productName}
          onChangeText={setProductName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Harga Produk"
          value={productPrice}
          onChangeText={setProductPrice}
          keyboardType="numeric"
        />
      </View>

      {/* Upload Foto Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>
          Upload Foto Produk (Maks 5) - ⚡ Tersimpan untuk Offline
        </Text>
        
        <TouchableOpacity style={styles.uploadButton} onPress={handleSelectImages}>
          <Text style={styles.uploadButtonText}>Pilih Foto dengan Preview Cepat</Text>
        </TouchableOpacity>

        {/* Preview Images */}
        <View style={styles.imagePreview}>
          {selectedImages.map(renderImagePreview)}
        </View>

        {/* Show Offline Previews */}
        {offlinePreviews.length > 0 && selectedImages.length === 0 && (
          <View style={styles.offlineSection}>
            <Text style={styles.offlineTitle}>Preview Tersimpan Offline:</Text>
            <View style={styles.imagePreview}>
              {offlinePreviews.map((preview, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image 
                    source={{ uri: `data:image/jpeg;base64,${preview.base64}` }} 
                    style={styles.image} 
                  />
                  <Text style={styles.fileName}>{preview.fileName}</Text>
                  <Text style={styles.base64Badge}>⚡ OFFLINE</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Tambah Produk</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles tetap sama seperti sebelumnya...
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
  offlineInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  uploadSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    margin: 5,
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  fileName: {
    fontSize: 10,
    marginTop: 4,
    color: '#666',
    maxWidth: 80,
    textAlign: 'center',
  },
  base64Badge: {
    fontSize: 8,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 2,
  },
  offlineSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  offlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddProductScreen;