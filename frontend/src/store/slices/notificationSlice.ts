import { StateCreator } from 'zustand';
import type { AppState, NotificationSlice } from '../useAppStore';
import { Notification } from '../../types';

export const createNotificationSlice: StateCreator<
  AppState,
  [],
  [],
  NotificationSlice
> = (set) => ({
  notifications: [],
  addNotification: (n: Notification) =>
    set((state) => ({ notifications: [n, ...state.notifications] })),
  setNotifications: (ns: Notification[]) => set({ notifications: ns }),
  markNotificationAsRead: (id: number) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
});
