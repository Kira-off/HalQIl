'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/src/store/useAppStore';
import { Role } from '@/src/types/enums';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { ProviderSchedule } from '@/src/types';
import GridCalendar from '@/components/provider/GridCalendar';

export default function ProviderSchedulePage() {
  const { user, role } = useAppStore();
  const router = useRouter();

  // Role Guard
  useEffect(() => {
    if (role !== Role.PROVIDER) {
      router.push('/403');
    }
  }, [role, router]);

  // Fetch schedule with TanStack Query
  const { data: schedule = [], isLoading } = useQuery<ProviderSchedule[]>({
    queryKey: ['provider-schedule'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.provider.schedule);
        return response.data.schedule || response.data || [];
      } catch (err) {
        console.warn('Backend API connection failed, starting with default empty schedule:', err);
        return [];
      }
    },
    enabled: role === Role.PROVIDER,
  });

  if (role !== Role.PROVIDER || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        <p className="text-gray-500 text-sm">Sahifa yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/provider"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Mutaxassis paneliga qaytish
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="bg-gray-100 rounded-2xl h-36 border border-gray-150" />
            ))}
          </div>
        </div>
      ) : (
        <GridCalendar initialSchedule={schedule} />
      )}
    </div>
  );
}
