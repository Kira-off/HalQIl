import { StateCreator } from 'zustand';
import type { AppState, OrderSlice } from '../useAppStore';
import { OrderStatus } from '../../types/enums';
import { Order } from '../../types';

export const createOrderSlice: StateCreator<
  AppState,
  [],
  [],
  OrderSlice
> = (set) => ({
  activeOrders: [],
  setActiveOrders: (orders: Order[]) => set({ activeOrders: orders }),
  addOrder: (order: Order) =>
    set((state) => ({ activeOrders: [...state.activeOrders, order] })),
  updateOrder: (order: Order) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((o) => (o.id === order.id ? order : o)),
    })),
  updateOrderStatus: (id: number, status: OrderStatus) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
  removeOrder: (id: number) =>
    set((state) => ({
      activeOrders: state.activeOrders.filter((o) => o.id !== id),
    })),
  clearOrders: () => set({ activeOrders: [] }),
});
