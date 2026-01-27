export const NotificationType = {
    APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
    APPLICATION_ACCEPTED: 'APPLICATION_ACCEPTED',
    APPLICATION_REJECTED: 'APPLICATION_REJECTED',
    NEW_APPLICATION_RECEIVED: 'NEW_APPLICATION_RECEIVED',
    OFFER_MATCH: 'OFFER_MATCH'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface NotificationDto {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    applicationId: string | null;
    offerId: string | null;
}