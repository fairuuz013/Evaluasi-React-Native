import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import CourierTracker from '../components/CourierTracker';
import { LiveLocationUpdate } from '../utils/locationUtils';

export default function CourierTrackingScreen() {
  const [lastUpdate, setLastUpdate] = useState<LiveLocationUpdate | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // Handle location updates dari CourierTracker
  const handleLocationUpdate = (location: LiveLocationUpdate) => {
    setLastUpdate(location);
    setUpdateCount(prev => prev + 1);
    
    console.log('📱 Parent received location update:', {
      count: updateCount + 1,
      lat: location.latitude,
      lng: location.longitude,
      speed: location.speed
    });
  };

  // Handle tracking errors
  const handleTrackingError = (error: Error) => {
    Alert.alert('Tracking Error', error.message);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🚚 Live Tracking Kurir</Text>
      
      <Text style={styles.subtitle}>
        Lacak pergerakan kurir secara real-time dengan update setiap 20 meter
      </Text>

      {/* Demo 1: Active Order Tracking */}
      <CourierTracker
        orderId="ORD-2024-001"
        courierName="Budi Santoso"
        onLocationUpdate={handleLocationUpdate}
        onTrackingError={handleTrackingError}
      />

      {/* Demo 2: Another Order */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>Demo Order Lain:</Text>
        <CourierTracker
          orderId="ORD-2024-002"
          courierName="Sari Wijaya"
          onLocationUpdate={handleLocationUpdate}
          onTrackingError={handleTrackingError}
        />
      </View>

      {/* Update Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 Tracking Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{updateCount}</Text>
            <Text style={styles.statLabel}>Total Updates</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {lastUpdate ? 'Active' : 'Waiting'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {lastUpdate ? '20m' : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Distance Filter</Text>
          </View>
        </View>

        {lastUpdate && (
          <View style={styles.lastUpdate}>
            <Text style={styles.lastUpdateTitle}>Last Update Details:</Text>
            <Text style={styles.lastUpdateText}>
              Coordinates: {lastUpdate.latitude.toFixed(6)}, {lastUpdate.longitude.toFixed(6)}
            </Text>
            <Text style={styles.lastUpdateText}>
              Speed: {lastUpdate.speed ? `${(lastUpdate.speed * 3.6).toFixed(1)} km/h` : 'N/A'}
            </Text>
            <Text style={styles.lastUpdateText}>
              Time: {new Date(lastUpdate.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>

      {/* Information Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Cara Kerja Live Tracking</Text>
        
        <View style={styles.infoList}>
          <Text style={styles.infoItem}>• 📍 Update setiap 20 meter pergerakan</Text>
          <Text style={styles.infoItem}>• 🔋 Optimasi baterai dengan distance filter</Text>
          <Text style={styles.infoItem}>• 🧹 Auto cleanup saat layar ditutup</Text>
          <Text style={styles.infoItem}>• ⚡ High accuracy GPS untuk akurasi</Text>
          <Text style={styles.infoItem}>• 🛑 Stop otomatis saat komponen di-unmount</Text>
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
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  demoSection: {
    marginTop: 16,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  lastUpdate: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  lastUpdateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});