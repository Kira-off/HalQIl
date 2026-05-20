'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { ServiceType } from '@/src/types/enums';
import { ProviderSkill } from '@/src/types';

const CATEGORIES = [
  { id: 1, name: 'Santexnika' },
  { id: 2, name: 'Elektr xizmatlari' },
  { id: 3, name: 'Tozalash' },
  { id: 4, name: 'Maishiy texnika ta\'mirlash' },
  { id: 5, name: 'Yuk tashish' },
];

const newServiceSchema = z.object({
  skill_id: z.number().min(1, 'Iltimos, xizmat turini tanlang'),
  service_type: z.nativeEnum(ServiceType),
  experience_years: z.number().min(1, 'Kamida 1 yil tajriba bo\'lishi shart'),
  price_from: z.string().min(1, 'Boshlang\'ich narxni kiriting'),
  price_to: z.string().min(1, 'Maksimal narxni kiriting'),
  description: z.string().min(5, 'Xizmat tavsifi kamida 5 ta belgi bo\'lishi shart'),
});

type NewServiceInput = z.infer<typeof newServiceSchema>;

export default function ServiceManager() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch provider skills
  const { data: skills = [], isLoading } = useQuery<ProviderSkill[]>({
    queryKey: ['provider-skills'],
    queryFn: async () => {
      const response = await apiClient.get(ENDPOINTS.provider.services);
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewServiceInput>({
    resolver: zodResolver(newServiceSchema),
    defaultValues: {
      skill_id: 1,
      service_type: ServiceType.BOTH,
      experience_years: 1,
      price_from: '',
      price_to: '',
      description: '',
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: NewServiceInput) => {
      const response = await apiClient.post(ENDPOINTS.provider.services, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-skills'] });
      reset();
      setShowAddForm(false);
      setErrorMessage(null);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Xizmatni qo\'shishda xatolik yuz berdi');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Typically DELETE /provider/skills/:id/
      const response = await apiClient.delete(`${ENDPOINTS.provider.services}${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-skills'] });
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Xizmatni o\'chirishda xatolik yuz berdi');
    },
  });

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <svg className="w-5.5 h-5.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Mening xizmatlarim
          </h2>
          <p className="text-gray-500 text-xs mt-1">Taklif qilayotgan barcha professional xizmatlaringizni shu yerdan boshqaring.</p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Yangi xizmat
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* Add New Service Form overlay/card */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit((data) => addMutation.mutate(data))}
          className="bg-gray-50/50 border border-gray-150 rounded-2xl p-6 space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="font-bold text-gray-800 text-sm">Yangi xizmat qo&apos;shish</span>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                reset();
              }}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Skill / Category template */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Xizmat turi
              </label>
              <select
                {...register('skill_id', { valueAsNumber: true })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Xizmat turi (Uslub)
              </label>
              <select
                {...register('service_type')}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value={ServiceType.BOTH}>Hammasi (Manzil + Masofaviy)</option>
                <option value={ServiceType.ONSITE}>Faqat Manzilda</option>
                <option value={ServiceType.REMOTE}>Faqat Masofaviy</option>
              </select>
            </div>

            {/* Experience Years */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Tajriba (Yil)
              </label>
              <input
                type="number"
                min={1}
                placeholder="5"
                {...register('experience_years', { valueAsNumber: true })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {errors.experience_years && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.experience_years.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price From */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Minimal narx (UZS)
              </label>
              <input
                type="number"
                placeholder="50000"
                {...register('price_from')}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {errors.price_from && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.price_from.message}</p>
              )}
            </div>

            {/* Price To */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Maksimal narx (UZS)
              </label>
              <input
                type="number"
                placeholder="150000"
                {...register('price_to')}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {errors.price_to && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.price_to.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Qisqacha tavsif
            </label>
            <input
              type="text"
              placeholder="Ushbu xizmat turi doirasida nimalarni bajara olasiz..."
              {...register('description')}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {errors.description && (
              <p className="text-red-500 text-[10px] mt-0.5">{errors.description.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-2.5 justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                reset();
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs px-4 py-2 rounded-xl transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-1"
            >
              {addMutation.isPending ? 'Qo\'shilmoqda...' : 'Xizmatni qo\'shish'}
            </button>
          </div>
        </form>
      )}

      {/* Services List Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-gray-50 border border-gray-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-gray-150 border-dashed p-10 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold text-gray-800 text-sm">Sizda hali xizmatlar qo&apos;shilmagan</span>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Mijozlar buyurtma bera olishlari uchun kamida bitta xizmat turi va uning narxlarini qo&apos;shing.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-150 border border-gray-150 rounded-2xl overflow-hidden bg-white">
          {skills.map((s) => (
            <div
              key={s.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/40 transition duration-150"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900 text-sm">{s.skill.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {s.service_type === ServiceType.ONSITE
                      ? 'Manzilda'
                      : s.service_type === ServiceType.REMOTE
                      ? 'Masofaviy'
                      : 'Hammasi'}
                  </span>
                </div>
                {s.description && <p className="text-xs text-gray-500 max-w-lg">{s.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tajriba: {s.experience_years} yil
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-between sm:justify-end shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">
                    Tarif diapazoni
                  </span>
                  <span className="font-extrabold text-indigo-600 text-sm">
                    {parseFloat(s.price_from).toLocaleString()} – {parseFloat(s.price_to).toLocaleString()} UZS
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Rostdan ham ushbu xizmatni o\'chirmoqchisiz?')) {
                      deleteMutation.mutate(s.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition duration-150"
                  title="O'chirish"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
