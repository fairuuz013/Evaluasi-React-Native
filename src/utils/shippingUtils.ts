import { LocationResult } from './locationUtils';

// --------------------
// TYPES
// --------------------

export interface ShippingRate {
  service: string;
  description: string;
  cost: number;
  estimatedDays: string;
}

export interface ShippingCalculation {
  success: boolean;
  fromLocation: string;
  toLocation: string;
  distance: number;
  rates: ShippingRate[];
  error?: string;
}

// --------------------
// UTILS
// --------------------

const delay = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Jarak bumi (km) – dipake buat Haversine
const EARTH_RADIUS = 6371;

// Set default destinasi
const DEFAULT_DESTINATION = {
  lat: -6.2088,
  lng: 106.8456,
  name: 'Jakarta Pusat'
};

// --------------------
// CORE LOGIC
// --------------------

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
};

const generateShippingRates = (distance: number): ShippingRate[] => {
  const baseCost = Math.max(5000, Math.floor(distance * 2000));

  return [
    { service: 'REG', description: 'Reguler', cost: baseCost, estimatedDays: '3-5 hari' },
    { service: 'EXP', description: 'Express', cost: Math.round(baseCost * 1.5), estimatedDays: '1-2 hari' },
    { service: 'SDS', description: 'Same Day', cost: Math.round(baseCost * 2), estimatedDays: 'Hari ini' },
    { service: 'INSTANT', description: 'Instant', cost: Math.round(baseCost * 3), estimatedDays: '2-4 jam' },
  ];
};

const getLocationName = (lat: number, lng: number): string => {
  if (lat === DEFAULT_DESTINATION.lat && lng === DEFAULT_DESTINATION.lng) {
    return DEFAULT_DESTINATION.name;
  }
  if (lat > -6.3 && lat < -6.1 && lng > 106.7 && lng < 106.9) {
    return 'Area Jakarta';
  }
  return `Lokasi (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

// --------------------
// MAIN SERVICE
// --------------------

export const ShippingService = {
  calculateShipping: async (
    userLocation: LocationResult,
    destinationAddress: string = DEFAULT_DESTINATION.name
  ): Promise<ShippingCalculation> => {
    console.log('🚚 Calculating shipping from:', {
      lat: userLocation.latitude,
      lng: userLocation.longitude,
      fromCache: userLocation.fromCache ? 'CACHE' : 'FRESH'
    });

    try {
      await delay(2000); // simulasi API call

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        DEFAULT_DESTINATION.lat,
        DEFAULT_DESTINATION.lng
      );

      const rates = generateShippingRates(distance);

      return {
        success: true,
        fromLocation: getLocationName(userLocation.latitude, userLocation.longitude),
        toLocation: destinationAddress,
        distance: parseFloat(distance.toFixed(1)),
        rates
      };

    } catch (err) {
      console.error('🚚 Shipping calculation error:', err);

      return {
        success: false,
        fromLocation: 'Unknown',
        toLocation: destinationAddress,
        distance: 0,
        rates: [],
        error: 'Gagal menghitung ongkir'
      };
    }
  },

  formatShippingCost: (cost: number): string =>
    `Rp ${cost.toLocaleString('id-ID')}`,

  getCheapestRate: (rates: ShippingRate[]): ShippingRate | null =>
    rates.length > 0 ? rates.reduce((min, r) => (r.cost < min.cost ? r : min)) : null
};
