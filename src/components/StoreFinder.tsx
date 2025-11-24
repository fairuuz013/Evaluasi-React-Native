import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { requestLocationPermission, checkLocationPermission } from '../utils/permissions';
import { LocationService, Store } from '../utils/locationUtils';

interface StoreFinderProps {
  onStoreSelect?: (store: Store) => void;
}

const StoreFinder: React.FC<StoreFinderProps> = ({ onStoreSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // 🔥 BARU: Ref untuk analytics
  const analyticsSentRef = useRef(false);

  // Cek status permission saat component mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    const hasPermission = await checkLocationPermission();
    setHasLocationPermission(hasPermission);
  };

  // 🔥 BARU: Kirim analytics ketika toko berhasil ditemukan
  const sendStoreDiscoveryAnalytics = (storesCount: number) => {
    if (!analyticsSentRef.current) {
      console.log(`📊 Sending store discovery analytics: ${storesCount} stores found`);
      
      LocationService.sendLocationToServer()
        .then(success => {
          if (success) {
            analyticsSentRef.current = true;
            console.log('📊 Store discovery analytics sent successfully');
          }
        })
        .catch(error => {
          console.log('📊 Store discovery analytics skipped:', error.message);
        });
    }
  };

  // Handle pencarian toko terdekat
  const handleFindNearbyStores = async () => {
    setIsLoading(true);
    analyticsSentRef.current = false; // Reset analytics flag
    
    try {
      console.log('📍 Starting store finder process...');
      
      // Step 1: Request location permission
      const permissionGranted = await requestLocationPermission();
      
      if (!permissionGranted) {
        Alert.alert(
          'Izin Lokasi Diperlukan',
          'Fitur "Toko Terdekat" membutuhkan akses lokasi untuk bekerja dengan optimal.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      setHasLocationPermission(true);
      
      // Step 2: Dapatkan lokasi user
      console.log('📍 Getting user location...');
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);
      
      // 🔥 BARU: Kirim analytics untuk lokasi yang didapatkan
      LocationService.sendLocationToServer().catch(error => {
        console.log('📊 Location acquisition analytics skipped:', error.message);
      });
      
      // Step 3: Dapatkan toko terdekat
      console.log('📍 Fetching nearby stores...');
      const stores = await LocationService.getNearbyStores(location.latitude, location.longitude);
      setNearbyStores(stores);
      
      console.log(`✅ Found ${stores.length} nearby stores`);
      
      // 🔥 BARU: Kirim analytics untuk store discovery
      if (stores.length > 0) {
        sendStoreDiscoveryAnalytics(stores.length);
      }
      
    } catch (error) {
      console.error('❌ Error in store finder:', error);
      LocationService.handleLocationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 BARU: Enhanced store selection dengan analytics
  const handleStoreSelect = (store: Store) => {
    console.log('🏪 Store selected:', store.name);
    
    // Kirim analytics untuk store selection
    LocationService.sendLocationToServer()
      .then(success => {
        if (success) {
          console.log('📊 Store selection analytics sent');
        }
      })
      .catch(error => {
        console.log('📊 Store selection analytics skipped:', error.message);
      });
    
    // Panggil callback parent
    onStoreSelect?.(store);
  };

  // Render item toko
  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity 
      style={styles.storeItem}
      onPress={() => handleStoreSelect(item)}
    >
      <View style={styles.storeHeader}>
        <Text style={styles.storeName}>{item.name}</Text>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>
            {LocationService.formatDistance(item.distance)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.storeAddress}>{item.address}</Text>
      
      <View style={styles.storeFooter}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
        <Text style={styles.hoursText}>{item.openingHours}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Cari Toko Terdekat</Text>
      
      {hasLocationPermission === false && (
        <View style={styles.permissionWarning}>
          <Text style={styles.warningText}>
            Izin lokasi diperlukan untuk menampilkan toko terdekat
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.findButton, isLoading && styles.buttonDisabled]}
        onPress={handleFindNearbyStores}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.findButtonText}>
            {nearbyStores.length > 0 ? '🔍 Cari Ulang Toko Terdekat' : '📍 Cari Toko Terdekat'}
          </Text>
        )}
      </TouchableOpacity>

      {userLocation && (
        <Text style={styles.locationText}>
          Lokasi Anda: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
        </Text>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Mencari toko terdekat...</Text>
        </View>
      ) : nearbyStores.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            📍 Toko Terdekat ({nearbyStores.length} ditemukan)
          </Text>
          <FlatList
            data={nearbyStores}
            renderItem={renderStoreItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.storesList}
          />
        </View>
      ) : hasLocationPermission !== null && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Tekan tombol di atas untuk mencari toko terdekat
          </Text>
        </View>
      )}
    </View>
  );
};

// Styles tetap sama...
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  permissionWarning: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
  },
  findButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  storesList: {
    maxHeight: 400,
  },
  storeItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  distanceBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  hoursText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default StoreFinder;