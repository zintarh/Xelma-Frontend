import type { Guide, Tip } from '../types/education';
import type { NotificationItem } from '../types/notification';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw new ApiError(`Failed to fetch ${endpoint}`, response.status);
        }

        return await response.json();
    } catch (rawError) {
        if (rawError instanceof ApiError) throw rawError;
        if (rawError instanceof Error) throw new ApiError(rawError.message);
        throw new ApiError(String(rawError ?? 'An unexpected error occurred'));
    }
}

export const educationApi = {
    getGuides: () => fetchApi<Guide[]>('/api/education/guides'),
    getTip: () => fetchApi<Tip | null>('/api/education/tip'),
};

export const notificationsApi = {
    getUnreadCount: () => fetchApi<{ unread: number }>('/api/notifications/unread-count'),
    getNotifications: () => fetchApi<NotificationItem[]>('/api/notifications'),
    markAsRead: (id: string) => fetchApi<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
};
