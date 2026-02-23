import type { Guide, Tip } from '../types/education';
import type { NotificationItem } from '../types/notification';
import { apiFetch } from './api';

export { ApiError } from './api';

export const educationApi = {
    getGuides: () => apiFetch<Guide[]>('/api/education/guides'),
    getTip: () => apiFetch<Tip | null>('/api/education/tip'),
};

export interface Round {
    id: string | number;
    status?: string;
    startsAt?: string;
    endsAt?: string;
    resolvedAt?: string;
    [key: string]: unknown;
}

export const roundsApi = {
    getActive: () => apiFetch<Round | null>('/api/rounds/active'),
};

export interface UserPrediction {
    id: string | number;
    direction?: string;
    stake?: string | number;
    exactPrice?: string | number;
    roundId?: string | number;
    status?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export interface SubmitPredictionRequest {
    direction: 'UP' | 'DOWN';
    stake: string;
    exactPrice?: string;
    isLegend: boolean;
}

type UserPredictionsResponse =
    | UserPrediction[]
    | {
        predictions?: UserPrediction[];
        data?: UserPrediction[];
    };

function normalizeUserPredictions(response: UserPredictionsResponse): UserPrediction[] {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response.predictions)) {
        return response.predictions;
    }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    return [];
}

export const predictionsApi = {
    getUserHistory: async (userId: string) => {
        const response = await apiFetch<UserPredictionsResponse>(`/api/predictions/user/${encodeURIComponent(userId)}`);
        return normalizeUserPredictions(response);
    },
    submit: async (prediction: SubmitPredictionRequest) => {
        return apiFetch<UserPrediction>('/api/predictions/submit', {
            method: 'POST',
            body: JSON.stringify(prediction),
        });
    },
};

export const notificationsApi = {
    getUnreadCount: () => apiFetch<{ unread: number }>('/api/notifications/unread-count'),
    getNotifications: () => apiFetch<NotificationItem[]>('/api/notifications'),
    markAsRead: (id: string) => apiFetch<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
};
