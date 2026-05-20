'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { Provider } from '@/src/types';
import { Role, AvailabilityStatus, DayOfWeek, ServiceType } from '@/src/types/enums';
import { useAppStore } from '@/src/store/useAppStore';
import { MOCK_PROVIDERS } from '@/src/lib/mockData';
import CreateOrderModal from '@/components/orders/CreateOrderModal';
import OptimizedImage from '@/components/common/OptimizedImage';

// Days translation helper
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

// Availability translation and styles helper
const getAvailabilityBadge = (status: AvailabilityStatus) => {
  switch (status) {
    case AvailabilityStatus.AVAILABLE:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Bo&apos;sh (Hozir xizmatda)
        </span>
      );
    case AvailabilityStatus.BUSY:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Band (Boshqa buyurtmada)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
          Noaniq
        </span>
      );
  }
};

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { user } = useAppStore();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // TanStack Query with local mock fallback
  const { data: provider, isLoading, error } = useQuery<Provider | null>({
    queryKey: ['provider', id],
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.provider.services);
        const list: Provider[] = response.data;
        const found = list.find((p) => p.id.toString() === id);
        if (found) return found;
        throw new Error('Provider not found in services list');
      } catch (err) {
        console.warn('Backend API connection failed, falling back to mock provider details:', err);
        // Simulate minor network delay
        await new Promise((resolve) => setTimeout(resolve, 400));
        const foundMock = MOCK_PROVIDERS.find((p) => p.id.toString() === id);
        if (foundMock) return foundMock;
        return null;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-8 animate-pulse">
        {/* Banner skeleton */}
        <div className="h-64 bg-gray-200 rounded-3xl" />
        
        {/* Two column grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 space-y-4 border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
            <div className="bg-white rounded-3xl p-8 space-y-4 border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-12 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 space-y-4 border border-gray-100 h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Mutaxassis topilmadi</h3>
        <p className="text-gray-500 mt-2">Siz so&apos;ragan mutaxassis mavjud emas yoki tizimdan o&apos;chirilgan bo&apos;lishi mumkin.</p>
        <Link 
          href="/catalog"
          className="inline-flex items-center gap-2 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-2xl transition shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  // Check role limits
  const canCreateOrder = user?.role === Role.USER;

  // Render first letter of the name if no avatar exists
  const initials = `${provider.user.first_name[0] || ''}${provider.user.last_name ? provider.user.last_name[0] : ''}`.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/catalog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Katalogga qaytish
        </Link>
      </div>

      {/* Hero Profile Banner Card */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner gradient background */}
        <div className="h-44 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 relative">
          <div className="absolute inset-0 bg-grid-white/10 opacity-30" />
          <div className="absolute -bottom-16 left-8 sm:left-12">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 shadow-md flex items-center justify-center">
              {provider.user.avatar ? (
                <OptimizedImage 
                  src={provider.user.avatar} 
                  alt={`${provider.user.first_name} avatar`}
                  width={128}
                  height={128}
                  className="w-full h-full rounded-2xl object-cover" 
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header content and metrics */}
        <div className="pt-20 pb-8 px-8 sm:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {provider.user.first_name} {provider.user.last_name || ''}
                </h1>
                {provider.user.is_online ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Onlayn
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    Oflayn
                  </span>
                )}
                {getAvailabilityBadge(provider.availability_status)}
              </div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                @{provider.user.username}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 divide-x divide-gray-100 bg-gray-50/50 border border-gray-100 rounded-2xl p-4 self-start md:self-auto">
              <div className="text-center pr-6">
                <span className="text-2xl font-black text-gray-900">{provider.successful_orders}</span>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">Muvaffaqiyatli</p>
              </div>
              <div className="text-center px-6">
                <div className="flex items-center gap-1 text-2xl font-black text-amber-500 justify-center">
                  <span>{provider.reliability}%</span>
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">Ishonchlilik</p>
              </div>
              <div className="text-center pl-6">
                <span className="text-2xl font-black text-indigo-600">
                  {provider.skills && provider.skills.length > 0
                    ? `${parseInt(provider.skills[0].experience_years.toString(), 10)} y`
                    : '—'}
                </span>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">Tajriba</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mutaxassis haqida
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{provider.bio}</p>
          </div>

          {/* Skills / Services List */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Xizmatlar va narxlar ro&apos;yxati
            </h2>
            
            <div className="divide-y divide-gray-100">
              {provider.skills.map((s) => (
                <div key={s.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-gray-900">{s.skill.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                        {s.service_type === ServiceType.ONSITE ? 'Manzilda' : s.service_type === ServiceType.REMOTE ? 'Masofaviy' : 'Har ikkisi'}
                      </span>
                    </div>
                    {s.description && (
                      <p className="text-xs text-gray-500 max-w-lg">{s.description}</p>
                    )}
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tajriba: {s.experience_years} yil
                    </p>
                  </div>
                  
                  <div className="text-right self-start sm:self-auto">
                    <span className="text-sm font-medium text-gray-400">Taxminiy narx:</span>
                    <p className="text-lg font-black text-indigo-600">
                      {parseFloat(s.price_from).toLocaleString()} – {parseFloat(s.price_to).toLocaleString()} UZS
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Covered Districts */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Xizmat ko&apos;rsatish tumanlari (Toshkent sh.)
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {provider.districts.map((d) => (
                <span 
                  key={d.id}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100 transition duration-150 cursor-default"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {d.district_name} tumani
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side order actions & schedule */}
        <div className="space-y-8">
          {/* Action Card / Order capability gating */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
            <h3 className="text-base font-bold text-gray-900 pt-2">Xizmat buyurtma qilish</h3>
            
            {canCreateOrder ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Mutaxassis bilan to&apos;g&apos;ridan-to&apos;g&apos;ri bog&apos;lanib, buyurtma bering. Tizim orqali ishonchli to&apos;lov kafolatlanadi.
                </p>
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md transition duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group animate-pulse"
                >
                  Buyurtma berish
                  <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            ) : user ? (
              <div className="bg-amber-50 border border-amber-150 rounded-2xl p-4 text-amber-800 text-xs font-semibold space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Buyurtma cheklovi</span>
                </div>
                <p className="font-normal text-amber-700 leading-normal">
                  Siz hozirda <span className="font-bold">{user.role === Role.PROVIDER ? 'Mutaxassis' : 'Administrator'}</span> profili orqali tizimdasiz. Buyurtma berish faqat mijoz (USER) hisoblari uchun ruxsat etilgan.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-indigo-800 text-xs font-semibold space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Tizimga kirilmagan</span>
                  </div>
                  <p className="font-normal text-indigo-700 leading-normal">
                    Mutaxassis xizmatidan foydalanish va buyurtma yaratish uchun tizimga mijoz sifatida kirishingiz kerak.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md transition duration-150"
                >
                  Kirish / Ro&apos;yxatdan o&apos;tish
                </button>
              </div>
            )}
          </div>

          {/* Schedule Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Haftalik ish tartibi
            </h3>
            
            <div className="space-y-2">
              {DAYS.map((day) => {
                const scheduleDay = provider.schedule.find((s) => s.day_of_week === day);
                const isActive = scheduleDay?.is_active ?? false;
                
                return (
                  <div 
                    key={day} 
                    className={`flex items-center justify-between py-2 px-3 rounded-xl border text-xs transition duration-150 ${
                      isActive 
                        ? 'bg-emerald-50/20 border-emerald-100 text-gray-800' 
                        : 'bg-gray-50/50 border-gray-100 text-gray-400'
                    }`}
                  >
                    <span className="font-semibold">{DAY_NAMES[day]}</span>
                    {isActive && scheduleDay ? (
                      <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5">
                        {scheduleDay.open_time} – {scheduleDay.close_time}
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-400 bg-gray-100 rounded px-2 py-0.5">
                        Dam olish kuni
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order Creation Modal */}
      {isOrderModalOpen && (
        <CreateOrderModal 
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          provider={provider}
        />
      )}
    </div>
  );
}
