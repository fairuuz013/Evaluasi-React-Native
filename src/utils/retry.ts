// Types untuk retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // dalam milliseconds
  maxDelay: number; // dalam milliseconds
  backoffMultiplier: number;
}

// Default configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 detik
  maxDelay: 10000, // 10 detik
  backoffMultiplier: 2,
};

// Error types yang akan di-retry
const RETRYABLE_ERRORS = [
  'NETWORK_ERROR',
  'TIMEOUT_ERROR', 
  'SERVER_ERROR',
  'ECONNABORTED',
  'ETIMEDOUT'
];

/**
 * Cek apakah error bisa di-retry
 */
export const isRetryableError = (error: any): boolean => {
  // Network errors
  if (!error.response) {
    return true;
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return true;
  }

  // Server errors (5xx)
  const status = error.response?.status;
  if (status >= 500 && status < 600) {
    return true;
  }

  // Specific error messages
  const errorMessage = error.message?.toLowerCase() || '';
  if (RETRYABLE_ERRORS.some(retryable => errorMessage.includes(retryable.toLowerCase()))) {
    return true;
  }

  return false;
};

/**
 * Calculate delay dengan exponential backoff
 */
export const calculateBackoffDelay = (
  attempt: number, 
  config: RetryConfig
): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

/**
 * Delay promise
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Exponential Backoff Retry Function
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      console.log(`🔄 Retry attempt ${attempt}/${finalConfig.maxAttempts}`);
      return await operation();
      
    } catch (error: any) {
      lastError = error;
      
      // Cek apakah error bisa di-retry
      if (!isRetryableError(error)) {
        console.log(`❌ Non-retryable error: ${error.message}`);
        throw error;
      }
      
      // Jika ini attempt terakhir, throw error
      if (attempt === finalConfig.maxAttempts) {
        console.log(`💥 All retry attempts failed after ${finalConfig.maxAttempts} attempts`);
        throw error;
      }
      
      // Calculate delay dengan jitter untuk menghindari thundering herd
      const baseDelay = calculateBackoffDelay(attempt, finalConfig);
      const jitter = Math.random() * 0.3 * baseDelay; // 30% jitter
      const delayTime = baseDelay + jitter;
      
      console.log(`⏰ Retry delay: ${Math.round(delayTime)}ms`);
      
      // Tunggu sebelum retry
      await delay(delayTime);
    }
  }
  
  throw lastError;
};

/**
 * Utility untuk wrap API calls dengan retry logic
 */
export const createRetryableApiCall = <T>(
  apiCall: () => Promise<T>,
  config?: Partial<RetryConfig>
): (() => Promise<T>) => {
  return () => retryWithBackoff(apiCall, config);
};