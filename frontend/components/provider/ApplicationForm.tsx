'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { ServiceType } from '@/src/types/enums';

const DISTRICTS = [
  'Chilonzor',
  'Yunusobod',
  'Mirzo Ulug\'bek',
  'Yashnobod',
  'Mirobod',
  'Uchtepa',
  'Olmazor',
  'Shayxontohur',
  'Yakkasaroy',
  'Sergeli',
];

const CATEGORIES = [
  { id: 1, name: 'Santexnika' },
  { id: 2, name: 'Elektr xizmatlari' },
  { id: 3, name: 'Tozalash' },
  { id: 4, name: 'Maishiy texnika ta\'mirlash' },
  { id: 5, name: 'Yuk tashish' },
];

const applicationSchema = z.object({
  bio: z.string().min(20, 'Tarjimai hol kamida 20 ta belgidan iborat bo\'lishi kerak'),
  experience: z.number().min(1, 'Tajriba kamida 1 yil bo\'lishi shart').max(50, 'Maksimal tajriba 50 yil'),
  categoryId: z.number().min(1, 'Iltimos, asosiy kategoriyani tanlang'),
  districtIds: z.array(z.string()).min(1, 'Kamida bitta tuman tanlanishi kerak'),
  hourlyRate: z.string().min(1, 'Soatlik tarifni kiriting'),
  portfolioUrl: z.string().url('Noto\'g\'ri URL manzili kiritildi').optional().or(z.literal('')),
});

type ApplicationInput = z.infer<typeof applicationSchema>;

export default function ApplicationForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      bio: '',
      experience: 1,
      categoryId: 1,
      districtIds: [],
      hourlyRate: '',
      portfolioUrl: '',
    },
  });

  const selectedDistricts = watch('districtIds') || [];

  const handleDistrictToggle = (districtName: string) => {
    const current = [...selectedDistricts];
    const index = current.indexOf(districtName);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(districtName);
    }
    setValue('districtIds', current, { shouldValidate: true });
  };

  const mutation = useMutation({
    mutationFn: async (data: ApplicationInput) => {
      // Build the standard payload matching ApplyProviderRequest interface
      const payload = {
        about_me: data.bio,
        why_join: `Tajribam: ${data.experience} yil. Soatlik tarif: ${data.hourlyRate} UZS. Portfolio: ${data.portfolioUrl || 'Yo\'q'}`,
        districts: data.districtIds,
        skills: [
          {
            skill_id: data.categoryId,
            service_type: ServiceType.BOTH,
            experience_years: data.experience,
            price_from: data.hourlyRate,
            price_to: (parseInt(data.hourlyRate, 10) * 1.5).toString(),
            description: data.bio.slice(0, 100),
          },
        ],
      };
      const response = await apiClient.post(ENDPOINTS.provider.apply, payload);
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
  });

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-md text-center max-w-2xl mx-auto space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ariza muvaffaqiyatli yuborildi!</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Sizning mutaxassis sifatida ro&apos;yxatdan o&apos;tish arizangiz qabul qilindi. 
          Tez orada moderatorlarimiz arizani ko&apos;rib chiqib, natijasini ma&apos;lum qilishadi. 
          Ishingizda muvaffaqiyatlar tilaymiz!
        </p>
        <div className="pt-4 border-t border-gray-100 flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Ariza holati: Kutilmoqda (PENDING)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
      <div className="border-b border-gray-100 pb-6 mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Mutaxassislik arizasi</h2>
        <p className="text-gray-500 text-xs mt-1">Platformada mutaxassis sifatida ishlashni boshlash uchun quyidagi shaklni to&apos;ldiring.</p>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        {mutation.isError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold leading-relaxed">
            Arizani yuborishda xatolik: {(mutation.error as Error)?.message || 'Tizim xatosi yuz berdi'}
          </div>
        )}

        {/* Bio */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Tarjimai hol (Bio)</label>
          <textarea
            rows={4}
            placeholder="O'zingiz va bajara oladigan ishlaringiz haqida batafsilroq ma'lumot bering..."
            {...register('bio')}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none"
          />
          {errors.bio && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.bio.message}</p>
          )}
        </div>

        {/* Experience & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Ish tajribasi (Yil)</label>
            <input
              type="number"
              min={1}
              max={50}
              placeholder="Masalan: 5"
              {...register('experience', { valueAsNumber: true })}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {errors.experience && (
              <p className="text-red-500 text-xs mt-1 font-semibold">{errors.experience.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Asosiy Kategoriya</label>
            <select
              {...register('categoryId', { valueAsNumber: true })}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1 font-semibold">{errors.categoryId.message}</p>
            )}
          </div>
        </div>

        {/* Price & Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Boshlang&apos;ich narx (UZS)</label>
            <input
              type="number"
              placeholder="Masalan: 50000"
              {...register('hourlyRate')}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {errors.hourlyRate && (
              <p className="text-red-500 text-xs mt-1 font-semibold">{errors.hourlyRate.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Portfolio / Vebsayt (Ixtiyoriy)</label>
            <input
              type="text"
              placeholder="https://mywork.com"
              {...register('portfolioUrl')}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {errors.portfolioUrl && (
              <p className="text-red-500 text-xs mt-1 font-semibold">{errors.portfolioUrl.message}</p>
            )}
          </div>
        </div>

        {/* District Multi-select checkboxes */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Xizmat ko&apos;rsatish tumanlari</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50/50 p-4 border border-gray-100 rounded-2xl">
            {DISTRICTS.map((dist) => {
              const isChecked = selectedDistricts.includes(dist);
              return (
                <button
                  key={dist}
                  type="button"
                  onClick={() => handleDistrictToggle(dist)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                    isChecked
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                    isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'
                  }`}>
                    {isChecked && (
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {dist}
                </button>
              );
            })}
          </div>
          {errors.districtIds && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.districtIds.message}</p>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
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
                Yuborilmoqda...
              </>
            ) : (
              'Ariza topshirish'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
