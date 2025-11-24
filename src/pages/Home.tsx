import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useCategories } from '../context/CategoryContext';
import StoreFinder from '../components/StoreFinder';
import { LocationService } from '../utils/locationUtils';
import { checkLocationPermission } from '../utils/permissions';

export default function Home() {
  const { categories, loading } = useCategories();
  const analyticsIntervalRef = useRef<number | null>(null);

  // 🔥 BARU: Start analytics collection ketika component mount
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Cek permission lokasi terlebih dahulu
        const hasLocationPermission = await checkLocationPermission();
        
        if (hasLocationPermission) {
          console.log('📊 Starting analytics collection on Home mount');
          
          // Start scheduled analytics collection setiap 5 menit
          analyticsIntervalRef.current = LocationService.startAnalyticsCollection(300000);
          
          // 🔥 OPTIMASI: Kirim lokasi pertama kali saat app dibuka
          // Gunakan maximumAge: 120000 untuk hemat battery & data
          setTimeout(() => {
            LocationService.sendLocationToServer().catch(error => {
              console.log('📊 Initial analytics submission skipped:', error.message);
            });
          }, 2000); // Delay 2 detik untuk tidak ganggu UX awal
        } else {
          console.log('📊 Analytics deferred - no location permission');
        }
      } catch (error) {
        console.log('📊 Analytics initialization error:', error);
      }
    };

    initializeAnalytics();

    // 🔥 CRITICAL: Cleanup function
    return () => {
      if (analyticsIntervalRef.current) {
        LocationService.stopAnalyticsCollection(analyticsIntervalRef.current);
        console.log('📊 Analytics collection stopped on Home unmount');
      }
    };
  }, []);

  const handleStoreSelect = (store: any) => {
    console.log('🏪 Store selected:', store);
    
    // 🔥 BARU: Kirim analytics ketika user memilih toko
    LocationService.sendLocationToServer().catch(error => {
      console.log('📊 Store selection analytics skipped:', error.message);
    });
  };

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Home Screen</Text>

          {/* Store Finder dengan analytics integration */}
          <StoreFinder onStoreSelect={handleStoreSelect} />

          <Text style={styles.subtitle}>
            Categories ({categories.length})
          </Text>

          {loading && <Text>Loading categories...</Text>}
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.categoryItem}>
          <Text>{item.name}</Text>
        </View>
      )}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8,
    marginTop: 24,
    color: '#333',
  },
  categoryItem: { 
    padding: 12, 
    backgroundColor: '#f0f0f0', 
    marginBottom: 4,
    borderRadius: 6,
  },
});