import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GeofencingService } from '../utils/geofencingUtils';
import { requestLocationPermission } from '../utils/permissions';

const GeofencingPromo: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [inPromoRadius, setInPromoRadius] = useState(false);

  // 🔥 GEOFENCING: Cek status monitoring saat component mount
  useEffect(() => {
    const checkMonitoringStatus = () => {
      setIsMonitoring(GeofencingService.isGeofencingActive());
    };

    checkMonitoringStatus();
    
    // Update status setiap 5 detik
    const interval = setInterval(checkMonitoringStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 🔥 GEOFENCING: Handle start monitoring
  const handleStartMonitoring = async () => {
    setIsLoading(true);
    
    try {
      // Request location permission
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Izin Lokasi Diperlukan',
          'Fitur notifikasi promo membutuhkan akses lokasi untuk mendeteksi kedekatan dengan toko.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Start geofencing monitoring
      const started = GeofencingService.startPromoRadiusMonitoring();
      
      if (started) {
        setIsMonitoring(true);
        Alert.alert(
          'Notifikasi Promo Diaktifkan',
          'Anda akan mendapatkan notifikasi promo ketika berada dalam radius 100 meter dari toko utama.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('❌ Error starting geofencing:', error);
      Alert.alert('Error', 'Gagal mengaktifkan notifikasi promo');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 GEOFENCING: Handle stop monitoring
  const handleStopMonitoring = () => {
    GeofencingService.stopPromoRadiusMonitoring();
    setIsMonitoring(false);
    setCurrentDistance(null);
    setInPromoRadius(false);
    
    Alert.alert(
      'Notifikasi Promo Dimatikan',
      'Anda tidak akan mendapatkan notifikasi promo otomatis.',
      [{ text: 'OK' }]
    );
  };

  // 🔥 GEOFENCING: Manual check distance
  const handleManualCheck = async () => {
    setIsLoading(true);
    
    try {
      await GeofencingService.manualCheckPromoRadius();
      
      // Update distance info
      const distanceInfo = await GeofencingService.getCurrentDistanceToStore();
      setCurrentDistance(distanceInfo.distance);
      setInPromoRadius(distanceInfo.inPromoRadius);
      
    } catch (error) {
      console.error('❌ Manual check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mainStore = GeofencingService.getMainStoreInfo();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎊 Notifikasi Promo Radius</Text>
      
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{mainStore.name}</Text>
        <Text style={styles.storeAddress}>Radius: {mainStore.promoRadius} meter</Text>
        <Text style={styles.promoMessage}>{mainStore.promoMessage}</Text>
      </View>

      {/* Status Monitoring */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator,
          isMonitoring ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={styles.statusText}>
            {isMonitoring ? '🔔 NOTIFIKASI AKTIF' : '🔕 NOTIFIKASI NON-AKTIF'}
          </Text>
        </View>
        
        {isMonitoring && (
          <View style={styles.monitoringPulse}>
            <Text style={styles.monitoringText}>● MONITORING</Text>
          </View>
        )}
      </View>

      {/* Distance Info */}
      {currentDistance !== null && (
        <View style={[
          styles.distanceInfo,
          inPromoRadius ? styles.inRadius : styles.outOfRadius
        ]}>
          <Text style={styles.distanceTitle}>
            {inPromoRadius ? '🎉 ANDA DALAM AREA PROMO!' : '📍 Jarak ke Toko:'}
          </Text>
          <Text style={styles.distanceValue}>
            {currentDistance >= 0 ? `${currentDistance.toFixed(0)} meter` : 'Tidak dapat data'}
          </Text>
          {!inPromoRadius && currentDistance > 0 && (
            <Text style={styles.remainingText}>
              Butuh {(mainStore.promoRadius - currentDistance).toFixed(0)} meter lagi!
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!isMonitoring ? (
          <TouchableOpacity
            style={[styles.monitorButton, isLoading && styles.buttonDisabled]}
            onPress={handleStartMonitoring}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>🔔 Aktifkan Notifikasi Promo</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopMonitoring}
          >
            <Text style={styles.buttonText}>🛑 Matikan Notifikasi</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.checkButton, isLoading && styles.buttonDisabled]}
          onPress={handleManualCheck}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#007AFF" size="small" />
          ) : (
            <Text style={styles.checkButtonText}>📍 Cek Jarak Sekarang</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>Cara Kerja:</Text>
        <Text style={styles.infoText}>• Monitor lokasi setiap 50 meter pergerakan</Text>
        <Text style={styles.infoText}>• Notifikasi otomatis dalam radius 100 meter</Text>
        <Text style={styles.infoText}>• Tracking berhenti setelah promo muncul</Text>
        <Text style={styles.infoText}>• Hemat battery dengan optimasi GPS</Text>
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
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  storeInfo: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#0056b3',
    marginBottom: 8,
  },
  promoMessage: {
    fontSize: 12,
    color: '#0056b3',
    fontStyle: 'italic',
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
  statusActive: {
    backgroundColor: '#d4edda',
  },
  statusInactive: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  monitoringPulse: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  monitoringText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  distanceInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  inRadius: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  outOfRadius: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  distanceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  remainingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  monitorButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoPanel: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});

export default GeofencingPromo;