import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export default function Settings() {
    const navigation = useNavigation();

    const handleToggleSwipe = () => {
        Alert.alert('Info', 'Fitur toggle swipe akan diimplementasikan dengan state management');
    };

    const goToHomeAndCloseDrawer = () => {
        navigation.navigate('Home' as never);
        Alert.alert('Info', 'Navigasi ke Home - Drawer akan tertutup');
    };

    return (
        <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Navigation</Text>

                    <TouchableOpacity style={styles.settingItem} onPress={handleToggleSwipe}>
                        <Text style={styles.settingText}>Toggle Swipe Gesture</Text>
                        <Text style={styles.settingStatus}>Disabled</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={goToHomeAndCloseDrawer}
                    >
                        <Text style={styles.actionButtonText}>Go to Home & Close Drawer</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    menuIcon: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 20,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingText: {
        fontSize: 16,
        color: '#333',
    },
    settingStatus: {
        fontSize: 14,
        color: '#666',
    },
    actionButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 16,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
