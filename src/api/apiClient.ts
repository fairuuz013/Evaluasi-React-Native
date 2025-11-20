import axios, { AxiosResponse, AxiosError } from "axios";
import { storage } from '../utils/storage';
import { retryWithBackoff, isRetryableError } from '../utils/retry';

const apiClient = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10000, // Increase timeout untuk retry
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    config.headers["X-Client-Platform"] = "React-Native";
    
    // Attach token jika ada
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token attached from Keychain');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor dengan Retry Logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle login response
    if (response.status === 200 && response.config.url?.includes("/auth/login")) {
      console.log('🔑 Login successful - Original data:', response.data);
      
      const accessToken = response.data.accessToken;
      
      if (!accessToken) {
        console.log('❌ No accessToken in response');
        return response;
      }
      
      console.log('✅ AccessToken found:', accessToken);
      
      return {
        ...response,
        data: {
          success: true,
          token: accessToken,
          user: response.data
        },
      } as AxiosResponse;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Jika request tidak memiliki config, langsung reject
    if (!originalRequest) {
      console.log('❌ API Error: No original request config');
      return Promise.reject(error);
    }
    
    // Cek apakah error bisa di-retry
    if (isRetryableError(error)) {
      console.log(`🔄 Retryable error detected: ${error.message}`);
      
      try {
        // Gunakan retry dengan exponential backoff
        const response = await retryWithBackoff(
          () => apiClient(originalRequest),
          {
            maxAttempts: 3,
            baseDelay: 1000,
          }
        );
        
        console.log('✅ Retry successful');
        return response;
        
      } catch (retryError) {
        console.log('💥 All retry attempts failed');
        return Promise.reject(retryError);
      }
    }
    
    // Untuk non-retryable errors, langsung reject
    console.log('❌ Non-retryable API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: originalRequest.url
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;