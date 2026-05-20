'use client';

import { useAppStore } from '@/src/store/useAppStore';
import { Role } from '@/src/types/enums';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ApplicationForm from '@/components/provider/ApplicationForm';
import ServiceManager from '@/components/provider/ServiceManager';
import OptimizedImage from '@/components/common/OptimizedImage';

export default function ProviderDashboardPage() {
  const { user, role } = useAppStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'services' | 'apply'>('services');

  // Role Guard
  useEffect(() => {
    // If not provider, redirect to /403
    if (role !== Role.PROVIDER) {
      router.push('/403');
    }
  }, [role, router]);

  if (role !== Role.PROVIDER || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        <p className="text-gray-500 text-sm">Sahifa yuklanmoqda...</p>
      </div>
    );
  }

  const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
  const initials = `${user.first_name[0] || ''}${user.last_name ? user.last_name[0] : ''}`.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Header Profile Dashboard Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 to-violet-600" />
        
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-inner overflow-hidden shrink-0">
            {user.avatar ? (
              <OptimizedImage src={user.avatar} alt={fullName} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-55 text-indigo-700 border border-indigo-100">
                Mutaxassis paneli
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">@{user.username} • {user.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/provider/schedule"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-sm transition flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 transform group-hover:scale-110 transition duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Ish jadvalini boshqarish
          </Link>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition duration-200 ${
            activeTab === 'services'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Mening xizmatlarim
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition duration-200 ${
            activeTab === 'apply'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Kategoriya qo&apos;shish arizasi
        </button>
      </div>

      {/* Main Sections */}
      <div className="space-y-6">
        {activeTab === 'services' ? (
          <ServiceManager />
        ) : (
          <ApplicationForm />
        )}
      </div>
    </div>
  );
}
