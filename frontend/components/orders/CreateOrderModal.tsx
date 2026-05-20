'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { Provider } from '@/src/types';

const createOrderSchema = z.object({
  skillId: z.string().optional(),
  scheduledAt: z.string().min(1, 'Iltimos, bajarilish vaqtini tanlang'),
  address: z.string().min(5, 'Iltimos, to\'liq manzilni kiriting (kamida 5 ta belgi)'),
  comment: z.string().min(10, 'Iltimos, buyurtma tavsifini yozing (kamida 10 ta belgi)'),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
}

export default function CreateOrderModal({ isOpen, onClose, provider }: CreateOrderModalProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      skillId: provider.skills && provider.skills.length > 0 ? provider.skills[0].skill.id.toString() : '',
      scheduledAt: '',
      address: '',
      comment: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const payload = {
        provider_id: provider.id,
        skill_id: data.skillId ? parseInt(data.skillId, 10) : null,
        description: data.comment,
        address: data.address,
        preferred_date: data.scheduledAt,
      };
      const response = await apiClient.post(ENDPOINTS.orders.create, payload);
      return response.data;
    },
    onSuccess: (data) => {
      reset();
      onClose();
      router.push(`/orders/${data.id}`);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg mx-4 z-10 overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Buyurtma berish</h3>
            <p className="text-xs text-indigo-700 font-medium">Mutaxassis: {provider.user.first_name} {provider.user.last_name || ''}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
          {mutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              Xatolik yuz berdi: {(mutation.error as Error)?.message || 'Tizim xatosi'}
            </div>
          )}

          {/* Skill Selector */}
          {provider.skills && provider.skills.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Xizmat turi</label>
              <select
                {...register('skillId')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                {provider.skills.map((s) => (
                  <option key={s.id} value={s.skill.id.toString()}>
                    {s.skill.name} ({parseFloat(s.price_from).toLocaleString()} UZS dan)
                  </option>
                ))}
              </select>
              {errors.skillId && (
                <p className="text-red-500 text-xs mt-1">{errors.skillId.message}</p>
              )}
            </div>
          )}

          {/* Scheduled At */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Bajarilish vaqti</label>
            <input
              type="datetime-local"
              {...register('scheduledAt')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {errors.scheduledAt && (
              <p className="text-red-500 text-xs mt-1">{errors.scheduledAt.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Manzil</label>
            <input
              type="text"
              placeholder="Masalan: Chilonzor 4-daha, 12-uy, 45-xonadon"
              {...register('address')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Comment / Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Buyurtma tavsifi</label>
            <textarea
              rows={3}
              placeholder="Muammo haqida batafsilroq ma'lumot bering..."
              {...register('comment')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none"
            />
            {errors.comment && (
              <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Yaratilmoqda...
                </>
              ) : (
                'Buyurtma berish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
