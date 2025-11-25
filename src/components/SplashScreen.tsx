import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface SplashScreenProps {
  loadingText?: string;
  progress?: number;
  currentTask?: string;
}

export default function SplashScreen({ 
  loadingText = "Memuat aplikasi...", 
  progress,
  currentTask 
}: SplashScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛍️ MiniEcommerce</Text>
      <ActivityIndicator size="large" color="#007AFF" />
      
      <Text style={styles.loadingText}>
        {currentTask || loadingText}
      </Text>
      
      {progress !== undefined && (
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}%
        </Text>
      )}
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${(progress || 0) * 100}%` }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#007AFF',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  progressText: {
    marginTop: 10,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
});