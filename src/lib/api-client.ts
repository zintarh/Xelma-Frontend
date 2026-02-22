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

        const contentType = response.headers.get('content-type') ?? '';

        // If the response is an error, try to extract a useful message (JSON or text)
        if (!response.ok) {
            let message = `Failed to fetch ${endpoint}`;
            try {
                if (contentType.includes('application/json')) {
                    const body = await response.json();
                    // Try to pull a message property if present
                    message = (body && (body.message || body.error)) ?? JSON.stringify(body);
                } else {
                    const text = await response.text();
                    message = text || message;
                }
            } catch {
                // Fallback to status text if parsing fails
                message = response.statusText || message;
            }
            throw new ApiError(message, response.status);
        }

        // If successful but not JSON, return text (useful for void or plain-text responses)
        if (!contentType.includes('application/json')) {
            const text = await response.text();
            try {
                // Try to parse text as JSON if possible
                return (JSON.parse(text) as T);
            } catch {
                return (text as unknown as T);
            }
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
