'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { Order } from '@/src/types';
import { useState } from 'react';

const disputeSchema = z.object({
  resolution_comment: z.string().min(5, 'Izoh kamida 5 ta belgidan iborat bo\'lishi kerak'),
});

type DisputeFormValues = z.infer<typeof disputeSchema>;

interface DisputeResolverProps {
  order: Order;
}

export default function DisputeResolver({ order }: DisputeResolverProps) {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      resolution_comment: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: DisputeFormValues & { refund: boolean }) => {
      const payload = {
        resolution_comment: values.resolution_comment,
        refund_to_user: values.refund,
        resolution: values.refund ? 'USER_FAVOR' : 'PROVIDER_FAVOR',
        note: values.resolution_comment,
      };
      const url = `${ENDPOINTS.admin.disputes}${order.id}/`;
      const response = await apiClient.patch(url, payload);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMsg('Nizo muvaffaqiyatli hal qilindi!');
      setErrorMsg(null);
      reset();
      // Invalidate disputes query to refetch updated state
      queryClient.invalidateQueries({ queryKey: ['adminDisputes'] });
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: () => {
      setErrorMsg('Nizoni hal qilishda xatolik yuz berdi. Qayta urinib ko\'ring.');
      setSuccessMsg(null);
    },
  });

  const handleResolve = (data: DisputeFormValues, refund: boolean) => {
    mutation.mutate({ ...data, refund });
  };

  const clientName = `${order.user.first_name} ${order.user.last_name || ''}`.trim();
  const providerUser = order.provider?.user;
  const providerName = providerUser ? `${providerUser.first_name} ${providerUser.last_name || ''}`.trim() : 'Noma\'lum Provayder';

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm relative overflow-hidden transition hover:shadow-md">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
      
      {/* Dispute Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-55 text-orange-700 border border-orange-100 mb-1.5">
            Buyurtma #{order.id}
          </span>
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            Muammo: {order.description.slice(0, 80)}{order.description.length > 80 ? '...' : ''}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400 font-semibold">Tahrirlangan vaqt</p>
          <p className="text-xs text-gray-900 font-extrabold">{new Date(order.updated_at).toLocaleString()}</p>
        </div>
      </div>

      {/* Disputants Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 bg-gray-50 rounded-2xl p-4">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Buyurtmachi (Mijoz)</p>
          <p className="text-sm font-bold text-gray-900">{clientName}</p>
          <p className="text-xs text-gray-500 font-medium">@{order.user.username} • {order.user.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Mutaxassis (Provayder)</p>
          <p className="text-sm font-bold text-gray-900">{providerName}</p>
          {providerUser && (
            <p className="text-xs text-gray-500 font-medium">@{providerUser.username} • {providerUser.email}</p>
          )}
        </div>
      </div>

      {/* Full Description */}
      <div className="mb-5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">Nizo va buyurtma tafsiloti</h4>
        <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-55 rounded-2xl p-3 border border-gray-100 max-h-32 overflow-y-auto">
          {order.description}
        </p>
        {order.address && (
          <p className="text-xs text-gray-400 font-semibold mt-2">
            Manzil: <span className="text-gray-700 font-bold">{order.address}</span>
          </p>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Resolution Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
            Hakam qarorining asoslanishi (Izoh)
          </label>
          <textarea
            {...register('resolution_comment')}
            rows={3}
            placeholder="Hal qilish sababi va qaror tafsilotini kiriting..."
            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3 text-sm font-medium transition outline-none resize-none"
          />
          {errors.resolution_comment && (
            <p className="text-xs text-rose-600 font-bold mt-1">{errors.resolution_comment.message}</p>
          )}
        </div>

        {/* Resolution Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-xs text-gray-400 font-medium">
            * Qaror chiqarilgandan so&apos;ng nizo holati yakunlanadi
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={handleSubmit((data) => handleResolve(data, true))}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3.5 rounded-2xl shadow-sm transition disabled:bg-gray-300 cursor-pointer shrink-0"
            >
              Mijoz foydasiga
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={handleSubmit((data) => handleResolve(data, false))}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-3.5 rounded-2xl shadow-sm transition disabled:bg-gray-300 cursor-pointer shrink-0"
            >
              Provayder foydasiga
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
