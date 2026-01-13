import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Notifications.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Notifications = ({ userId, notifications }) => {
  const [initialNotifications, setInitialNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef(null);
  const previousNotificationCountRef = useRef(0);

  // Initialize notification sound
  useEffect(() => {
    // Create notification sound using Web Audio API
    audioRef.current = new Audio('https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Audio play failed (user interaction required):', err);
      });
    }
  };

  // Calculate unread count
  useEffect(() => {
    const unread = allNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [allNotifications]);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/notifications/user/${userId}`);
        const fetchedNotifications = Array.isArray(response?.data) ? response.data : [];
        setInitialNotifications(fetchedNotifications);
        setAllNotifications(fetchedNotifications);
        previousNotificationCountRef.current = fetchedNotifications.length;
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (userId) fetchNotifications();
  }, [userId]);

  // Handle new real-time notifications
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      // Check if these are truly new notifications
      const currentCount = allNotifications.length;
      const incomingCount = notifications.length;

      setAllNotifications((prevNotifications) => {
        const newNotifications = [...notifications, ...prevNotifications];
        
        // Only play sound if we actually have new notifications
        if (incomingCount > 0 && currentCount < newNotifications.length) {
          playNotificationSound();
        }
        
        return newNotifications;
      });
    }
  }, [notifications]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${notificationId}/read`);
      setAllNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/user/${userId}/read-all`);
      setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const notificationDate = new Date(date);
    const seconds = Math.floor((now - notificationDate) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return notificationDate.toLocaleDateString();
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2 className="notifications-title">
          Notifications
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} new</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read-btn">
            Mark all as read
          </button>
        )}
      </div>

      {allNotifications.length === 0 ? (
        <div className="no-notifications">
          No notifications yet!
        </div>
      ) : (
        <ul className="notifications-list">
          {allNotifications.map((note, index) => (
            <li
              key={note._id || index}
              className={`notification-item ${note.read ? 'read' : 'unread'}`}
              onClick={() => !note.read && markAsRead(note._id)}
            >
              <div className="notification-content">
                {!note.read && <span className="unread-dot"></span>}
                <p className="notification-message">
                  {`New message from ${note.sender?.name || 'Unknown'}: ${note.content || note.message}`}
                </p>
                <span className="notification-time">
                  {formatTimeAgo(note.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;