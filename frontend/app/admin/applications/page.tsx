'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/src/store/useAppStore';
import { Role } from '@/src/types/enums';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { ProviderApplication } from '@/src/types';
import OptimizedImage from '@/components/common/OptimizedImage';

export default function AdminApplicationsPage() {
  const { role } = useAppStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Role Guard
  useEffect(() => {
    if (role !== Role.SUPER_ADMIN) {
      router.push('/403');
    }
  }, [role, router]);

  // Fetch Applications
  const { data: applications = [], isLoading, isError } = useQuery<ProviderApplication[]>({
    queryKey: ['adminApplications'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.admin.applications);
      return res.data;
    },
    enabled: role === Role.SUPER_ADMIN,
  });

  // Mutation for approving / rejecting applications
  const reviewMutation = useMutation({
    mutationFn: async ({ appId, status, note }: { appId: number; status: 'APPROVED' | 'REJECTED'; note?: string }) => {
      const url = `${ENDPOINTS.admin.applications}${appId}/`;
      const response = await apiClient.patch(url, { status, rejection_note: note });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
    },
  });

  const handleReview = (appId: number, status: 'APPROVED' | 'REJECTED') => {
    let note = undefined;
    if (status === 'REJECTED') {
      const reason = prompt('Iltimos, rad etish sababini kiriting (ixtiyoriy):');
      if (reason === null) return; // cancel clicked
      note = reason || undefined;
    }
    reviewMutation.mutate({ appId, status, note });
  };

  if (role !== Role.SUPER_ADMIN) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        <p className="text-gray-500 text-sm font-medium">Sahifa yuklanmoqda...</p>
      </div>
    );
  }

  // Filter based on active tab status
  const filteredApplications = applications.filter((app) => app.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Navigation and Header */}
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
            Provayderlik Arizalari Moderatsiyasi
          </h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            Mutaxassis bo&apos;lish istagidagi arizachilarning ma&apos;lumotlarini tasdiqlash yoki rad etish
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-6 font-bold text-xs border-b-2 tracking-wider uppercase transition duration-200 cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'PENDING' ? 'Kutilayotgan' : tab === 'APPROVED' ? 'Tasdiqlangan' : 'Rad etilgan'}
          </button>
        ))}
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="bg-white border border-gray-150 rounded-3xl p-12 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <p className="text-xs text-gray-500 font-bold">Arizalar yuklanmoqda...</p>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-150 text-rose-700 p-6 rounded-3xl text-sm font-semibold flex items-center gap-3">
          <svg className="w-6 h-6 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Arizalar ro&apos;yxatini yuklashda xatolik yuz berdi.
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white border border-gray-150 rounded-3xl p-12 text-center text-sm font-semibold text-gray-400 shadow-sm">
          Hech qanday ariza topilmadi
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {filteredApplications.map((app) => {
            const applicantName = `${app.user.first_name} ${app.user.last_name || ''}`.trim();
            const initials = `${app.user.first_name[0] || ''}${app.user.last_name ? app.user.last_name[0] : ''}`.toUpperCase();
            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                {app.status === 'PENDING' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
                )}
                {app.status === 'APPROVED' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                )}
                {app.status === 'REJECTED' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
                )}

                {/* Applicant Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-55 to-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-black shrink-0">
                      {app.user.avatar ? (
                        <OptimizedImage src={app.user.avatar} alt={applicantName} width={48} height={48} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                        {applicantName}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">@{app.user.username} • {app.user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Men haqimda (Bio)</h4>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                        {app.about_me || 'Kiritilmagan'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Nega qo&apos;shilmoqchi</h4>
                      <p className="text-xs text-gray-650 font-medium leading-relaxed mt-1 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                        {app.why_join || 'Kiritilmagan'}
                      </p>
                    </div>

                    {app.districts && app.districts.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Tumanlar</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {app.districts.map((d, idx) => (
                            <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.skills && app.skills.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Ko&apos;nikmalar, Tajriba va Tariflar</h4>
                        <div className="space-y-2 mt-1">
                          {app.skills.map((s, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 space-y-1">
                              <div className="flex justify-between items-center text-xs font-bold text-gray-900">
                                <span className="inline-flex px-1.5 py-0.5 rounded bg-indigo-55 text-indigo-700 text-[9px] font-extrabold uppercase tracking-wide">
                                  Skill ID: {s.skill_id} ({s.service_type})
                                </span>
                                <span className="text-indigo-600 font-black">
                                  {Number(s.price_from).toLocaleString()}-{Number(s.price_to).toLocaleString()} UZS/soat
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-100/50">
                                <span>Tajriba: <strong className="text-gray-700">{s.experience_years} yil</strong></span>
                                {s.description && <span className="text-gray-500 italic max-w-[60%] truncate">{s.description}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.status === 'REJECTED' && app.rejection_note && (
                      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-rose-700">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">Rad etish sababi:</h4>
                        <p className="text-xs font-semibold mt-0.5 leading-relaxed">{app.rejection_note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Actions */}
                {app.status === 'PENDING' && (
                  <div className="flex gap-2.5 pt-3 border-t border-gray-100 mt-2 shrink-0 justify-end">
                    <button
                      onClick={() => handleReview(app.id, 'REJECTED')}
                      className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs px-4 py-3 rounded-2xl transition cursor-pointer"
                    >
                      Rad etish
                    </button>
                    <button
                      onClick={() => handleReview(app.id, 'APPROVED')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-sm transition cursor-pointer"
                    >
                      Tasdiqlash
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
