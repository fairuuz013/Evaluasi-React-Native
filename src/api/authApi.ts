// src/api/authApi.ts
import apiClient from "./apiClient";

export interface LoginResponse {
  success: boolean;
  token: string;
}

export const loginUser = (username: string, password: string) => {
  return apiClient.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
};
