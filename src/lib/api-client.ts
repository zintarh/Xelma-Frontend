import type { Guide, Tip } from '../types/education';

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
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
}

export const educationApi = {
    getGuides: () => fetchApi<Guide[]>('/api/education/guides'),
    getTip: () => fetchApi<Tip | null>('/api/education/tip'),
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
    getActive: () => fetchApi<Round | null>('/api/rounds/active'),
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
        const response = await fetchApi<UserPredictionsResponse>(`/api/predictions/user/${encodeURIComponent(userId)}`);
        return normalizeUserPredictions(response);
    },
};
