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
};

/** Leaderboard entry from GET /api/leaderboard?mode=UP_DOWN */
export interface LeaderboardEntry {
    id?: string | number;
    userId?: string;
    username?: string;
    name?: string;
    avatar?: string | null;
    xlm?: number;
    score?: number;
    [key: string]: unknown;
}

type LeaderboardResponse = LeaderboardEntry[] | { data?: LeaderboardEntry[]; leaderboard?: LeaderboardEntry[] };

function normalizeLeaderboard(response: LeaderboardResponse): LeaderboardEntry[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.leaderboard)) return response.leaderboard;
    return [];
}

export const leaderboardApi = {
    getLeaderboard: async (mode: string = 'UP_DOWN') => {
        const response = await apiFetch<LeaderboardResponse>(`/api/leaderboard?mode=${encodeURIComponent(mode)}`);
        return normalizeLeaderboard(response);
    },
};

export const notificationsApi = {
    getUnreadCount: () => apiFetch<{ unread: number }>('/api/notifications/unread-count'),
    getNotifications: () => apiFetch<NotificationItem[]>('/api/notifications'),
    markAsRead: (id: string) => apiFetch<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
};
