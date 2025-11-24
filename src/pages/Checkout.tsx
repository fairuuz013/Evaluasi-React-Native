import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { KeychainService } from "../utils/keychain";
import { PaymentService } from "../utils/paymentUtils";
import { LocationService, LocationResult } from "../utils/locationUtils";
import { ShippingService, ShippingRate, ShippingCalculation } from "../utils/shippingUtils";
import { requestLocationPermission } from "../utils/permissions";

function CheckoutContent() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { product } = route.params || {};
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingCalculation, setShippingCalculation] = useState<ShippingCalculation | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Tidak ada produk untuk checkout</Text>
      </View>
    );
  }

  const productPrice = product.price ?? 0;
  const productName = product.name ?? product.title ?? "Produk";
  const totalPrice = productPrice + (selectedShipping?.cost ?? 0);

  // 🔥 BARU: useEffect untuk auto calculate shipping saat component mount
  useEffect(() => {
    calculateShippingAutomatically();
  }, []);

  // 🔥 BARU: Fungsi untuk hitung ongkir otomatis
  const calculateShippingAutomatically = async () => {
    if (isCalculatingShipping) return;
    
    setIsCalculatingShipping(true);
    
    try {
      console.log('🚚 Starting automatic shipping calculation...');
      
      // Step 1: Request location permission
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Izin Lokasi Diperlukan',
          'Fitur hitung ongkir membutuhkan akses lokasi untuk perhitungan yang akurat.',
          [{ text: 'OK' }]
        );
        setIsCalculatingShipping(false);
        return;
      }

      // Step 2: Dapatkan lokasi dengan optimasi battery
      console.log('🚚 Getting location for shipping...');
      const location = await LocationService.getLocationForShipping();
      setUserLocation(location);
      
      // Step 3: Hitung ongkir berdasarkan lokasi
      console.log('🚚 Calculating shipping rates...');
      const calculation = await ShippingService.calculateShipping(location);
      setShippingCalculation(calculation);
      
      // Step 4: Auto-select cheapest shipping
      if (calculation.success && calculation.rates.length > 0) {
        const cheapest = ShippingService.getCheapestRate(calculation.rates);
        setSelectedShipping(cheapest);
        console.log('🚚 Auto-selected cheapest shipping:', cheapest);
      }
      
    } catch (error: any) {
      console.error('🚚 Shipping calculation error:', error);
      
      // Error sudah dihandle di LocationService.getLocationForShipping()
      setShippingCalculation({
        success: false,
        fromLocation: 'Unknown',
        toLocation: 'Jakarta Pusat',
        distance: 0,
        rates: [],
        error: error.message
      });
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // 🔥 BARU: Render shipping rates
  const renderShippingRate = (rate: ShippingRate) => (
    <TouchableOpacity
      key={rate.service}
      style={[
        styles.shippingOption,
        selectedShipping?.service === rate.service && styles.shippingOptionSelected
      ]}
      onPress={() => setSelectedShipping(rate)}
      disabled={isProcessing}
    >
      <View style={styles.shippingInfo}>
        <Text style={styles.shippingService}>{rate.description}</Text>
        <Text style={styles.shippingEstimate}>{rate.estimatedDays}</Text>
      </View>
      <Text style={styles.shippingCost}>
        {ShippingService.formatShippingCost(rate.cost)}
      </Text>
    </TouchableOpacity>
  );

  // 🔥 BARU: Handle konfirmasi transaksi dengan shipping
  const handleBiometricConfirmation = async () => {
    if (isProcessing || !selectedShipping) return;
    
    setIsProcessing(true);
    
    try {
      console.log('💳 Starting payment with shipping...');
      
      const totalAmount = productPrice + selectedShipping.cost;
      
      // Panggil simplePrompt untuk konfirmasi transaksi
      const isConfirmed = await KeychainService.simplePrompt(
        `Konfirmasi Transfer ${PaymentService.formatCurrency(totalAmount)}`,
        {
          title: 'Konfirmasi Pembayaran',
          subtitle: `Transfer ${PaymentService.formatCurrency(totalAmount)}`,
          description: `Produk: ${productName}\nOngkir: ${ShippingService.formatShippingCost(selectedShipping.cost)}`,
          cancel: 'Batalkan'
        }
      );
      
      if (isConfirmed) {
        console.log('✅ Biometric confirmed, processing payment...');
        
        // Proses pembayaran dengan total amount termasuk ongkir
        const paymentResult = await PaymentService.processPayment(totalAmount, `${productName} + Ongkir`);
        
        if (paymentResult.success) {
          Alert.alert(
            'Pembayaran Berhasil!',
            `Total ${PaymentService.formatCurrency(totalAmount)} berhasil diproses.\n\n` +
            `- Produk: ${PaymentService.formatCurrency(productPrice)}\n` +
            `- Ongkir: ${ShippingService.formatShippingCost(selectedShipping.cost)}\n` +
            `ID Transaksi: ${paymentResult.transactionId}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Tambah ke cart dan navigate
                  addToCart({
                    id: product.id,
                    name: productName,
                    price: productPrice,
                    imageUrl: product.imageUrl ?? product.thumbnail ?? "",
                    quantity: 1,
                  });
                  navigation.navigate("Drawer", {
                    screen: "CartScreen"
                  });
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Pembayaran Gagal',
            paymentResult.message
          );
        }
      } else {
        Alert.alert(
          'Transaksi Dibatalkan',
          'Konfirmasi pembayaran dibatalkan.'
        );
      }
    } catch (error) {
      console.error('❌ Error during payment confirmation:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat memproses pembayaran.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Fungsi existing tetap ada (fallback)
  const handleAddToCartAndGo = () => {
    addToCart({
      id: product.id,
      name: productName,
      price: productPrice,
      imageUrl: product.imageUrl ?? product.thumbnail ?? "",
      quantity: 1,
    });
    navigation.navigate("Drawer", {
      screen: "CartScreen"
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      
      <View style={styles.productInfo}>
        <Text style={styles.label}>Produk:</Text>
        <Text style={styles.text}>{productName}</Text>
        
        <Text style={styles.label}>Harga Produk:</Text>
        <Text style={styles.priceText}>
          {PaymentService.formatCurrency(productPrice)}
        </Text>
      </View>

      {/* 🔥 BARU: SECTION HITUNG ONGKIR */}
      <View style={styles.shippingSection}>
        <Text style={styles.shippingTitle}>🚚 Pengiriman</Text>
        
        {userLocation && (
          <Text style={styles.locationInfo}>
            Lokasi pengiriman: {shippingCalculation?.fromLocation}
            {userLocation.fromCache && ' (Data cache)'}
          </Text>
        )}
        
        {isCalculatingShipping ? (
          <View style={styles.shippingLoading}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.shippingLoadingText}>Menghitung ongkir...</Text>
          </View>
        ) : shippingCalculation ? (
          shippingCalculation.success ? (
            <View>
              <Text style={styles.shippingDistance}>
                Jarak: {shippingCalculation.distance} km
              </Text>
              
              <Text style={styles.shippingOptionsTitle}>Pilih layanan:</Text>
              {shippingCalculation.rates.map(renderShippingRate)}
              
              {!selectedShipping && (
                <Text style={styles.shippingWarning}>
                  Silakan pilih layanan pengiriman
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.shippingError}>
              <Text style={styles.shippingErrorText}>
                {shippingCalculation.error || 'Gagal menghitung ongkir'}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={calculateShippingAutomatically}
              >
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )
        ) : null}
      </View>

      {/* 🔥 BARU: TOTAL HARGA */}
      {selectedShipping && (
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Pembayaran:</Text>
          <Text style={styles.totalAmount}>
            {PaymentService.formatCurrency(totalPrice)}
          </Text>
          <Text style={styles.totalBreakdown}>
            {PaymentService.formatCurrency(productPrice)} (Produk) + {' '}
            {ShippingService.formatShippingCost(selectedShipping.cost)} (Ongkir)
          </Text>
        </View>
      )}

      {/* TOMBOL BAYAR DENGAN BIOMETRIK */}
      <TouchableOpacity 
        style={[
          styles.biometricButton,
          (isProcessing || !selectedShipping) && styles.buttonDisabled
        ]} 
        onPress={handleBiometricConfirmation}
        disabled={isProcessing || !selectedShipping}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.biometricButtonText}>
            🔐 Bayar {selectedShipping ? PaymentService.formatCurrency(totalPrice) : ''}
          </Text>
        )}
      </TouchableOpacity>

      {/* Tombol existing (fallback) */}
      <TouchableOpacity 
        style={[
          styles.confirmButton,
          isProcessing && styles.buttonDisabled
        ]} 
        onPress={handleAddToCartAndGo}
        disabled={isProcessing}
      >
        <Text style={styles.confirmText}>Masukkan ke Keranjang</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        disabled={isProcessing}
      >
        <Text style={styles.closeButtonText}>
          {isProcessing ? 'Proses...' : 'Tutup'}
        </Text>
      </TouchableOpacity>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>Memproses pembayaran...</Text>
        </View>
      )}
    </ScrollView>
  );
}

// EXPORT tetap sama
export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 30,
    textAlign: 'center'
  },
  productInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginTop: 10,
    color: '#666'
  },
  text: { 
    fontSize: 18, 
    marginBottom: 10,
    fontWeight: '500'
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10
  },
  // 🔥 BARU: Styles untuk shipping section
  shippingSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  shippingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  locationInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic'
  },
  shippingLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  shippingLoadingText: {
    marginLeft: 12,
    color: '#666',
    fontSize: 14
  },
  shippingDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  shippingOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  shippingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  shippingOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd'
  },
  shippingInfo: {
    flex: 1,
  },
  shippingService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  shippingEstimate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  shippingCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745'
  },
  shippingWarning: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8
  },
  shippingError: {
    alignItems: 'center',
    padding: 12,
  },
  shippingErrorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  // 🔥 BARU: Styles untuk total section
  totalSection: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745'
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4
  },
  totalBreakdown: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  // Existing styles
  biometricButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  biometricButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: { 
    marginTop: 8,
    backgroundColor: "#28a745", 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8,
    alignItems: 'center'
  },
  confirmText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  closeButton: { 
    marginTop: 16, 
    backgroundColor: "#6c757d", 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8,
    alignItems: 'center'
  },
  closeButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  error: { 
    color: "red", 
    fontSize: 18 
  },
  buttonDisabled: {
    opacity: 0.6
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500'
  }
});