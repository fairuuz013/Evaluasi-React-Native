import axios from "axios";

// Retry config
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 800,
  maxDelay: 12000,
  backoffMultiplier: 2,
};

// ⛔ Daftar error yang jangan di-retry
const NON_RETRYABLE = ["canceled", "abort", "request aborted"];

/** Check retryable */
export const isRetryableError = (error: any): boolean => {
  const msg = error.message?.toLowerCase() ?? "";

  // STOP if canceled
  if (axios.isCancel(error) || NON_RETRYABLE.some((e) => msg.includes(e))) {
    console.log("❌ Cancel detected, no retry");
    return false;
  }

  // No response = network error
  if (!error.response) return true;

  // timeout error
  if (error.code === "ECONNABORTED" || msg.includes("timeout")) return true;

  // retry server errors 5xx
  const status = error.response?.status;
  if (status >= 500 && status < 600) return true;

  return false;
};

/** Delay helper */
const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Exponential Backoff Retry */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      console.log(`🔄 Retry attempt ${attempt}/${finalConfig.maxAttempts}`);
      return await operation();
    } catch (err: any) {
      lastError = err;

      if (!isRetryableError(err)) {
        console.log(`❌ Not retryable: ${err.message}`);
        throw err;
      }

      if (attempt === finalConfig.maxAttempts) {
        console.log("💥 Max retry attempts reached");
        throw err;
      }

      const baseDelay = finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1);
      const jitter = Math.random() * baseDelay * 0.3;
      const delayTime = Math.min(baseDelay + jitter, finalConfig.maxDelay);

      console.log(`⏳ Waiting ${Math.round(delayTime)}ms before retry...`);
      await sleep(delayTime);
    }
  }

  throw lastError;
};
