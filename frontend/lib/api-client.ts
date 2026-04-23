const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8077';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

async function handleResponse(response: Response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = (data && data.detail) || response.statusText || 'Unknown error';
    throw new Error(error);
  }

  return data;
}

export const apiClient = {
  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return handleResponse(response);
  },

  async post<T = any>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async put<T = any>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return handleResponse(response);
  },
};
