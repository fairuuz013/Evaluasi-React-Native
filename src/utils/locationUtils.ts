import { Alert, Platform } from 'react-native';

// 🔥 BARU: Import Geolocation service
import Geolocation from '@react-native-community/geolocation';

// Tambah interface untuk location result dengan cache info
export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  fromCache?: boolean;
}

// 🔥 BARU: Interface untuk live tracking
export interface LiveLocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  speed?: number | null;
  heading?: number | null;
}

export interface WatchPositionOptions {
  distanceFilter?: number; // meter
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// 🔥 BARU: Interface untuk analytics data
export interface AnalyticsLocationData {
  userId?: string;
  sessionId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  platform: string;
  appVersion: string;
  fromCache: boolean;
}

// 🔥 BARU: Interface untuk geofencing
export interface GeofencingOptions {
  targetLat: number;
  targetLon: number;
  radiusMeters: number;
  onEnterRadius?: () => void;
  onExitRadius?: () => void;
}

// 🔥 BARU: Cache untuk lokasi terakhir
let cachedLocation: LocationResult | null = null;
const CACHE_MAX_AGE = 60000; // 1 menit dalam milliseconds

// 🔥 BARU: Cache untuk analytics submission
let lastAnalyticsSubmission: number | null = null;
const ANALYTICS_SUBMISSION_INTERVAL = 120000; // 2 menit dalam milliseconds

// 🔥 BARU: State untuk geofencing
let geofencingWatchId: number | null = null;
let isGeofencingActive = false;

// Simulasi data toko berdasarkan lokasi
export interface Store {
  id: string;
  name: string;
  address: string;
  distance: number; // dalam kilometer
  rating: number;
  openingHours: string;
}

export const LocationService = {
  // ===============================
  // 🔥 BARU: KIRIM LOKASI KE SERVER UNTUK ANALYTICS DENGAN OPTIMASI DATA
  // ===============================
  sendLocationToServer: async (): Promise<boolean> => {
    try {
      console.log('📡 Preparing to send location to analytics server...');
      
      /**
       * OPTIMASI 1: Cek waktu submission terakhir
       * Mencegah spam server dengan submission yang terlalu sering
       */
      const now = Date.now();
      if (lastAnalyticsSubmission && (now - lastAnalyticsSubmission) < ANALYTICS_SUBMISSION_INTERVAL) {
        console.log('📡 Skipping analytics submission - too soon since last submission');
        return true; // Return true karena bukan error, hanya skip untuk optimasi
      }

      /**
       * OPTIMASI 2: Gunakan maximumAge: 120000 (2 MENIT)
       * 
       * KEUNTUNGAN maximumAge UNTUK HEMAT DATA & BATTERY:
       * 1. ✅ MENGURANGI BEBAN SERVER: 
       *    - Tidak mengirim data lokasi baru setiap kali jika data lama masih "segar"
       *    - Mengurangi jumlah HTTP requests ke server analytics
       *    - Mengurangi bandwidth consumption
       * 
       * 2. ✅ MENGURANGI KONSUMSI BATTERY:
       *    - Menghindari aktivasi GPS hardware yang boros battery
       *    - Menggunakan cached location yang sudah ada daripada request GPS baru
       *    - Mengurangi frekuensi sensor location updates
       * 
       * 3. ✅ OPTIMAL UNTUK USE CASE ANALYTICS:
       *    - Untuk analytics, lokasi 2 menit yang lalu masih cukup akurat
       *    - Tidak perlu real-time precision untuk data statistik
       *    - Trade-off yang tepat antara akurasi dan efisiensi
       */
      const location = await new Promise<LocationResult>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const locationData: LocationResult = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              fromCache: false
            };
            resolve(locationData);
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: false, // ❗ Untuk analytics, tidak perlu high accuracy
            timeout: 10000,
            maximumAge: 120000, // 🔥 CRITICAL: Gunakan data cached hingga 2 menit
          }
        );
      });

      // Prepare analytics data
      const analyticsData: AnalyticsLocationData = {
        sessionId: `session_${Date.now()}`,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        platform: Platform.OS,
        appVersion: '1.0.0',
        fromCache: location.fromCache || false
      };

      console.log('📡 Sending location to analytics server:', {
        coordinates: `${analyticsData.latitude.toFixed(6)}, ${analyticsData.longitude.toFixed(6)}`,
        accuracy: analyticsData.accuracy,
        fromCache: analyticsData.fromCache ? 'CACHED' : 'FRESH',
        timestamp: new Date(analyticsData.timestamp).toISOString()
      });

      // 🔥 BARU: Kirim data ke server analytics
      const success = await LocationService.submitToAnalyticsServer(analyticsData);
      
      if (success) {
        lastAnalyticsSubmission = Date.now();
        console.log('✅ Analytics data sent successfully');
      } else {
        console.log('⚠️ Analytics submission failed, will retry later');
      }
      
      return success;

    } catch (error: any) {
      console.error('📡 Error sending location to server:', error);
      
      /**
       * OPTIMASI 3: Graceful Error Handling
       * - Tidak tampilkan alert untuk analytics errors (non-critical)
       * - Log error untuk debugging
       * - Return false tetapi tidak ganggu user experience
       */
      return false;
    }
  },

  // ===============================
  // 🔥 BARU: SUBMIT DATA KE ANALYTICS SERVER
  // ===============================
  submitToAnalyticsServer: async (data: AnalyticsLocationData): Promise<boolean> => {
    try {
      /**
       * OPTIMASI 4: Batch Data jika memungkinkan
       * - Bisa dikembangkan untuk mengumpulkan beberapa data sebelum dikirim
       * - Mengurangi jumlah HTTP requests
       */
      
      // Simulasi API call ke analytics server
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      
      // Dalam implementasi real, ini akan call API seperti:
      // const response = await apiClient.post('/analytics/location', data);
      
      console.log('📊 Analytics submitted:', {
        location: `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
        accuracy: data.accuracy,
        fromCache: data.fromCache,
        platform: data.platform
      });
      
      return true;
    } catch (error) {
      console.error('📡 Analytics server error:', error);
      return false;
    }
  },

  // ===============================
  // 🔥 BARU: SCHEDULED ANALYTICS COLLECTION
  // ===============================
  startAnalyticsCollection: (interval: number = 300000): number => { // Default 5 menit
    console.log('📊 Starting scheduled analytics collection every', interval / 60000, 'minutes');
    
    const collectionInterval = setInterval(() => {
      LocationService.sendLocationToServer().catch(error => {
        console.error('📡 Scheduled analytics collection failed:', error);
      });
    }, interval);
    
    return collectionInterval;
  },

  // ===============================
  // 🔥 BARU: STOP ANALYTICS COLLECTION
  // ===============================
  stopAnalyticsCollection: (intervalId: number): void => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log('📊 Analytics collection stopped');
    }
  },

  // ===============================
  // 🔥 BARU: GET ANALYTICS SUBMISSION STATUS
  // ===============================
  getAnalyticsStatus: (): { 
    lastSubmission: number | null; 
    nextSubmission: number | null;
    isDue: boolean;
  } => {
    const now = Date.now();
    const nextSubmission = lastAnalyticsSubmission 
      ? lastAnalyticsSubmission + ANALYTICS_SUBMISSION_INTERVAL
      : null;
    
    return {
      lastSubmission: lastAnalyticsSubmission,
      nextSubmission,
      isDue: nextSubmission ? now >= nextSubmission : true
    };
  },

  // ===============================
  // 🔥 GEOFENCING: START PROMO RADIUS MONITORING
  // ===============================
  startGeofencingMonitoring: (
    targetLat: number,
    targetLon: number,
    radiusMeters: number,
    onEnterRadius: () => void,
    onError?: (error: any) => void
  ): boolean => {
    if (isGeofencingActive) {
      console.log('📍 Geofencing already active');
      return false;
    }

    try {
      console.log('📍 Starting geofencing monitoring...', {
        target: `${targetLat}, ${targetLon}`,
        radius: `${radiusMeters}m`
      });
      
      // 🔥 GEOFENCING: Gunakan watchPosition dengan distanceFilter 50 meter
      geofencingWatchId = LocationService.watchPosition(
        // Success callback - dipanggil setiap 50 meter pergerakan
        (location: LiveLocationUpdate) => {
          console.log('📍 Geofencing location update received');
          
          // 🔥 GEOFENCING: Hitung jarak ke target
          const distanceToTarget = LocationService.calculateDistanceInMeters(
            location.latitude,
            location.longitude,
            targetLat,
            targetLon
          );
          
          console.log(`📍 Distance to target: ${distanceToTarget.toFixed(0)} meters`);
          
          // 🔥 GEOFENCING: Cek jika user dalam radius
          if (distanceToTarget <= radiusMeters) {
            console.log('🎉 User entered target radius! Triggering callback...');
            
            // Panggil callback untuk handle promo
            onEnterRadius();
            
            // 🔥 GEOFENCING: Matikan tracking setelah trigger
            LocationService.stopGeofencingMonitoring();
          }
        },
        // Error callback
        (error) => {
          console.error('📍 Geofencing monitoring error:', error);
          if (onError) {
            onError(error);
          }
          LocationService.stopGeofencingMonitoring();
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
  stopGeofencingMonitoring: (): void => {
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
  // 🔥 GEOFENCING: GET CURRENT DISTANCE TO TARGET
  // ===============================
  getDistanceToTarget: async (
    targetLat: number, 
    targetLon: number
  ): Promise<{ distance: number; inRadius: boolean; radius?: number }> => {
    try {
      const location = await LocationService.getCurrentLocation();
      
      const distanceMeters = LocationService.calculateDistanceInMeters(
        location.latitude,
        location.longitude,
        targetLat,
        targetLon
      );
      
      return {
        distance: distanceMeters,
        inRadius: false // Default, radius bisa di-set oleh caller
      };
    } catch (error) {
      console.error('📍 Error calculating distance to target:', error);
      return {
        distance: -1,
        inRadius: false
      };
    }
  },

  // ===============================
  // LIVE TRACKING DENGAN DISTANCE FILTER 20 METER
  // ===============================
  watchPosition: (
    onPositionUpdate: (location: LiveLocationUpdate) => void,
    onError?: (error: any) => void,
    options: WatchPositionOptions = {}
  ): number => {
    const {
      distanceFilter = 20, // 🔥 Update setiap 20 meter
      enableHighAccuracy = true,
      timeout = 10000,
      maximumAge = 5000
    } = options;

    console.log('📍 Starting live tracking with distance filter:', distanceFilter, 'meters');

    const watchId = Geolocation.watchPosition(
      // Success callback
      (position) => {
        const locationUpdate: LiveLocationUpdate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed,
          heading: position.coords.heading
        };

        console.log('📍 Live location update:', {
          lat: locationUpdate.latitude,
          lng: locationUpdate.longitude,
          accuracy: locationUpdate.accuracy,
          speed: locationUpdate.speed,
          heading: locationUpdate.heading
        });

        onPositionUpdate(locationUpdate);
      },
      // Error callback
      (error) => {
        console.error('📍 Live tracking error:', error);
        
        let errorMessage = 'Gagal melacak lokasi';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Izin lokasi ditolak. Tidak dapat melacak pergerakan kurir.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokasi tidak tersedia. Pastikan GPS aktif untuk tracking.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout melacak lokasi. Periksa koneksi GPS.';
            break;
          default:
            errorMessage = `Error tracking: ${error.message}`;
        }

        if (onError) {
          onError(new Error(errorMessage));
        } else {
          Alert.alert('Error Tracking', errorMessage);
        }
      },
      // 🔥 OPTIMASI: Configuration untuk live tracking
      {
        enableHighAccuracy,      // High accuracy untuk tracking kurir
        timeout,                 // Timeout untuk setiap update
        maximumAge,              // Maximum age untuk cached location
        distanceFilter,          // 🔥 Update setiap 20 meter pergerakan
      }
    );

    console.log('📍 Live tracking started with watchId:', watchId);
    return watchId;
  },

  // ===============================
  // CLEAR WATCH UNTUK CLEANUP
  // ===============================
  clearWatch: (watchId: number): void => {
    if (watchId) {
      Geolocation.clearWatch(watchId);
      console.log('📍 Live tracking stopped for watchId:', watchId);
    }
  },

  // ===============================
  // STOP ALL ACTIVE TRACKING
  // ===============================
  stopAllTracking: (): void => {
    // Untuk safety, kita clear semua watch
    // Note: React Native Geolocation tidak punya method stopAll, 
    // jadi kita harus manage watchId secara manual di component
    console.log('📍 All tracking should be managed manually via clearWatch');
  },

  // ===============================
  // GET CURRENT POSITION DENGAN OPTIMASI BATTERY
  // ===============================
  getCurrentPosition: (): Promise<LocationResult> => {
    return new Promise((resolve, reject) => {
      // 🔥 OPTIMASI: Cek cache dulu sebelum request baru
      if (cachedLocation && (Date.now() - cachedLocation.timestamp) < CACHE_MAX_AGE) {
        console.log('📍 Using cached location (age:', Date.now() - cachedLocation.timestamp, 'ms)');
        resolve({
          ...cachedLocation,
          fromCache: true
        });
        return;
      }

      console.log('📍 Requesting fresh location...');

      Geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const location: LocationResult = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            fromCache: false
          };

          // 🔥 OPTIMASI: Simpan ke cache
          cachedLocation = location;
          console.log('📍 Fresh location obtained, saved to cache');

          resolve(location);
        },
        // Error callback
        (error) => {
          console.error('📍 Geolocation error:', error);
          
          // 🔥 BARU: Handle specific error codes
          let errorMessage = 'Gagal mendapatkan lokasi';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Izin lokasi ditolak. Silakan aktifkan di Settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Lokasi tidak tersedia. Pastikan GPS aktif.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Periksa koneksi GPS Anda';
              break;
            default:
              errorMessage = `Error lokasi: ${error.message}`;
          }
          
          reject(new Error(errorMessage));
        },
        // 🔥 OPTIMASI: Configuration untuk battery efficiency
        {
          enableHighAccuracy: true,    // Agar akurat untuk hitung ongkir
          timeout: 10000,              // 10 detik batas waktu
          maximumAge: CACHE_MAX_AGE,   // Gunakan cache jika umur lokasi < 1 menit
        }
      );
    });
  },

  // ===============================
  // GET LOCATION UNTUK CHECKOUT (WRAPPER)
  // ===============================
  getLocationForShipping: async (): Promise<LocationResult> => {
    try {
      console.log('📍 Getting location for shipping calculation...');
      
      const location = await LocationService.getCurrentPosition();
      
      console.log('📍 Location for shipping:', {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
        fromCache: location.fromCache ? 'CACHE' : 'FRESH'
      });
      
      return location;
    } catch (error: any) {
      console.error('📍 Error getting location for shipping:', error);
      
      // 🔥 BARU: Tampilkan alert khusus untuk timeout
      if (error.message.includes('Periksa koneksi GPS')) {
        Alert.alert(
          'GPS Timeout',
          'Periksa koneksi GPS Anda. Pastikan GPS aktif dan memiliki sinyal yang baik.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error Lokasi', error.message);
      }
      
      throw error;
    }
  },

  // ===============================
  // SIMULASI GET CURRENT LOCATION (Existing - untuk backward compatibility)
  // ===============================
  getCurrentLocation: async (): Promise<{ latitude: number; longitude: number }> => {
    try {
      // 🔥 UPDATE: Gunakan getCurrentPosition yang baru
      const location = await LocationService.getCurrentPosition();
      return {
        latitude: location.latitude,
        longitude: location.longitude
      };
    } catch (error) {
      console.warn('📍 Fallback to dummy location due to error:', error);
      // Fallback ke koordinat dummy jika error
      return {
        latitude: -6.2088,
        longitude: 106.8456
      };
    }
  },

  // ===============================
  // CLEAR LOCATION CACHE
  // ===============================
  clearLocationCache: (): void => {
    cachedLocation = null;
    console.log('📍 Location cache cleared');
  },

  // ===============================
  // GET CACHE INFO (untuk debug)
  // ===============================
  getCacheInfo: (): { hasCache: boolean; cacheAge: number | null } => {
    if (!cachedLocation) {
      return { hasCache: false, cacheAge: null };
    }
    
    const cacheAge = Date.now() - cachedLocation.timestamp;
    return {
      hasCache: true,
      cacheAge
    };
  },

  // ===============================
  // GET NEARBY STORES (Existing)
  // ===============================
  getNearbyStores: async (userLat: number, userLng: number): Promise<Store[]> => {
    console.log('📍 Getting nearby stores for location:', { userLat, userLng });

    // Simulasi API call delay
    await new Promise<void>(resolve => setTimeout(resolve, 1500));

    // Data toko dummy berdasarkan lokasi
    const dummyStores: Store[] = [
      {
        id: '1',
        name: 'Toko Elektronik Central',
        address: 'Jl. Sudirman No. 123, Jakarta',
        distance: 0.5,
        rating: 4.5,
        openingHours: '08:00 - 22:00'
      },
      {
        id: '2',
        name: 'Supermarket Merdeka',
        address: 'Jl. Thamrin No. 45, Jakarta',
        distance: 1.2,
        rating: 4.2,
        openingHours: '07:00 - 21:00'
      },
      {
        id: '3',
        name: 'Mini Market 24 Jam',
        address: 'Jl. Gatot Subroto No. 67, Jakarta',
        distance: 2.1,
        rating: 4.0,
        openingHours: '24 Jam'
      },
      {
        id: '4',
        name: 'Toko Serba Ada',
        address: 'Jl. MH Thamrin No. 89, Jakarta',
        distance: 0.8,
        rating: 4.3,
        openingHours: '09:00 - 20:00'
      },
      {
        id: '5',
        name: 'Plaza Retail Center',
        address: 'Jl. Jenderal Sudirman No. 101, Jakarta',
        distance: 1.5,
        rating: 4.7,
        openingHours: '10:00 - 22:00'
      }
    ];

    // Sort by distance (terdekat dulu)
    return dummyStores.sort((a, b) => a.distance - b.distance);
  },

  // ===============================
  // FORMAT DISTANCE (Existing)
  // ===============================
  formatDistance: (distance: number): string => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(1)} km`;
  },

  // ===============================
  // FORMAT SPEED UNTUK DISPLAY
  // ===============================
  formatSpeed: (speed: number | null): string => {
    if (speed === null || speed === undefined) {
      return '0 km/h';
    }
    // Convert m/s to km/h
    const kmh = speed * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  },

  // ===============================
  // CALCULATE DISTANCE BETWEEN TWO POINTS
  // ===============================
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  },

  // ===============================
  // 🔥 GEOFENCING: CALCULATE DISTANCE IN METERS
  // ===============================
  calculateDistanceInMeters: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const distanceKm = LocationService.calculateDistance(lat1, lon1, lat2, lon2);
    return distanceKm * 1000; // Convert to meters
  },

  // ===============================
  // 🔥 GEOFENCING: CHECK IF IN RADIUS
  // ===============================
  isInRadius: (userLat: number, userLon: number, targetLat: number, targetLon: number, radiusMeters: number): boolean => {
    const distanceMeters = LocationService.calculateDistanceInMeters(userLat, userLon, targetLat, targetLon);
    return distanceMeters <= radiusMeters;
  },

  // ===============================
  // HANDLE LOCATION ERROR (Existing)
  // ===============================
  handleLocationError: (error: any) => {
    console.error('📍 Location error:', error);

    let errorMessage = 'Terjadi error saat mengambil lokasi';

    if (error.code === 1) { 
      errorMessage = 'Izin lokasi ditolak. Silakan aktifkan di Settings.';
    } else if (error.code === 2) { 
      errorMessage = 'Lokasi tidak tersedia. Pastikan GPS aktif.';
    } else if (error.code === 3) { 
      errorMessage = 'Timeout mengambil lokasi. Coba lagi.';
    }

    Alert.alert('Error Lokasi', errorMessage);
  }
};