import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { isDark } = useTheme();

    const styles = getStyles(isDark);

    return (
        <View style={styles.mainContainer}>
            <Navbar />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Mini Store</Text>
                    <Text style={styles.heroSubtitle}>Simple shopping experience</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate("Products")}
                    >
                        <Text style={styles.actionEmoji}>📦</Text>
                        <Text style={styles.actionText}>Browse Products</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate("Profile")}
                    >
                        <Text style={styles.actionEmoji}>👤</Text>
                        <Text style={styles.actionText}>Your Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    <Text style={styles.sectionTitle}>Why Shop With Us</Text>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureEmoji}>🚚</Text>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>Fast Delivery</Text>
                            <Text style={styles.featureDesc}>Quick shipping</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureEmoji}>💳</Text>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>Secure Payment</Text>
                            <Text style={styles.featureDesc}>Safe transactions</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureEmoji}>⭐</Text>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>Quality Products</Text>
                            <Text style={styles.featureDesc}>Best items</Text>
                        </View>
                    </View>
                </View>

                {/* CTA */}
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => navigation.navigate("Products")}
                >
                    <Text style={styles.ctaText}>Start Shopping →</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: isDark ? '#121212' : '#fff',
        paddingTop: 30
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    hero: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: isDark ? '#fff' : '#333',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        color: isDark ? '#ccc' : '#666',
    },
    actions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#007AFF',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    actionText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    features: {
        padding: 20,
        backgroundColor: isDark ? '#1e1e1e' : 'white',
        margin: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDark ? '#fff' : '#333',
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#333' : '#f0f0f0',
    },
    featureEmoji: {
        fontSize: 20,
        marginRight: 12,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: isDark ? '#fff' : '#333',
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 14,
        color: isDark ? '#ccc' : '#666',
    },
    ctaButton: {
        margin: 20,
        backgroundColor: isDark ? '#007AFF' : '#333',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    ctaText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});