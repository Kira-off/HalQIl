'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { DayOfWeek } from '@/src/types/enums';
import { ProviderSchedule } from '@/src/types';

const DAY_NAMES: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Dushanba',
  [DayOfWeek.TUESDAY]: 'Seshanba',
  [DayOfWeek.WEDNESDAY]: 'Chorshanba',
  [DayOfWeek.THURSDAY]: 'Payshanba',
  [DayOfWeek.FRIDAY]: 'Juma',
  [DayOfWeek.SATURDAY]: 'Shanba',
  [DayOfWeek.SUNDAY]: 'Yakshanba',
};

const DAYS = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

const scheduleItemSchema = z.object({
  day_of_week: z.nativeEnum(DayOfWeek),
  open_time: z.string().min(5, 'Ish boshlash vaqti kiritilmagan'),
  close_time: z.string().min(5, 'Ish yakunlash vaqti kiritilmagan'),
  is_active: z.boolean(),
});

const scheduleRequestSchema = z.object({
  schedule: z.array(scheduleItemSchema).refine(
    (items) => items.some((item) => item.is_active),
    {
      message: 'Kamida 1 ta kunni ish kuni (faol) sifatida belgilashingiz shart.',
      path: ['schedule'],
    }
  ),
});

type ScheduleFormInput = z.infer<typeof scheduleRequestSchema>;

interface GridCalendarProps {
  initialSchedule: ProviderSchedule[];
}

export default function GridCalendar({ initialSchedule }: GridCalendarProps) {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Map initial schedule or build default list of 7 days
  const defaultScheduleItems = DAYS.map((day) => {
    const existing = initialSchedule.find((s) => s.day_of_week === day);
    return {
      day_of_week: day,
      open_time: existing?.open_time || '09:00',
      close_time: existing?.close_time || '18:00',
      is_active: existing?.is_active ?? false,
    };
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ScheduleFormInput>({
    resolver: zodResolver(scheduleRequestSchema),
    defaultValues: {
      schedule: defaultScheduleItems,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'schedule',
  });

  const mutation = useMutation({
    mutationFn: async (data: ScheduleFormInput) => {
      // API call to bulk update
      const response = await apiClient.patch(ENDPOINTS.provider.schedule, {
        schedule: data.schedule,
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('Haftalik ish tartibi muvaffaqiyatli saqlandi!');
      queryClient.invalidateQueries({ queryKey: ['provider-schedule'] });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-4xl mx-auto space-y-6">
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <svg className="w-5.5 h-5.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Ish tartibi taqvimi
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Haftalik ish kunlari va vaqtlarini sozlang. Mijozlar sizga aynan shu vaqtlarda buyurtma bera olishadi.
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold leading-relaxed shadow-sm">
            {successMessage}
          </div>
        )}

        {mutation.isError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold leading-relaxed">
            Xatolik yuz berdi: {(mutation.error as Error)?.message || 'Taqvimni yangilash imkoni bo\'lmadi'}
          </div>
        )}

        {errors.schedule?.message && (
          <div className="p-3 bg-amber-50 border border-amber-250 text-amber-800 rounded-2xl text-xs font-bold">
            {errors.schedule.message}
          </div>
        )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field, index) => {
            const dayValue = field.day_of_week as DayOfWeek;
            return (
              <div
                key={field.id}
                className="bg-gray-50/50 border border-gray-150 rounded-2xl p-5 hover:border-gray-250 hover:bg-white transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-sm">{DAY_NAMES[dayValue]}</span>
                  
                  {/* Status Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`schedule.${index}.is_active` as const)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-2 text-xs font-semibold text-gray-400 peer-checked:text-emerald-700">
                      Ish kuni
                    </span>
                  </label>
                </div>

                {/* Time range editors */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Boshlanishi
                    </label>
                    <input
                      type="time"
                      {...register(`schedule.${index}.open_time` as const)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Tugashi
                    </label>
                    <input
                      type="time"
                      {...register(`schedule.${index}.close_time` as const)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Bar */}
        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saqlanmoqda...
              </>
            ) : (
              'Ish jadvalini saqlash'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
