'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/src/store/useAppStore';
import { Role } from '@/src/types/enums';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import UserTable from '@/components/admin/UserTable';

export default function AdminUsersPage() {
  const { role } = useAppStore();
  const router = useRouter();

  // Role Guard
  useEffect(() => {
    if (role !== Role.SUPER_ADMIN) {
      router.push('/403');
    }
  }, [role, router]);

  // Fetch Users
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.admin.users);
      return res.data;
    },
    enabled: role === Role.SUPER_ADMIN,
  });

  if (role !== Role.SUPER_ADMIN) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        <p className="text-gray-500 text-sm font-medium">Sahifa yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Navigation and Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="bg-white border border-gray-150 p-2.5 rounded-2xl shadow-sm text-gray-550 hover:text-indigo-650 transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
            Foydalanuvchilar Ro&apos;yxati
          </h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            Tizimdagi barcha mijozlar va provayderlarni muzlatish, bloklash yoki faollashtirish
          </p>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <div className="bg-white border border-gray-150 rounded-3xl p-12 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <p className="text-xs text-gray-500 font-bold">Foydalanuvchilar yuklanmoqda...</p>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-150 text-rose-700 p-6 rounded-3xl text-sm font-semibold flex items-center gap-3">
          <svg className="w-6 h-6 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Foydalanuvchilar ro&apos;yxatini yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang yoki keyinroq urinib ko&apos;ring.
        </div>
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
}
