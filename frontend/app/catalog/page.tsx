'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { Provider } from '@/src/types';
import ProviderCard from '@/components/catalog/ProviderCard';
import FilterPanel from '@/components/catalog/FilterPanel';

import { MOCK_PROVIDERS } from '@/src/lib/mockData';

function CatalogPageContent() {
  const searchParams = useSearchParams();

  // Read current filters from URL
  const category = searchParams.get('category') || '';
  const district = searchParams.get('district') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // TanStack Query with local mock fallback
  const { data: providers, isLoading, error } = useQuery<Provider[]>({
    queryKey: ['providers', category, district, minPrice, maxPrice],
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.provider.services, {
          params: { category, district, min_price: minPrice, max_price: maxPrice },
        });
        return response.data;
      } catch (err) {
        console.warn('Backend API connection failed, executing client-side filtering on mock dataset:', err);
        // Simulate minor network delay
        await new Promise((resolve) => setTimeout(resolve, 400));
        
        let filtered = [...MOCK_PROVIDERS];
        if (category) {
          filtered = filtered.filter((p) =>
            p.skills.some((s) => s.skill.name.toLowerCase() === category.toLowerCase())
          );
        }
        if (district) {
          filtered = filtered.filter((p) =>
            p.districts.some((d) => d.district_name.toLowerCase() === district.toLowerCase())
          );
        }
        if (minPrice) {
          filtered = filtered.filter((p) =>
            p.skills.some((s) => parseFloat(s.price_from) >= parseFloat(minPrice))
          );
        }
        if (maxPrice) {
          filtered = filtered.filter((p) =>
            p.skills.some((s) => parseFloat(s.price_to) <= parseFloat(maxPrice))
          );
        }
        return filtered;
      }
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Xizmatlar katalogi</h1>
          <p className="text-gray-500 mt-1">Toshkent shahridagi eng yaxshi mutaxassislar va ustalar</p>
        </div>
        <div className="text-sm bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2 text-indigo-700 font-semibold inline-flex items-center gap-1.5 self-start md:self-auto shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          {providers ? providers.length : 0} ta mutaxassis topildi
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filters column */}
        <div className="lg:col-span-1">
          <FilterPanel />
        </div>

        {/* Right list column */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2 py-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error && (!providers || providers.length === 0) ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Yuklashda xatolik yuz berdi</h3>
              <p className="text-gray-500 mt-1">{"Mutaxassislar ro'yxatini olishning iloji bo'lmadi. Internet aloqasini tekshiring."}</p>
            </div>
          ) : providers && providers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Mutaxassislar topilmadi</h3>
              <p className="text-gray-500 mt-1">{"Tanlangan filtrlar bo'yicha birorta ham mutaxassis topilmadi. Filtr parametrlarini o'zgartirib ko'ring."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers?.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto space-y-6 text-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
        <p className="text-gray-500 mt-2">Katalog yuklanmoqda...</p>
      </div>
    }>
      <CatalogPageContent />
    </Suspense>
  );
}
