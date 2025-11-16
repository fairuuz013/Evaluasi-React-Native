// src/api/apiClient.ts
import axios, { AxiosResponse } from "axios";

const apiClient = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 7000,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    config.headers["X-Client-Platform"] = "React-Native";
    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// ✅ RESPONSE INTERCEPTOR FIX
// ==============================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cek kalo URL adalah login endpoint
    if (
      response.status === 200 &&
      response.config.url?.includes("/auth/login")
    ) {
      // Return bentuk response yang sudah di-transform
      return {
        ...response,
        data: {
          success: true,
          token: "simulated_token_xyz",
        },
      } as AxiosResponse;
    }

    return response;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
