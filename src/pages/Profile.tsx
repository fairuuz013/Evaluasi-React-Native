// pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// Simulasi state autentikasi
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Simulasi cek token dari storage
    useEffect(() => {
        const checkAuth = async () => {
            // Di app real, ini akan cek ke AsyncStorage atau context
            const token = await new Promise(resolve =>
                setTimeout(() => resolve('dummy-token'), 100)
            );
            setIsAuthenticated(!!token);
        };
        checkAuth();
    }, []);

    return { isAuthenticated, setIsAuthenticated };
};

export default function Profile() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { isAuthenticated, setIsAuthenticated } = useAuth();

    // Refresh auth status ketika screen focused
    useEffect(() => {
        if (isFocused) {
            // Re-check authentication status
            const checkAuth = async () => {
                const token = await new Promise(resolve =>
                    setTimeout(() => resolve('dummy-token'), 100)
                );
                setIsAuthenticated(!!token);
            };
            checkAuth();
        }
    }, [isFocused]);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    // Soal Praktik 5: Auth Guard
    if (!isAuthenticated) {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.authContainer}>
                    <Text style={styles.authTitle}>Harap Login untuk mengakses</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.container}>
                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/100' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>Nyak Minyak</Text>
                    <Text style={styles.userEmail}>CintaAlam92@gmail.com</Text>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Wishlist</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>2</Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>🛒</Text>
                        <Text style={styles.menuText}>My Orders</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>❤️</Text>
                        <Text style={styles.menuText}>Wishlist</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>📍</Text>
                        <Text style={styles.menuText}>Addresses</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutIcon}>🚪</Text>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
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
    authContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    authTitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    profileSection: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 24,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: '#e0e0e0',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    editButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    statsSection: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    menuSection: {
        backgroundColor: '#fff',
        marginBottom: 16,
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
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    arrow: {
        fontSize: 20,
        color: '#999',
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    logoutIcon: {
        fontSize: 18,
        color: '#FF3B30',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
        marginLeft: 8,
    },
});