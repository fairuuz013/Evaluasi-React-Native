import apiClient from "./apiClient";

export interface LoginResponse {
  success: boolean;
  token: string;
  user?: any; // Data user dari DummyJSON
}

export const loginUser = (username: string, password: string) => {
  return apiClient.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
};