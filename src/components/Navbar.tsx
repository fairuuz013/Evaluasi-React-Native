import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';


interface NavbarProps {
    title?: string;
    showBackButton?: boolean;
    rightIcon?: React.ReactNode;
}



const Navbar: React.FC<NavbarProps> = ({
    title = "Mini Store",
    showBackButton = false,
    //rightIcon
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const { toggleTheme, isDark } = useTheme()

    return (
        <View style={[styles.container, { backgroundColor: isDark ? 'black' : 'white' }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Left Section */}
            <View style={styles.left}>
                {showBackButton ? (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.logo}>🛍️</Text>
                )}
            </View>

            {/* Center Section */}
            <View style={styles.center}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            {/* Right Section */}
            <View style={[styles.right,]}>
                <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    left: {
        width: 40,
        alignItems: 'flex-start',
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },
    right: {
        width: 40,
        alignItems: 'flex-end',
    },
    logo: {
        fontSize: 24,
    },
    backButton: {
        padding: 4,
    },
    backIcon: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    iconButton: {
        padding: 4,
    },
    icon: {
        fontSize: 20,
    },
});

export default Navbar;