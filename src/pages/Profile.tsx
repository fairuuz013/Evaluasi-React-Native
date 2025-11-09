import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity
} from "react-native";
import Icon from "@react-native-vector-icons/fontawesome6";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
    const { isDark } = useTheme();
    const styles = getStyles(isDark);

    return (
        <View style={styles.mainContainer}>
            <Navbar title="My Profile" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Profile */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXKreSjWjRPlnB3T_r6FAkvIGtJBMfA7ey7MK0Z9qnbMRh4R9LLNexiDcXDTtfdJ_k9z0&usqp=CAU' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>Nyak Minyak</Text>
                    <Text style={styles.email}>CintaAlam92@gmail.com</Text>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.stats}>
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

                {/* Menu Options */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon iconStyle="solid" name="cart-shopping" size={20} color={isDark ? "#ccc" : "#666"} />
                        <Text style={styles.menuText}>My Orders</Text>
                        <Icon iconStyle="solid" name="chevron-right" size={16} color={isDark ? "#666" : "#999"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon name="heart" size={20} color={isDark ? "#ccc" : "#666"} />
                        <Text style={styles.menuText}>Wishlist</Text>
                        <Icon iconStyle="solid" name="chevron-right" size={16} color={isDark ? "#666" : "#999"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon iconStyle="solid" name="location-dot" size={20} color={isDark ? "#ccc" : "#666"} />
                        <Text style={styles.menuText}>Addresses</Text>
                        <Icon iconStyle="solid" name="chevron-right" size={16} color={isDark ? "#666" : "#999"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon name="credit-card" size={20} color={isDark ? "#ccc" : "#666"} />
                        <Text style={styles.menuText}>Payment Methods</Text>
                        <Icon iconStyle="solid" name="chevron-right" size={16} color={isDark ? "#666" : "#999"} />
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon iconStyle="solid" name="headset" size={20} color={isDark ? "#ccc" : "#666"} />
                        <Text style={styles.menuText}>Customer Support</Text>
                        <Icon iconStyle="solid" name="chevron-right" size={16} color={isDark ? "#666" : "#999"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon name="circle-question" size={20} color={isDark ? "#ccc" : "#666"} />
                        <Text style={styles.menuText}>Help Center</Text>
                        <Icon iconStyle="solid" name="chevron-right" size={16} color={isDark ? "#666" : "#999"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon iconStyle="solid" name="gear" size={20} color={isDark ? "#ccc" : "#666"} />
                        <Text style={styles.menuText}>Settings</Text>
                        <Icon iconStyle="solid" name="chevron-right" size={16} color={isDark ? "#666" : "#999"} />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton}>
                    <Icon iconStyle="solid" name="right-from-bracket" size={20} color="#FF3B30" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: isDark ? '#121212' : '#f8f9fa',
        paddingTop: 30
    },
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: isDark ? '#1e1e1e' : 'white',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#333' : '#e0e0e0',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDark ? '#fff' : '#333',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: isDark ? '#ccc' : '#666',
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
    stats: {
        flexDirection: 'row',
        backgroundColor: isDark ? '#1e1e1e' : 'white',
        padding: 20,
        marginTop: 1,
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
        color: isDark ? '#ccc' : '#666',
    },
    menuSection: {
        backgroundColor: isDark ? '#1e1e1e' : 'white',
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDark ? '#fff' : '#333',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#333' : '#f0f0f0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#333' : '#f0f0f0',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: isDark ? '#fff' : '#333',
        marginLeft: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#1e1e1e' : 'white',
        margin: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
        marginLeft: 8,
    },
});