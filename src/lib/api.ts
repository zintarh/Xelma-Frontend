import { useAuthStore } from '../store/useAuthStore';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface ApiErrorShape {
  message: string;
  status: number;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { jwt, clearAuth } = useAuthStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuth();
    throw new ApiError('Unauthorized: session expired', 401);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new ApiError(text || `Request failed: ${endpoint}`, response.status);
  }

  return response.json() as Promise<T>;
}
