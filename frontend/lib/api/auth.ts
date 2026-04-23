import { apiClient } from '@/lib/api-client';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
  };
}

export const authApi = {
  login: (payload: any) => apiClient.post<LoginResponse>('/auth/login', payload),
  register: (payload: any) => apiClient.post<any>('/auth/register', payload),
  me: () => apiClient.get<any>('/auth/me'),
};
