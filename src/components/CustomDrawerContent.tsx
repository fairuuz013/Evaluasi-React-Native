import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useAuth } from "../context/AuthContext";

export default function CustomDrawerContent(props: any) {
  const { logout, token } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin logout?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya, Logout",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🚪 Starting logout from drawer...");
              await logout({ clearCart: true });
              console.log("✅ Logout process completed");
            } catch (error) {
              console.error("❌ Logout error:", error);
              Alert.alert("Error", "Gagal logout. Silakan coba lagi.");
            }
          },
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header Drawer */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://pbs.twimg.com/media/G3ta9ZqWIAANbZB.jpg" }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Nyak Minyak</Text>
        <Text style={styles.userEmail}>Etatol10%@gmail.com</Text>
      </View>

      {/* Daftar menu drawer */}
      <View style={styles.menuContainer}>
        <DrawerItemList {...props} />
      </View>

      {/* Tombol logout - Hanya tampil jika user logged in */}
      {token && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 0.3,
    borderColor: "#ccc",
    backgroundColor: "#f8f8f8",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 13,
    color: "#777",
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  footer: {
    paddingVertical: 15,
    borderTopWidth: 0.3,
    borderColor: "#ccc",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#E53935",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});