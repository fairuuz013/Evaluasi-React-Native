import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';

interface LoadingIndicatorProps {
  visible: boolean;
  message?: string;
  progress?: number;
  type?: 'spinner' | 'progress';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  visible,
  message = 'Mengupload...',
  progress = 0,
  type = 'spinner',
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator 
            size="large" 
            color="#007AFF" 
            style={styles.spinner}
          />
          
          <Text style={styles.message}>{message}</Text>
          
          {type === 'progress' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default LoadingIndicator;