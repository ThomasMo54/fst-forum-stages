import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import user_roles from '../../constants/user_roles';
import NotificationService from '../../services/notification.service';
import {type NotificationDto, NotificationType } from '../../types/notification.types';
import './NotificationDropdown.css';

interface NotificationDropdownProps {
    onClose: () => void;
    onUpdate: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose, onUpdate }) => {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await NotificationService.getAllNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            onUpdate();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await NotificationService.deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            onUpdate();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = async (notification: NotificationDto) => {
        try {
            if (!notification.isRead) {
                await NotificationService.markAsRead(notification.id);
                setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                ));
                onUpdate();
            }

            // Navigation selon le rôle de l'utilisateur
            if (user?.roles.includes(user_roles.STUDENT)) {
                // Étudiant -> Ses candidatures
                navigate(`/student/my-offers`);
            } else if (user?.roles.includes(user_roles.COMPANY)) {
                // Entreprise -> Candidatures de l'offre
                if (notification.offerId) {
                    navigate(`/offers/${notification.offerId}/applications`);
                }
            }

            onClose();
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const getNotificationIcon = (type: NotificationType): string => {
        switch (type) {
            case NotificationType.APPLICATION_SUBMITTED:
                return '📤';
            case NotificationType.APPLICATION_ACCEPTED:
                return '🎉';
            case NotificationType.APPLICATION_REJECTED:
                return '📋';
            case NotificationType.NEW_APPLICATION_RECEIVED:
                return '📨';
            case NotificationType.OFFER_MATCH:
                return '🎯';
            default:
                return '🔔';
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return 'À l\'instant';
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;
        if (diffInDays < 7) return `Il y a ${diffInDays}j`;

        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="notification-dropdown">
            <div className="notification-dropdown-header">
                <h3>Notifications</h3>
                {notifications.some(n => !n.isRead) && (
                    <button
                        className="mark-all-read-btn"
                        onClick={handleMarkAllAsRead}
                    >
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            <div className="notification-dropdown-body">
                {loading ? (
                    <div className="notification-loading">
                        <div className="spinner"></div>
                        <p>Chargement...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                        <span className="empty-icon">🔔</span>
                        <p>Aucune notification</p>
                    </div>
                ) : (
                    <div className="notification-list">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-icon">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <h4 className="notification-title">{notification.title}</h4>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">{formatDate(notification.createdAt)}</span>
                                </div>
                                <button
                                    className="notification-delete-btn"
                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                    aria-label="Supprimer"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;