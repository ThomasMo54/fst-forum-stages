import api from "./api";
import type {NotificationDto} from "../types/notification.types";

const getAllNotifications = async (): Promise<NotificationDto[]> => {
    const response = await api.get<NotificationDto[]>('/notifications');
    return response.data;
};

const getUnreadNotifications = async (): Promise<NotificationDto[]> => {
    const response = await api.get<NotificationDto[]>('/notifications/unread');
    return response.data;
};

const getUnreadCount = async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/notifications/unread/count');
    return response.data.count;
};

const markAsRead = async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
};

const markMultipleAsRead = async (notificationIds: string[]): Promise<void> => {
    await api.put('/notifications/read', { notificationIds });
};

const markAllAsRead = async (): Promise<void> => {
    await api.put('/notifications/read-all');
};

const deleteNotification = async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
};

const NotificationService = {
    getAllNotifications,
    getUnreadNotifications,
    getUnreadCount,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification
};

export default NotificationService;