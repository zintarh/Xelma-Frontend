import React, { useEffect } from 'react';
import { useNotificationsStore } from '../store/useNotificationsStore';
import { Clock, Check } from './icons';
import { LoadingState, ErrorState, EmptyState } from './ui/StatusStates';

const NotificationsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const list = useNotificationsStore((s) => s.list);
  const loadingList = useNotificationsStore((s) => s.loadingList);
  const errorList = useNotificationsStore((s) => s.errorList);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const fetchList = useNotificationsStore((s) => s.fetchList);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleRetry = () => {
    void fetchList();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-medium">Notifications</h3>
        <button onClick={onClose} aria-label="Close" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          Close
        </button>
      </div>

      <div className="max-h-80 overflow-auto min-h-[200px]">
        {loadingList && (
          <LoadingState message="Loading notifications..." variant="skeleton" skeletonLines={4} className="p-4" />
        )}
        {errorList && !loadingList && (
          <ErrorState
            message={typeof errorList === 'string' && errorList.trim().startsWith('<')
              ? 'Server returned non-JSON response. Check API or auth.'
              : String(errorList)}
            onRetry={handleRetry}
            className="p-4"
          />
        )}
        {!loadingList && !errorList && list.length === 0 && (
          <EmptyState
            title="No notifications"
            message="You're all caught up! New notifications will appear here."
            icon={<Clock className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />}
            className="p-4"
          />
        )}
        {!loadingList && !errorList && list.length > 0 && (
          <div>
            {list.map((n) => (
              <div key={n.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between ${n.read ? 'opacity-60' : ''}`}>
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-gray-500">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                {!n.read && (
                  <button aria-label="Mark as read" onClick={() => markAsRead(n.id)} className="ml-4 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
