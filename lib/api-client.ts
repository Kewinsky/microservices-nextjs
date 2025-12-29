const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

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
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP error! status: ${response.status}` 
        }));
        throw new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Jeśli to błąd sieci (CORS, connection refused, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Nie można połączyć się z API Gateway. Sprawdź czy serwis działa na ${this.baseUrl}`);
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    return this.request<{ valid: boolean; user: User }>('/api/auth/verify', {
      method: 'POST',
    });
  }

  logout() {
    this.setToken(null);
  }

  // CRUD endpoints
  async getItems(limit?: number, offset?: number): Promise<{ items: Item[]; total: number; limit: number; offset: number }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return this.request<{ items: Item[]; total: number; limit: number; offset: number }>(
      `/api/items${query ? `?${query}` : ''}`
    );
  }

  async getItem(id: string): Promise<{ item: Item }> {
    return this.request<{ item: Item }>(`/api/items/${id}`);
  }

  async createItem(title: string, description?: string): Promise<{ message: string; item: Item }> {
    return this.request<{ message: string; item: Item }>('/api/items', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  }

  async updateItem(id: string, title: string, description?: string): Promise<{ message: string; item: Item }> {
    return this.request<{ message: string; item: Item }>(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    });
  }

  async deleteItem(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Logs endpoints
  async getLogs(limit?: number, offset?: number, service?: string, userId?: string): Promise<{
    logs: Log[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (service) params.append('service', service);
    if (userId) params.append('user_id', userId);

    const query = params.toString();
    return this.request<{ logs: Log[]; total: number; limit: number; offset: number }>(
      `/api/logs${query ? `?${query}` : ''}`
    );
  }

  async getUserLogs(userId: string, limit?: number, offset?: number): Promise<{ logs: Log[]; total: number; limit: number; offset: number }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const query = params.toString();
    return this.request<{ logs: Log[]; total: number; limit: number; offset: number }>(
      `/api/logs/user/${userId}${query ? `?${query}` : ''}`
    );
  }
}

export const apiClient = new ApiClient(API_GATEWAY_URL);

