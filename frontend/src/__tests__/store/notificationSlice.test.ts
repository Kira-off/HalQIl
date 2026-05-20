import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';
import { NotificationType } from '@/src/types/enums';
import { Notification } from '@/src/types';

const mockNotification: Notification = {
  id: 1,
  title: 'Order Status Change',
  message: 'Your order status has been updated to active.',
  type: NotificationType.SYSTEM,
  is_read: false,
  is_global: false,
  created_at: new Date().toISOString(),
};

describe('notificationSlice', () => {
  beforeEach(() => {
    // Reset notification slice state
    useAppStore.setState({
      notifications: [],
    });
  });

  it('should initialize with empty notifications array', () => {
    const state = useAppStore.getState();
    expect(state.notifications).toEqual([]);
  });

  it('should add notification to the top on addNotification', () => {
    useAppStore.getState().addNotification(mockNotification);

    const state = useAppStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]).toEqual(mockNotification);

    // Adding second one should prepended
    const secondNotification = { ...mockNotification, id: 2, title: 'New Alert' };
    useAppStore.getState().addNotification(secondNotification);

    const state2 = useAppStore.getState();
    expect(state2.notifications).toHaveLength(2);
    expect(state2.notifications[0].id).toBe(2); // prepended
  });

  it('should mark correct notification as read', () => {
    useAppStore.getState().addNotification(mockNotification);
    useAppStore.getState().markNotificationAsRead(mockNotification.id);

    const state = useAppStore.getState();
    expect(state.notifications[0].is_read).toBe(true);
  });

  it('should clear notifications on clearNotifications', () => {
    useAppStore.getState().addNotification(mockNotification);
    useAppStore.getState().clearNotifications();

    const state = useAppStore.getState();
    expect(state.notifications).toEqual([]);
  });
});
