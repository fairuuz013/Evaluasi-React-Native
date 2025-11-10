import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";



export default function CustomDrawerContent(props: any) {
  const handleLogout = () => {
    // nanti kamu bisa ganti dengan fungsi logout beneran
    console.log("User logged out");
    props.navigation.replace("Login"); // misal diarahkan ke halaman Login
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header Drawer */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://pbs.twimg.com/media/G3ta9ZqWIAANbZB.jpg" }} // bisa diganti dengan foto profil user
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Nyak Minyak</Text>
        <Text style={styles.userEmail}>Etatol10%@gmail.com</Text>
      </View>

      {/* Daftar menu drawer */}
      <View style={styles.menuContainer}>
        <DrawerItemList {...props} />
      </View>

      {/* Tombol logout */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 0.3,
    borderColor: "#ccc",
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
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },
});
