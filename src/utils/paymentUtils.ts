// Utility functions untuk payment processing
import { Alert } from 'react-native';

// --------------------
// TYPES
// --------------------

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  timestamp: Date;
}

// --------------------
// UTILS
// --------------------

const delay = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const generateTransactionId = (): string => {
  const random = Math.random().toString(36).substring(2, 10);
  return `TX-${Date.now()}-${random}`;
};

// --------------------
// MAIN SERVICE
// --------------------

export const PaymentService = {
  async processPayment(amount: number, description: string = ''): Promise<PaymentResult> {
    console.log(`💳 Processing payment: Rp ${amount.toLocaleString('id-ID')}`);

    try {
      // simulasi API call
      await delay(2000);

      // 90% chance success
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        const transactionId = generateTransactionId();

        console.log('✅ Payment processed successfully:', transactionId);

        return {
          success: true,
          transactionId,
          message: `Pembayaran Rp ${amount.toLocaleString('id-ID')} berhasil`,
          timestamp: new Date()
        };
      }

      console.log('❌ Payment failed (simulation)');

      return {
        success: false,
        message: `Pembayaran Rp ${amount.toLocaleString('id-ID')} gagal. Silakan coba lagi.`,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Payment processing error:', error);

      return {
        success: false,
        message: `Terjadi error saat memproses pembayaran Rp ${amount.toLocaleString('id-ID')}`,
        timestamp: new Date()
      };
    }
  },

  // Format currency untuk display
  formatCurrency(amount: number): string {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
};
