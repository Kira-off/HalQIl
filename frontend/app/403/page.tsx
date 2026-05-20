'use client';

import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto text-center">
        <main className="sm:flex sm:items-center">
          <p className="text-5xl font-black text-indigo-600 sm:text-6xl">403</p>
          <div className="sm:ml-6 text-left sm:border-l sm:border-gray-200 sm:pl-6">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Ruxsat berilmagan
            </h1>
            <p className="mt-2 text-base text-gray-500 font-medium">
              Sizda ushbu sahifaga kirish huquqi mavjud emas. Sahifa faqat Super Adminlar uchun ruxsat etilgan.
            </p>
          </div>
        </main>
        <div className="mt-10 flex space-x-3 justify-center">
          <Link
            href="/catalog"
            className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-bold rounded-2xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            Katalogga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
