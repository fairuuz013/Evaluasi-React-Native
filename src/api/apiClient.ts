import axios, { AxiosResponse, AxiosError } from "axios";
import { storage } from '../utils/storage';
import { retryWithBackoff, isRetryableError } from '../utils/retry';

const apiClient = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 15000,
});

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  async (config) => {
    config.headers["X-Client-Platform"] = "React-Native";

    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Token attached from Keychain");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Example: parse login response
    if (response.status === 200 && response.config.url?.includes("/auth/login")) {
      const accessToken = response.data.accessToken;

      return {
        ...response,
        data: {
          success: true,
          token: accessToken,
          user: response.data,
        },
      } as AxiosResponse;
    }

    return response;
  },

  async (error: AxiosError) => {
    // ⛔ CANCEL PROTECTION
    if (axios.isCancel(error) || error.message?.toLowerCase().includes("canceled")) {
      console.log("❌ Request was canceled - no retry");
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (!originalRequest) {
      console.log("❌ No original request config");
      return Promise.reject(error);
    }

    // RETRYABLE?
    if (isRetryableError(error)) {
      console.log(`🔄 Retryable error detected: ${error.message}`);

      try {
        const response = await retryWithBackoff(() => apiClient(originalRequest), {
          maxAttempts: 3,
          baseDelay: 1000,
        });

        console.log("✅ Retry successful");
        return response;
      } catch (retryError) {
        console.log("💥 All retry attempts failed");
        return Promise.reject(retryError);
      }
    }

    // NON-RETRYABLE
    console.log("❌ API Error (Non-retryable):", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
