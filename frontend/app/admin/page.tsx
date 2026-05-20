'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/src/store/useAppStore';
import { Role } from '@/src/types/enums';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import NotificationSender from '@/components/admin/NotificationSender';

export default function AdminDashboardPage() {
  const { user, role } = useAppStore();
  const router = useRouter();

  // Role Guard
  useEffect(() => {
    if (role !== Role.SUPER_ADMIN) {
      router.push('/403');
    }
  }, [role, router]);

  // Fetch Users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.admin.users);
      return res.data;
    },
    enabled: role === Role.SUPER_ADMIN,
  });

  // Fetch Applications
  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['adminApplications'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.admin.applications);
      return res.data;
    },
    enabled: role === Role.SUPER_ADMIN,
  });

  // Fetch Disputes
  const { data: disputes = [], isLoading: loadingDisputes } = useQuery({
    queryKey: ['adminDisputes'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.admin.disputes);
      return res.data;
    },
    enabled: role === Role.SUPER_ADMIN,
  });

  if (role !== Role.SUPER_ADMIN || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        <p className="text-gray-500 text-sm font-medium">Sahifa yuklanmoqda...</p>
      </div>
    );
  }

  const pendingApps = applications.filter((app: { status: string }) => app.status === 'PENDING');
  const activeDisputes = disputes; // Active disputes fetched from the disputed orders endpoint

  const isLoadingStats = loadingUsers || loadingApps || loadingDisputes;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Admin Dashboard Welcomer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 to-violet-600" />
        
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Tizim Boshqaruvi
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-55 text-indigo-700 border border-indigo-100">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Salom, {user.first_name}! Tizim holati va foydalanuvchilar faoliyatini boshqarishingiz mumkin.
          </p>
        </div>

        {/* Navigation Quick Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/users"
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-150 font-bold text-xs px-4 py-3 rounded-2xl shadow-inner transition flex items-center gap-2"
          >
            Foydalanuvchilar
          </Link>
          <Link
            href="/admin/applications"
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-150 font-bold text-xs px-4 py-3 rounded-2xl shadow-inner transition flex items-center gap-2"
          >
            Arizalar
          </Link>
          <Link
            href="/admin/disputes"
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-150 font-bold text-xs px-4 py-3 rounded-2xl shadow-inner transition flex items-center gap-2"
          >
            Nizolar
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Users Count Card */}
        <Link
          href="/admin/users"
          className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-md block group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Foydalanuvchilar</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition group-hover:scale-110 duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          {isLoadingStats ? (
            <div className="h-9 w-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <p className="text-3xl font-black text-gray-900 leading-none">{users.length}</p>
          )}
          <p className="text-[10px] text-gray-400 font-semibold mt-2 group-hover:text-indigo-600 transition">
            Barcha a&apos;zolarni boshqarish &rarr;
          </p>
        </Link>

        {/* Pending Provider Applications Card */}
        <Link
          href="/admin/applications"
          className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-md block group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Kutilayotgan arizalar</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-55 flex items-center justify-center text-indigo-600 transition group-hover:scale-110 duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          {isLoadingStats ? (
            <div className="h-9 w-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <p className="text-3xl font-black text-gray-900 leading-none">{pendingApps.length}</p>
          )}
          <p className="text-[10px] text-gray-400 font-semibold mt-2 group-hover:text-indigo-600 transition">
            Provayderlik arizalarini ko&apos;rish &rarr;
          </p>
        </Link>

        {/* Disputes Card */}
        <Link
          href="/admin/disputes"
          className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-md block group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Faol nizolar</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 transition group-hover:scale-110 duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          {isLoadingStats ? (
            <div className="h-9 w-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <p className="text-3xl font-black text-gray-900 leading-none">{activeDisputes.length}</p>
          )}
          <p className="text-[10px] text-gray-400 font-semibold mt-2 group-hover:text-orange-600 transition">
            Nizolarni hal qilish &rarr;
          </p>
        </Link>
      </div>

      {/* Broadcast Notification Module */}
      <NotificationSender />
    </div>
  );
}
