import axios, { AxiosInstance, AxiosError } from "axios";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Item {
  id: string;
  title: string;
  description?: string | null;
  user_id: string;
  created_at: string;
  updated_at?: string | null;
}

export interface Log {
  id: string;
  user_id?: string | null;
  action: string;
  service: string;
  details?: string | null;
  ip_address?: string | null;
  created_at: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
          throw new Error(
            `Cannot connect to API Gateway. Check if the service is running at ${this.axiosInstance.defaults.baseURL}`
          );
        }

        const errorMessage =
          (error.response?.data as { error?: string; message?: string })
            ?.error ||
          (error.response?.data as { error?: string; message?: string })
            ?.message ||
          error.message ||
          `HTTP error! status: ${error.response?.status || "unknown"}`;

        throw new Error(errorMessage);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    const { data: response } = await this.axiosInstance.post<AuthResponse>(
      "/api/auth/register",
      { email, password, name }
    );

    if (response.token) {
      this.setToken(response.token);

      if (typeof document !== "undefined") {
        document.cookie = `auth_token=${response.token}; path=/; max-age=86400; SameSite=Lax`;
      }
    }

    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data: response } = await this.axiosInstance.post<AuthResponse>(
      "/api/auth/login",
      { email, password }
    );
    this.setToken(response.token);

    if (typeof document !== "undefined") {
      document.cookie = `auth_token=${response.token}; path=/; max-age=86400; SameSite=Lax`;
    }

    return response;
  }

  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    const { data } = await this.axiosInstance.post<{
      valid: boolean;
      user: User;
    }>("/api/auth/verify");
    return data;
  }

  logout() {
    this.setToken(null);
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0";
    }
  }

  async getItems(
    limit?: number,
    offset?: number
  ): Promise<{ items: Item[]; total: number; limit: number; offset: number }> {
    const { data } = await this.axiosInstance.get<{
      items: Item[];
      total: number;
      limit: number;
      offset: number;
    }>("/api/items", {
      params: { limit, offset },
    });
    return data;
  }

  async getItem(id: string): Promise<{ item: Item }> {
    const { data } = await this.axiosInstance.get<{ item: Item }>(
      `/api/items/${id}`
    );
    return data;
  }

  async createItem(
    title: string,
    description?: string
  ): Promise<{ message: string; item: Item }> {
    const { data } = await this.axiosInstance.post<{
      message: string;
      item: Item;
    }>("/api/items", { title, description });
    return data;
  }

  async updateItem(
    id: string,
    title: string,
    description?: string
  ): Promise<{ message: string; item: Item }> {
    const { data } = await this.axiosInstance.put<{
      message: string;
      item: Item;
    }>(`/api/items/${id}`, { title, description });
    return data;
  }

  async deleteItem(id: string): Promise<{ message: string }> {
    const { data } = await this.axiosInstance.delete<{ message: string }>(
      `/api/items/${id}`
    );
    return data;
  }

  async getLogs(
    limit?: number,
    offset?: number,
    service?: string,
    userId?: string
  ): Promise<{
    logs: Log[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { data } = await this.axiosInstance.get<{
      logs: Log[];
      total: number;
      limit: number;
      offset: number;
    }>("/api/logs", {
      params: { limit, offset, service, user_id: userId },
    });
    return data;
  }

  async getUserLogs(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{ logs: Log[]; total: number; limit: number; offset: number }> {
    const { data } = await this.axiosInstance.get<{
      logs: Log[];
      total: number;
      limit: number;
      offset: number;
    }>(`/api/logs/user/${userId}`, {
      params: { limit, offset },
    });
    return data;
  }
}

export const apiClient = new ApiClient(API_GATEWAY_URL);
