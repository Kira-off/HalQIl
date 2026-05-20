'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Page Error caught:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-xl mx-auto my-12 bg-white border border-gray-100 rounded-3xl shadow-xl">
      <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-sm animate-bounce">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Sahifani yuklashda xatolik yuz berdi</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
          Ushbu sahifada xatolik yuz berdi. Sahifani qayta yuklash orqali muammoni hal qilishga urinib ko&apos;rishingiz mumkin.
        </p>
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl transition shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Qayta urinish
        </button>
        <button
          onClick={() => {
            window.location.href = '/catalog';
          }}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Katalogga qaytish
        </button>
      </div>
    </div>
  );
}
