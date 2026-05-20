import { create } from 'zustand';
import { User, Order, Notification } from '../types';
import { Role, OrderStatus } from '../types/enums';
import { createAuthSlice } from './slices/authSlice';
import { createOrderSlice } from './slices/orderSlice';
import { createNotificationSlice } from './slices/notificationSlice';

export interface AuthSlice {
  user: User | null;
  role: Role | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setRole: (role: Role | null) => void;
}

export interface OrderSlice {
  activeOrders: Order[];
  setActiveOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  updateOrderStatus: (id: number, status: OrderStatus) => void;
  removeOrder: (id: number) => void;
  clearOrders: () => void;
}

export interface NotificationSlice {
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  setNotifications: (ns: Notification[]) => void;
  markNotificationAsRead: (id: number) => void;
  clearNotifications: () => void;
}

export type AppState = AuthSlice & OrderSlice & NotificationSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createOrderSlice(...a),
  ...createNotificationSlice(...a),
}));
