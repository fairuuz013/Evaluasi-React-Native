import { Alert } from 'react-native';
import { LocationService, LiveLocationUpdate } from './locationUtils';

// 🔥 GEOFENCING: Konfigurasi Toko Utama untuk Promo
export interface MainStore {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  promoRadius: number; // dalam meter
  promoMessage: string;
}

// 🔥 GEOFENCING: Toko Utama (gunakan toko pertama dari dummy data)
export const MAIN_STORE: MainStore = {
  id: '1',
  name: 'Toko Elektronik Central',
  latitude: -6.2088,  // Contoh: Jakarta
  longitude: 106.8456,
  promoRadius: 100,   // 100 meter radius
  promoMessage: 'PROMO DEKAT TOKO! Dapatkan diskon 20% untuk semua produk elektronik!'
};

// 🔥 GEOFENCING: State management
let geofencingWatchId: number | null = null;
let isGeofencingActive = false;

export const GeofencingService = {
  // ===============================
  // 🔥 GEOFENCING: START PROMO RADIUS MONITORING
  // ===============================
  startPromoRadiusMonitoring: (): boolean => {
    if (isGeofencingActive) {
      console.log('📍 Geofencing already active');
      return false;
    }

    try {
      console.log('📍 Starting promo radius geofencing monitoring...');
      
      // 🔥 GEOFENCING: Gunakan watchPosition dengan distanceFilter 50 meter
      geofencingWatchId = LocationService.watchPosition(
        // Success callback - dipanggil setiap 50 meter pergerakan
        (location: LiveLocationUpdate) => {
          console.log('📍 Geofencing location update received');
          
          // 🔥 GEOFENCING: Hitung jarak ke toko utama
          const distanceToStore = LocationService.calculateDistance(
            location.latitude,
            location.longitude,
            MAIN_STORE.latitude,
            MAIN_STORE.longitude
          );
          
          // Convert km to meters
          const distanceInMeters = distanceToStore * 1000;
          
          console.log(`📍 Distance to ${MAIN_STORE.name}: ${distanceInMeters.toFixed(0)} meters`);
          
          // 🔥 GEOFENCING: Cek jika user dalam radius 100 meter
          if (distanceInMeters <= MAIN_STORE.promoRadius) {
            console.log('🎉 User entered promo radius! Showing alert...');
            
            // Tampilkan alert promo
            Alert.alert(
              '🎊 PROMO SPESIAL!',
              MAIN_STORE.promoMessage,
              [
                { 
                  text: 'OK', 
                  onPress: () => {
                    console.log('✅ User acknowledged promo alert');
                    // 🔥 GEOFENCING: Matikan tracking setelah promo ditampilkan
                    GeofencingService.stopPromoRadiusMonitoring();
                  }
                }
              ]
            );
            
            // 🔥 GEOFENCING: Langsung matikan tracking setelah alert muncul
            GeofencingService.stopPromoRadiusMonitoring();
          }
        },
        // Error callback
        (error) => {
          console.error('📍 Geofencing monitoring error:', error);
          GeofencingService.stopPromoRadiusMonitoring();
        },
        // 🔥 GEOFENCING: Configuration khusus untuk geofencing
        {
          distanceFilter: 50,           // 🔥 Update setiap 50 meter
          enableHighAccuracy: true,     // High accuracy untuk geofencing
          timeout: 15000,               // 15 detik timeout
          maximumAge: 30000             // 30 detik maximum age
        }
      );
      
      isGeofencingActive = true;
      console.log('📍 Geofencing monitoring started with watchId:', geofencingWatchId);
      return true;
      
    } catch (error) {
      console.error('📍 Failed to start geofencing monitoring:', error);
      return false;
    }
  },

  // ===============================
  // 🔥 GEOFENCING: STOP PROMO RADIUS MONITORING
  // ===============================
  stopPromoRadiusMonitoring: (): void => {
    if (geofencingWatchId) {
      LocationService.clearWatch(geofencingWatchId);
      geofencingWatchId = null;
    }
    
    isGeofencingActive = false;
    console.log('📍 Geofencing monitoring stopped');
  },

  // ===============================
  // 🔥 GEOFENCING: CEK STATUS MONITORING
  // ===============================
  isGeofencingActive: (): boolean => {
    return isGeofencingActive;
  },

  // ===============================
  // 🔥 GEOFENCING: GET CURRENT DISTANCE TO MAIN STORE
  // ===============================
  getCurrentDistanceToStore: async (): Promise<{ distance: number; inPromoRadius: boolean }> => {
    try {
      const location = await LocationService.getCurrentLocation();
      
      const distanceKm = LocationService.calculateDistance(
        location.latitude,
        location.longitude,
        MAIN_STORE.latitude,
        MAIN_STORE.longitude
      );
      
      const distanceMeters = distanceKm * 1000;
      const inPromoRadius = distanceMeters <= MAIN_STORE.promoRadius;
      
      return {
        distance: distanceMeters,
        inPromoRadius
      };
    } catch (error) {
      console.error('📍 Error calculating distance to store:', error);
      return {
        distance: -1,
        inPromoRadius: false
      };
    }
  },

  // ===============================
  // 🔥 GEOFENCING: GET MAIN STORE INFO
  // ===============================
  getMainStoreInfo: (): MainStore => {
    return MAIN_STORE;
  },

  // ===============================
  // 🔥 GEOFENCING: MANUAL CHECK PROMO RADIUS
  // ===============================
  manualCheckPromoRadius: async (): Promise<boolean> => {
    try {
      const { distance, inPromoRadius } = await GeofencingService.getCurrentDistanceToStore();
      
      if (inPromoRadius) {
        Alert.alert(
          '🎊 PROMO SPESIAL!',
          MAIN_STORE.promoMessage,
          [{ text: 'OK' }]
        );
        return true;
      } else {
        Alert.alert(
          'Info',
          `Anda berada ${distance.toFixed(0)} meter dari ${MAIN_STORE.name}. Butuh ${(MAIN_STORE.promoRadius - distance).toFixed(0)} meter lagi untuk dapat promo!`,
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('📍 Manual promo check error:', error);
      Alert.alert('Error', 'Gagal memeriksa promo');
      return false;
    }
  }
};