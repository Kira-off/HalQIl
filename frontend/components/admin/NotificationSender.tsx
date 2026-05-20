'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { NotificationType } from '@/src/types/enums';
import { useState } from 'react';

const notificationSchema = z.object({
  title: z.string().min(3, 'Sarlavha kamida 3 ta belgidan iborat bo\'lishi kerak'),
  message: z.string().min(10, 'Xabar matni kamida 10 ta belgidan iborat bo\'lishi kerak'),
  type: z.nativeEnum(NotificationType),
  target: z.enum(['ALL', 'USERS', 'PROVIDERS']),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationSender() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      type: NotificationType.ANNOUNCEMENT,
      target: 'ALL',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: NotificationFormValues) => {
      const payload = {
        title: values.title,
        message: values.message,
        type: values.type,
        is_global: true,
        target: values.target,
      };
      const response = await apiClient.post(ENDPOINTS.admin.notify, payload);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMsg('Bildirishnoma muvaffaqiyatli yuborildi!');
      setErrorMsg(null);
      reset();
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: () => {
      setErrorMsg('Bildirishnomani yuborishda xatolik yuz berdi. Qayta urinib ko\'ring.');
      setSuccessMsg(null);
    },
  });

  const onSubmit = (data: NotificationFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 to-rose-500" />
      <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Tizimga broadcast xabar yuborish
      </h2>

      {successMsg && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-2xl animate-fade-in flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl animate-fade-in flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Sarlavha
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="Xabar sarlavhasi..."
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3.5 text-sm font-medium transition outline-none"
            />
            {errors.title && (
              <p className="text-xs text-rose-600 font-bold mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Tur
              </label>
              <select
                {...register('type')}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3.5 text-sm font-medium transition outline-none"
              >
                <option value={NotificationType.ANNOUNCEMENT}>Announcement</option>
                <option value={NotificationType.NEWS}>News</option>
                <option value={NotificationType.WARNING}>Warning</option>
                <option value={NotificationType.SYSTEM}>System</option>
              </select>
              {errors.type && (
                <p className="text-xs text-rose-600 font-bold mt-1">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Target Auditoriya
              </label>
              <select
                {...register('target')}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3.5 text-sm font-medium transition outline-none"
              >
                <option value="ALL">Barcha foydalanuvchilar</option>
                <option value="USERS">Faqat Mijozlar (Users)</option>
                <option value="PROVIDERS">Faqat Provayderlar</option>
              </select>
              {errors.target && (
                <p className="text-xs text-rose-600 font-bold mt-1">{errors.target.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
            Xabar mazmuni
          </label>
          <textarea
            {...register('message')}
            rows={4}
            placeholder="Broadcast xabar matnini kiriting..."
            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3.5 text-sm font-medium transition outline-none resize-none"
          />
          {errors.message && (
            <p className="text-xs text-rose-600 font-bold mt-1">{errors.message.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-4 rounded-2xl shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150 flex items-center gap-2 group cursor-pointer"
          >
            {mutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Yuborilmoqda...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Xabarni yuborish
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
