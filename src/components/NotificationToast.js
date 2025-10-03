import React from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-primary';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`toast show mb-2 ${getBgColor(notification.type)} text-white`}
          role="alert"
        >
          <div className="toast-header">
            <strong className="me-auto">
              {getIcon(notification.type)} {notification.type.toUpperCase()}
            </strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => removeNotification(notification.id)}
            ></button>
          </div>
          <div className="toast-body">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;