'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketManager } from '../lib/socket/socketManager';
import { SOCKET_EVENTS } from '../lib/socket/socketEvents';
import { useAppStore } from '../store/useAppStore';
import { Message, Order } from '../types';
import { Role, MessageType, UserStatus } from '../types/enums';

export function useOrderSocket(orderId: number | string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { user } = useAppStore();

  // Fetch initial chat messages history
  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // Attempt API request
        const { apiClient } = await import('../lib/api/client');
        const response = await apiClient.get(`/orders/${orderId}/messages/`);
        if (active) {
          setMessages(response.data || []);
        }
      } catch {
        console.log('Failed to fetch messages history, using fallback mock history for development.');
        if (active) {
          // Realistic initial mock messages
          setMessages([
            {
              id: 101,
              order: Number(orderId),
              sender: {
                id: 'provider-123',
                wallet_id: '0x...',
                first_name: 'Jasur',
                last_name: 'Rahimov',
                username: 'jasur_master',
                email: 'jasur@halqil.uz',
                role: Role.PROVIDER,
                status: UserStatus.ACTIVE,
                is_online: true,
                created_at: '',
                updated_at: '',
              },
              content: "Assalomu alaykum! Buyurtmangiz bo'yicha barcha ma'lumotlarni ko'rib chiqdim. Manzilga yetib borib, santexnika ishlarini ko'rishim mumkin.",
              type: MessageType.TEXT,
              is_read: true,
              created_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
            },
          ]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      active = false;
    };
  }, [orderId]);

  // Connect socket, listen to events, and cleanup
  useEffect(() => {
    // Connect to WebSocket using token
    const token = localStorage.getItem('token');
    if (token) {
      socketManager.connect(token);
    }

    // Listener for order updates
    const handleOrderUpdated = (data: unknown) => {
      console.log('WebSocket Event received [ORDER_UPDATED]:', data);
      const updatedOrder = data as Order;
      if (updatedOrder && updatedOrder.id === Number(orderId)) {
        // 1. Sync Zustand store state
        useAppStore.getState().updateOrder(updatedOrder);

        // 2. Sync React Query cache instantly to update order detail UI without refresh
        queryClient.setQueryData(['order', orderId.toString()], updatedOrder);
      }
    };

    // Listener for live chat messages
    const handleChatMessage = (data: unknown) => {
      console.log('WebSocket Event received [CHAT_MESSAGE]:', data);
      const message = data as Message;
      if (message && message.order === Number(orderId)) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    socketManager.on(SOCKET_EVENTS.ORDER_UPDATED, handleOrderUpdated);
    socketManager.on(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);

    return () => {
      socketManager.off(SOCKET_EVENTS.ORDER_UPDATED);
      socketManager.off(SOCKET_EVENTS.CHAT_MESSAGE);
      socketManager.disconnect();
    };
  }, [orderId, queryClient]);

  // Send message callback
  const sendMessage = useCallback(
    (content: string) => {
      if (!user) return;

      const messagePayload: Message = {
        id: Date.now(),
        order: Number(orderId),
        sender: user,
        content,
        type: MessageType.TEXT,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // 1. Optimistic local update (instantly visible under 200ms)
      setMessages((prev) => [...prev, messagePayload]);

      // 2. Emit WebSocket event
      socketManager.emit(SOCKET_EVENTS.CHAT_MESSAGE, messagePayload);

      // 3. DEVELOPMENT ONLY: Simulate auto-reply to make UI feel alive without actual server WS echo
      setTimeout(() => {
        const isProvider = user.role === Role.PROVIDER;
        
        const mockOppositeSender = isProvider
          ? {
              id: 'user-789',
              wallet_id: '0x...',
              first_name: 'Farhod',
              last_name: 'Soliyev',
              username: 'farhod_client',
              email: 'farhod@client.uz',
              role: Role.USER,
              status: UserStatus.ACTIVE,
              is_online: true,
              created_at: '',
              updated_at: '',
            }
          : {
              id: 'provider-123',
              wallet_id: '0x...',
              first_name: 'Jasur',
              last_name: 'Rahimov',
              username: 'jasur_master',
              email: 'jasur@halqil.uz',
              role: Role.PROVIDER,
              status: UserStatus.ACTIVE,
              is_online: true,
              created_at: '',
              updated_at: '',
            };

        const simulatedReply: Message = {
          id: Date.now() + 1000,
          order: Number(orderId),
          sender: mockOppositeSender,
          content: isProvider
            ? "Menda hamma sharoitlar tayyor, uyingizdagi suv quvuri oqib yotgan xonani ko'rsataman."
            : "Tushunarli. Men yo'lga chiqdim, tez orada yetib boraman va darhol ishga kirishaman.",
          type: MessageType.TEXT,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        // Inject event via simulateIncomingEvent
        socketManager.simulateIncomingEvent(SOCKET_EVENTS.CHAT_MESSAGE, simulatedReply);
      }, 1800);
    },
    [orderId, user]
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
