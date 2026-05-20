import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOrderSocket } from '@/src/hooks/useOrderSocket';
import { socketManager } from '@/src/lib/socket/socketManager';
import { SOCKET_EVENTS } from '@/src/lib/socket/socketEvents';
import { useAppStore } from '@/src/store/useAppStore';
import { Role, MessageType, OrderStatus, UserStatus } from '@/src/types/enums';
import { Order, Message, User } from '@/src/types';

// Mock react-query
const mockSetQueryData = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
  }),
}));

// Mock socketManager
vi.mock('@/src/lib/socket/socketManager', () => {
  const listeners = new Map<string, Array<(data: unknown) => void>>();
  return {
    socketManager: {
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn((event: string, cb: (data: unknown) => void) => {
        if (!listeners.has(event)) {
          listeners.set(event, []);
        }
        listeners.get(event)!.push(cb);
      }),
      off: vi.fn((event: string) => {
        listeners.delete(event);
      }),
      emit: vi.fn(),
      simulateIncomingEvent: vi.fn((event: string, data: unknown) => {
        const handlers = listeners.get(event);
        if (handlers) {
          handlers.forEach((cb) => cb(data));
        }
      }),
    },
  };
});

// Mock apiClient
vi.mock('@/src/lib/api/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const mockUser: User = {
  id: 'user-123',
  wallet_id: 'wallet-123',
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
  email: 'john@example.com',
  role: Role.USER,
  status: UserStatus.ACTIVE,
  is_online: true,
  avatar: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockOrder: Order = {
  id: 1,
  client: mockUser,
  provider: {
    id: 'provider-123',
    user: {
      id: 'user-456',
      wallet_id: 'wallet-456',
      first_name: 'Jasur',
      last_name: 'Rahimov',
      username: 'jasur_master',
      email: 'jasur@halqil.uz',
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
      is_online: true,
      avatar: null,
      created_at: '',
      updated_at: '',
    },
    bio: 'Santexnik master',
    district: 'Chilonzor',
    skills: [],
    rating: 4.8,
    jobs_completed: 12,
    hourly_rate: 50000,
    is_verified: true,
    created_at: '',
  },
  service_type: 'PLUMBING',
  description: 'Suv quvuri oqmoqda',
  price: 150000,
  status: OrderStatus.PENDING,
  district: 'Chilonzor',
  address: 'Qatortol koʻchasi, 12-uy',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface SimulativeSocketManager {
  simulateIncomingEvent: (event: string, data: unknown) => void;
}

describe('useOrderSocket Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAppStore.setState({
      user: mockUser,
      role: Role.USER,
      activeOrders: [mockOrder],
      notifications: [],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should call socketManager.connect when mounted with a token', () => {
    localStorage.setItem('token', 'valid-token-xyz');
    
    renderHook(() => useOrderSocket(1));

    expect(socketManager.connect).toHaveBeenCalledWith('valid-token-xyz');
  });

  it('should call socketManager.disconnect when unmounted', () => {
    localStorage.setItem('token', 'valid-token-xyz');
    
    const { unmount } = renderHook(() => useOrderSocket(1));

    unmount();

    expect(socketManager.disconnect).toHaveBeenCalled();
  });

  it('should call socketManager.emit with message details when sendMessage is executed', () => {
    const { result } = renderHook(() => useOrderSocket(1));

    act(() => {
      result.current.sendMessage('Salom master!');
    });

    expect(socketManager.emit).toHaveBeenCalledWith(
      SOCKET_EVENTS.CHAT_MESSAGE,
      expect.objectContaining({
        content: 'Salom master!',
        order: 1,
        sender: mockUser,
      })
    );
  });

  it('should update Zustand activeOrders and queryClient cache on ORDER_UPDATED event', () => {
    renderHook(() => useOrderSocket(1));

    const updatedOrder: Order = {
      ...mockOrder,
      status: OrderStatus.ACTIVE,
    };

    act(() => {
      const manager = socketManager as unknown as SimulativeSocketManager;
      manager.simulateIncomingEvent(
        SOCKET_EVENTS.ORDER_UPDATED,
        updatedOrder
      );
    });

    const currentOrders = useAppStore.getState().activeOrders;
    expect(currentOrders[0].status).toBe(OrderStatus.ACTIVE);

    expect(mockSetQueryData).toHaveBeenCalledWith(['order', '1'], updatedOrder);
  });

  it('should update messages list on CHAT_MESSAGE event', () => {
    const { result } = renderHook(() => useOrderSocket(1));

    const incomingMessage: Message = {
      id: 202,
      order: 1,
      sender: mockOrder.provider.user,
      content: 'Yo‘ldaman, yetib boryapman.',
      type: MessageType.TEXT,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    act(() => {
      const manager = socketManager as unknown as SimulativeSocketManager;
      manager.simulateIncomingEvent(
        SOCKET_EVENTS.CHAT_MESSAGE,
        incomingMessage
      );
    });

    expect(result.current.messages).toContainEqual(incomingMessage);
  });
});
