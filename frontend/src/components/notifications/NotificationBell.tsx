import React, { useState, useEffect } from 'react';
import NotificationService from '../../services/notification.service';
import NotificationDropdown from './NotificationDropdown';
import './NotificationBell.css';

interface NotificationBellProps {
    isOpen: boolean;
    onToggle: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isOpen, onToggle }) => {
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const fetchUnreadCount = async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Polling toutes les 30 secondes pour mettre à jour le compteur
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleNotificationUpdate = () => {
        fetchUnreadCount();
    };

    return (
        <div className="notification-bell-container">
            <button
                className="notification-bell-button"
                onClick={onToggle}
                aria-label="Notifications"
            >
                <i className="fa-solid fa-bell" style={{ fontSize: '20px' }}></i>
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown
                    onClose={onToggle}
                    onUpdate={handleNotificationUpdate}
                />
            )}
        </div>
    );
};

export default NotificationBell;