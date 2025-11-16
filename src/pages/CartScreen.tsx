import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useCart } from "../context/CartContext";
import apiClient from "../api/apiClient"; // axios instance

export default function CartScreen() {
  const { cart, getLocalTotal } = useCart();
  const [total, setTotal] = useState<number>(getLocalTotal());
  const [connectionType, setConnectionType] = useState<string>("unknown");

  // pantau tipe koneksi
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setConnectionType(state.type);
    });
    return () => unsub();
  }, []);

  // Polling GET tiap 15 detik; stop kalau connectionType === 'cellular'
  useEffect(() => {
    let intervalId: number | null = null;

    // kalau seluler, kita hentikan polling dan gunakan total lokal
    if (connectionType === "cellular") {
      console.log("📵 Polling OFF (cellular) - hemat kuota");
      setTotal(getLocalTotal());
      return;
    }

    const fetchTotalFromApi = async () => {
      try {
        // contoh endpoint DummyJSON: /carts/1 (sesuaikan backend lo)
        const res = await apiClient.get("/carts/1");
        // kalau API punya structure berbeda, sesuaikan parsingnya:
        // misal res.data.total atau hitung dari res.data.products
        if (res?.data?.total !== undefined) {
          setTotal(res.data.total);
        } else if (res?.data?.products) {
          const sum = res.data.products.reduce(
            (acc: number, it: any) => acc + it.price * (it.quantity ?? it.qty ?? 1),
            0
          );
          setTotal(sum);
        } else {
          // fallback: pakai local calc
          setTotal(getLocalTotal());
        }
      } catch (err) {
        console.log("Error fetch cart total:", err);
        // fallback ke local total kalau error
        setTotal(getLocalTotal());
      }
    };

    // panggil sekali di awal
    fetchTotalFromApi();

    // set interval polling tiap 15 detik
    intervalId = setInterval(() => {
      console.log("🔄 Polling cart (15s)...");
      fetchTotalFromApi();
    }, 15000) as unknown as number; // cast supaya TS happy di RN (setInterval returns number)

    // cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionType, cart]); // depend on cart so if local cart changes we can recalc

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keranjang Belanja</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSub}>
              {item.quantity} x Rp {item.price}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>Keranjang kosong</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: Rp {total}</Text>
        <Text style={styles.conn}>Koneksi: {connectionType}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  item: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#eee", marginBottom: 8 },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemSub: { marginTop: 6, color: "#444" },
  footer: { marginTop: 16, padding: 12, backgroundColor: "#f7f7f7", borderRadius: 8 },
  total: { fontSize: 18, fontWeight: "700" },
  conn: { marginTop: 6, fontSize: 12, color: "#666" },
});
