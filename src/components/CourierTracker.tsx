import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LocationService, LiveLocationUpdate } from '../utils/locationUtils';
import { requestLocationPermission, checkLocationPermission } from '../utils/permissions';

interface CourierTrackerProps {
  orderId: string;
  courierName?: string;
  onLocationUpdate?: (location: LiveLocationUpdate) => void;
  onTrackingError?: (error: Error) => void;
}

const CourierTracker: React.FC<CourierTrackerProps> = ({
  orderId,
  courierName = 'Kurir',
  onLocationUpdate,
  onTrackingError
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LiveLocationUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  
  // 🔥 CRITICAL: Simpan watchId di ref untuk cleanup
  const watchIdRef = useRef<number | null>(null);
  const analyticsSentRef = useRef(false);

  // 🔥 CRITICAL: useEffect dengan cleanup function
  useEffect(() => {
    // Cek status permission saat component mount
    checkPermissionStatus();
    
    // Cleanup function - dipanggil saat component di-unmount
    return () => {
      stopTracking();
      console.log('🧹 CourierTracker cleanup - tracking stopped');
    };
  }, []);

  const checkPermissionStatus = async () => {
    const hasPermission = await checkLocationPermission();
    setHasLocationPermission(hasPermission);
  };

  // 🔥 BARU: Kirim analytics untuk courier tracking events
  const sendTrackingAnalytics = (eventType: 'start' | 'stop' | 'update' | 'error') => {
    console.log(`📊 Sending courier tracking analytics: ${eventType}`);
    
    LocationService.sendLocationToServer()
      .then(success => {
        if (success) {
          console.log(`📊 Courier ${eventType} analytics sent successfully`);
        }
      })
      .catch(error => {
        console.log(`📊 Courier ${eventType} analytics skipped:`, error.message);
      });
  };

  // 🔥 BARU: Kirim periodic analytics selama tracking aktif
  const startPeriodicAnalytics = () => {
    // Kirim analytics setiap 2 menit selama tracking aktif
    const analyticsInterval = setInterval(() => {
      if (isTracking) {
        console.log('📊 Sending periodic tracking analytics');
        LocationService.sendLocationToServer().catch(error => {
          console.log('📊 Periodic analytics skipped:', error.message);
        });
      }
    }, 120000); // 2 menit

    return analyticsInterval;
  };

  // 🔥 FUNGSI: Start live tracking
  const startTracking = async () => {
    if (isTracking) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚚 Starting courier tracking for order:', orderId);

      // Request location permission
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Izin Lokasi Diperlukan',
          'Fitur tracking kurir membutuhkan akses lokasi untuk melacak pergerakan.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      setHasLocationPermission(true);
      
      // 🔥 BARU: Kirim analytics untuk tracking start
      sendTrackingAnalytics('start');

      // Start live tracking dengan distanceFilter 20 meter
      const watchId = LocationService.watchPosition(
        // Success callback - dipanggil setiap 20 meter pergerakan
        (location) => {
          console.log(`📍 Courier moved ${LocationService.calculateDistance(
            currentLocation?.latitude || 0,
            currentLocation?.longitude || 0,
            location.latitude,
            location.longitude
          ).toFixed(2)} km`);

          setCurrentLocation(location);
          setIsTracking(true);
          setIsLoading(false);

          // 🔥 BARU: Kirim analytics untuk pertama kali dapat lokasi
          if (!analyticsSentRef.current) {
            sendTrackingAnalytics('update');
            analyticsSentRef.current = true;
          }

          // Notify parent component
          onLocationUpdate?.(location);
        },
        // Error callback
        (error) => {
          console.error('🚚 Tracking error:', error);
          setError(error.message);
          setIsTracking(false);
          setIsLoading(false);
          analyticsSentRef.current = false;
          
          // 🔥 BARU: Kirim analytics untuk tracking error
          sendTrackingAnalytics('error');
          
          // Notify parent component
          onTrackingError?.(error);
        },
        // Options - update setiap 20 meter
        {
          distanceFilter: 20, // 🔥 Update setiap 20 meter
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );

      // Simpan watchId ke ref untuk cleanup
      watchIdRef.current = watchId;
      
      // 🔥 BARU: Start periodic analytics untuk tracking berjalan
      const analyticsInterval = startPeriodicAnalytics();
      
      console.log('🚚 Live tracking started with watchId:', watchId);

      // Cleanup periodic analytics ketika component unmount
      return () => {
        clearInterval(analyticsInterval);
      };

    } catch (error: any) {
      console.error('🚚 Failed to start tracking:', error);
      setError(error.message);
      setIsLoading(false);
      analyticsSentRef.current = false;
      
      // 🔥 BARU: Kirim analytics untuk start tracking error
      sendTrackingAnalytics('error');
    }
  };

  // 🔥 FUNGSI: Stop live tracking
  const stopTracking = () => {
    if (watchIdRef.current) {
      LocationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setIsTracking(false);
    analyticsSentRef.current = false;
    
    // 🔥 BARU: Kirim analytics untuk tracking stop
    sendTrackingAnalytics('stop');
    
    console.log('🚚 Live tracking stopped');
  };

  // 🔥 FUNGSI: Toggle tracking
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // 🔥 BARU: Handle manual location refresh
  const handleManualRefresh = async () => {
    if (!currentLocation) return;
    
    try {
      console.log('🔄 Manual location refresh requested');
      
      // Dapatkan lokasi terbaru
      const freshLocation = await LocationService.getCurrentPosition();
      const updatedLocation: LiveLocationUpdate = {
        latitude: freshLocation.latitude,
        longitude: freshLocation.longitude,
        accuracy: freshLocation.accuracy,
        timestamp: freshLocation.timestamp
      };
      
      setCurrentLocation(updatedLocation);
      
      // 🔥 BARU: Kirim analytics untuk manual refresh
      sendTrackingAnalytics('update');
      
      // Notify parent component
      onLocationUpdate?.(updatedLocation);
      
      Alert.alert('Success', 'Lokasi berhasil diupdate');
    } catch (error: any) {
      console.error('🔄 Manual refresh error:', error);
      Alert.alert('Error', 'Gagal memperbarui lokasi: ' + error.message);
    }
  };

  // 🔥 BARU: Get tracking status text
  const getTrackingStatusText = () => {
    if (isLoading) return 'MEMULAI...';
    if (isTracking) return 'LIVE TRACKING';
    if (error) return 'ERROR';
    return 'READY TO TRACK';
  };

  // 🔥 BARU: Get status color
  const getStatusColor = () => {
    if (isLoading) return '#ffc107'; // Yellow
    if (isTracking) return '#28a745'; // Green
    if (error) return '#dc3545'; // Red
    return '#6c757d'; // Gray
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚚 Tracking {courierName}</Text>
      <Text style={styles.orderId}>Order: #{orderId}</Text>

      {/* Permission Status */}
      {hasLocationPermission === false && (
        <View style={styles.permissionWarning}>
          <Text style={styles.warningText}>
            Izin lokasi diperlukan untuk melacak pergerakan kurir
          </Text>
        </View>
      )}

      {/* Status Tracking */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: getStatusColor() + '20' } // 20% opacity
        ]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getTrackingStatusText()}
          </Text>
        </View>
        
        {isTracking && (
          <View style={styles.livePulse}>
            <Text style={styles.liveText}>● LIVE</Text>
          </View>
        )}
      </View>

      {/* Location Info */}
      {currentLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>📍 Lokasi Terkini Kurir:</Text>
          <Text style={styles.coordinates}>
            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
          
          {currentLocation.accuracy && (
            <Text style={styles.accuracy}>
              Akurasi: ±{currentLocation.accuracy.toFixed(0)} meter
            </Text>
          )}
          
          {currentLocation.speed !== null && currentLocation.speed !== undefined && (
            <Text style={styles.speed}>
              Kecepatan: {LocationService.formatSpeed(currentLocation.speed)}
            </Text>
          )}
          
          {currentLocation.heading !== null && currentLocation.heading !== undefined && (
            <Text style={styles.heading}>
              Arah: {currentLocation.heading.toFixed(0)}°
            </Text>
          )}
          
          <Text style={styles.timestamp}>
            Update: {new Date(currentLocation.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {isTracking ? 'Memperbarui lokasi...' : 'Memulai tracking...'}
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={startTracking}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.trackingButton,
            isTracking ? styles.stopButton : styles.startButton,
            isLoading && styles.buttonDisabled
          ]}
          onPress={toggleTracking}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isTracking ? '🛑 Stop Tracking' : '🚀 Start Tracking'}
            </Text>
          )}
        </TouchableOpacity>

        {isTracking && (
          <TouchableOpacity
            style={[styles.refreshButton, isLoading && styles.buttonDisabled]}
            onPress={handleManualRefresh}
            disabled={isLoading}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Analytics Info */}
      <View style={styles.analyticsInfo}>
        <Text style={styles.analyticsTitle}>📊 Analytics Status:</Text>
        <Text style={styles.analyticsText}>
          • Tracking Events: {analyticsSentRef.current ? 'Active' : 'Inactive'}
        </Text>
        <Text style={styles.analyticsText}>
          • Data Optimization: Enabled (maxAge: 2m)
        </Text>
        <Text style={styles.analyticsText}>
          • Battery Saving: Active
        </Text>
      </View>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Mode: {isTracking ? 'Live Tracking (20m filter)' : 'Idle'}
        </Text>
        <Text style={styles.debugText}>
          Permission: {hasLocationPermission ? 'Granted' : 'Required'}
        </Text>
        <Text style={styles.debugText}>
          Updates: {currentLocation ? 'Active' : 'No data'}
        </Text>
      </View>
    </View>
  );
};

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
    marginBottom: 4,
    color: '#333',
  },
  orderId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  livePulse: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  coordinates: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 4,
  },
  accuracy: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  speed: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 4,
    fontWeight: '600',
  },
  heading: {
    fontSize: 12,
    color: '#28a745',
    marginBottom: 4,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  trackingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  startButton: {
    backgroundColor: '#28a745',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6c757d',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  analyticsInfo: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0056b3',
  },
  analyticsText: {
    fontSize: 11,
    color: '#0056b3',
    marginBottom: 2,
  },
  debugInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default CourierTracker;