export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    createdAt: string; // ISO
    read: boolean;
}

export interface UnreadCountResponse {
    unread: number;
}

export interface NotificationEventPayload {
    id: string;
    title: string;
    message: string;
    createdAt: string;
}
