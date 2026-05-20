import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-xl mx-auto my-12 bg-white border border-gray-100 rounded-3xl shadow-xl">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner text-4xl font-black select-none">
        404
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Sahifa topilmadi</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
          Siz qidirayotgan sahifa mavjud emas, nomi o&apos;zgargan yoki vaqtincha olib tashlangan bo&apos;lishi mumkin.
        </p>
      </div>
      <Link
        href="/catalog"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl transition shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Katalogga qaytish
      </Link>
    </div>
  );
}
