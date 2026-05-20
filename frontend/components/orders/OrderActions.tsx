'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { Order } from '@/src/types';
import { OrderStatus, Role } from '@/src/types/enums';
import { useAppStore } from '@/src/store/useAppStore';
import { socketManager } from '@/src/lib/socket/socketManager';
import { SOCKET_EVENTS } from '@/src/lib/socket/socketEvents';

interface OrderActionsProps {
  order: Order;
}

export default function OrderActions({ order }: OrderActionsProps) {
  const { user } = useAppStore();
  const queryClient = useQueryClient();

  const isProvider = user?.role === Role.PROVIDER;
  const isUser = user?.role === Role.USER;

  // Mutation to update order status
  const mutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const response = await apiClient.patch(ENDPOINTS.orders.updateStatus(order.id), {
        status: newStatus,
      });
      return response.data;
    },
    // Optimistic Update
    onMutate: async (newStatus: OrderStatus) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['order', order.id.toString()] });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData<Order>(['order', order.id.toString()]);

      // Optimistically update to the new value
      if (previousOrder) {
        const updatedOrder = { ...previousOrder, status: newStatus };
        queryClient.setQueryData(['order', order.id.toString()], updatedOrder);
        useAppStore.getState().updateOrder(updatedOrder);
      }

      // Return a context object with the snapshotted value
      return { previousOrder };
    },
    // If the mutation fails, use the context returned from onMutate to rollback
    onError: (err, newStatus, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', order.id.toString()], context.previousOrder);
        useAppStore.getState().updateOrder(context.previousOrder);
      }
    },
    // Always refetch or update state on success
    onSuccess: (data) => {
      queryClient.setQueryData(['order', order.id.toString()], data);
      useAppStore.getState().updateOrder(data);
      
      // Simulate real-time WS notification
      socketManager.simulateIncomingEvent(SOCKET_EVENTS.ORDER_UPDATED, data);
    },
  });

  const handleStatusChange = (status: OrderStatus) => {
    mutation.mutate(status);
  };

  const isPending = mutation.isPending;

  // Let's render actions based on current status and user role
  const renderActions = () => {
    switch (order.status) {
      case OrderStatus.PENDING:
        if (isProvider) {
          return (
            <div className="flex gap-4 w-full">
              <button
                onClick={() => handleStatusChange(OrderStatus.ACCEPTED)}
                disabled={isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {isPending ? 'Yuklanmoqda...' : 'Qabul qilish'}
              </button>
              <button
                onClick={() => handleStatusChange(OrderStatus.REJECTED)}
                disabled={isPending}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 px-6 rounded-2xl border border-red-200 transition duration-200 flex items-center justify-center gap-2"
              >
                Rad etish
              </button>
            </div>
          );
        }
        if (isUser) {
          return (
            <button
              onClick={() => handleStatusChange(OrderStatus.CANCELLED)}
              disabled={isPending}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 px-6 rounded-2xl border border-gray-200 transition duration-200 flex items-center justify-center gap-2"
            >
              Bekor qilish
            </button>
          );
        }
        break;

      case OrderStatus.ACCEPTED:
        if (isProvider) {
          return (
            <button
              onClick={() => handleStatusChange(OrderStatus.IN_PROGRESS)}
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              Ishni boshlash (Yo&apos;lga chiqdim)
            </button>
          );
        }
        if (isUser) {
          return (
            <button
              onClick={() => handleStatusChange(OrderStatus.CANCELLED)}
              disabled={isPending}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 px-6 rounded-2xl border border-gray-200 transition duration-200 flex items-center justify-center gap-2"
            >
              Bekor qilish
            </button>
          );
        }
        break;

      case OrderStatus.IN_PROGRESS:
        if (isProvider) {
          return (
            <button
              onClick={() => handleStatusChange(OrderStatus.AWAITING_CONFIRMATION)}
              disabled={isPending}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              Yakunlashni so&apos;rash (Tasdiq jo&apos;natish)
            </button>
          );
        }
        break;

      case OrderStatus.AWAITING_CONFIRMATION:
        if (isUser) {
          return (
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => handleStatusChange(OrderStatus.COMPLETED)}
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 animate-pulse"
              >
                Ish yakunini tasdiqlash
              </button>
              <button
                onClick={() => handleStatusChange(OrderStatus.DISPUTED)}
                disabled={isPending}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-3.5 px-6 rounded-2xl border border-amber-200 transition duration-200 flex items-center justify-center gap-2"
              >
                E&apos;tiroz bildirish (Disput ochish)
              </button>
            </div>
          );
        }
        if (isProvider) {
          return (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-indigo-800 text-xs font-semibold">
              <p className="leading-relaxed">
                Mijozga ish yakunini tasdiqlash so&apos;rovi jo&apos;natildi. Mijoz tasdiqlashini yoki disput ochishini kuting.
              </p>
            </div>
          );
        }
        break;

      default:
        return null;
    }
    return null;
  };

  const actionButtons = renderActions();

  if (!actionButtons) return null;

  return (
    <div className="space-y-4">
      {mutation.isError && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-red-700 text-xs font-medium space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tizim xatoligi</span>
          </div>
          <p className="font-normal text-red-600">
            Amalni bajarib bo&apos;lmadi. Iltimos, qaytadan urinib ko&apos;ring. ({(mutation.error as Error)?.message})
          </p>
        </div>
      )}
      {actionButtons}
    </div>
  );
}
