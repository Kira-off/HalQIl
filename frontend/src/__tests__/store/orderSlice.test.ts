import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';
import { OrderStatus, Role, UserStatus, AvailabilityStatus } from '@/src/types/enums';
import { Order } from '@/src/types';

const mockOrder: Order = {
  id: 42,
  user: {
    id: 'user-1',
    wallet_id: 'w-1',
    first_name: 'Alice',
    last_name: 'Smith',
    username: 'alice',
    email: 'alice@example.com',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    is_online: false,
    created_at: '',
    updated_at: '',
  },
  provider: {
    id: 10,
    user: {
      id: 'user-2',
      wallet_id: 'w-2',
      first_name: 'Bob',
      last_name: 'Builder',
      username: 'bob',
      email: 'bob@example.com',
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
      is_online: false,
      created_at: '',
      updated_at: '',
    },
    bio: 'I build things',
    availability_status: AvailabilityStatus.AVAILABLE,
    reliability: 100,
    successful_orders: 12,
    failed_orders: 0,
    created_at: '',
    skills: [],
    districts: [],
    schedule: [],
  },
  skill: null,
  status: OrderStatus.PENDING,
  description: 'Need plumbing repair',
  address: '123 Main St',
  preferred_date: null,
  auto_completed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('orderSlice', () => {
  beforeEach(() => {
    // Reset order slice state
    useAppStore.setState({
      activeOrders: [],
    });
  });

  it('should initialize with empty activeOrders array', () => {
    const state = useAppStore.getState();
    expect(state.activeOrders).toEqual([]);
  });

  it('should append a new order on addOrder', () => {
    useAppStore.getState().addOrder(mockOrder);
    
    const state = useAppStore.getState();
    expect(state.activeOrders).toHaveLength(1);
    expect(state.activeOrders[0]).toEqual(mockOrder);
  });

  it('should support updating an existing order on updateOrder', () => {
    useAppStore.getState().addOrder(mockOrder);

    const updatedOrder = { ...mockOrder, description: 'Updated plumber request' };
    useAppStore.getState().updateOrder(updatedOrder);

    const state = useAppStore.getState();
    expect(state.activeOrders).toHaveLength(1);
    expect(state.activeOrders[0].description).toBe('Updated plumber request');
  });

  it('should update correct order status on updateOrderStatus', () => {
    useAppStore.getState().addOrder(mockOrder);
    useAppStore.getState().updateOrderStatus(mockOrder.id, OrderStatus.ACTIVE);

    const state = useAppStore.getState();
    expect(state.activeOrders).toHaveLength(1);
    expect(state.activeOrders[0].status).toBe(OrderStatus.ACTIVE);
  });

  it('should remove order by ID on removeOrder', () => {
    useAppStore.getState().addOrder(mockOrder);
    useAppStore.getState().removeOrder(mockOrder.id);

    const state = useAppStore.getState();
    expect(state.activeOrders).toHaveLength(0);
  });

  it('should clear all orders on clearOrders', () => {
    useAppStore.getState().addOrder(mockOrder);
    useAppStore.getState().clearOrders();

    const state = useAppStore.getState();
    expect(state.activeOrders).toEqual([]);
  });
});
