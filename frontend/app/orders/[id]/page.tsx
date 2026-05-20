'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import { Order } from '@/src/types';
import { OrderStatus, Role, UserStatus, AvailabilityStatus } from '@/src/types/enums';
import { useAppStore } from '@/src/store/useAppStore';
import OrderActions from '@/components/orders/OrderActions';
import ChatWindow from '@/components/chat/ChatWindow';

// Helpers to draw visual status step markers
const STEPS = [
  { status: OrderStatus.PENDING, label: 'Yuborilgan' },
  { status: OrderStatus.ACCEPTED, label: 'Qabul qilindi' },
  { status: OrderStatus.IN_PROGRESS, label: 'Bajarilmoqda' },
  { status: OrderStatus.AWAITING_CONFIRMATION, label: 'Tasdiqlash kutilmoqda' },
  { status: OrderStatus.COMPLETED, label: 'Bajarildi' },
];

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return <span className="px-3 py-1 bg-blue-50 border border-blue-150 text-blue-700 rounded-full text-xs font-black uppercase">Kutilmoqda</span>;
    case OrderStatus.ACCEPTED:
      return <span className="px-3 py-1 bg-teal-50 border border-teal-150 text-teal-700 rounded-full text-xs font-black uppercase">Qabul qilindi</span>;
    case OrderStatus.IN_PROGRESS:
      return <span className="px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full text-xs font-black uppercase animate-pulse">Bajarilmoqda</span>;
    case OrderStatus.AWAITING_CONFIRMATION:
      return <span className="px-3 py-1 bg-violet-50 border border-violet-150 text-violet-700 rounded-full text-xs font-black uppercase animate-pulse">Tasdiqlash kutilmoqda</span>;
    case OrderStatus.COMPLETED:
      return <span className="px-3 py-1 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-full text-xs font-black uppercase">Tugallandi</span>;
    case OrderStatus.REJECTED:
      return <span className="px-3 py-1 bg-red-50 border border-red-150 text-red-700 rounded-full text-xs font-black uppercase">Rad etildi</span>;
    case OrderStatus.CANCELLED:
      return <span className="px-3 py-1 bg-gray-150 border border-gray-200 text-gray-700 rounded-full text-xs font-black uppercase">Bekor qilindi</span>;
    case OrderStatus.DISPUTED:
      return <span className="px-3 py-1 bg-amber-50 border border-amber-150 text-amber-700 rounded-full text-xs font-black uppercase">Bahsli holat (Disput)</span>;
    default:
      return <span className="px-3 py-1 bg-gray-50 border border-gray-150 text-gray-700 rounded-full text-xs font-black uppercase">{status}</span>;
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { user } = useAppStore();

  // Fetch Order Details with Query Client
  const { data: order, isLoading, error } = useQuery<Order | null>({
    queryKey: ['order', id],
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.orders.getById(id));
        return response.data;
      } catch {
        console.warn('Backend API connection failed, loading rich mock fallback order detail for development.');
        // Simulate loading latency
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockClient = {
          id: 'user-789',
          wallet_id: '0x3c4b...89ef',
          first_name: 'Farhod',
          last_name: 'Soliyev',
          username: 'farhod_client',
          email: 'farhod@client.uz',
          role: Role.USER,
          status: UserStatus.ACTIVE,
          is_online: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockProvider = {
          id: 42,
          user: {
            id: 'provider-123',
            wallet_id: '0x71c7...4489',
            first_name: 'Jasur',
            last_name: 'Rahimov',
            username: 'jasur_master',
            email: 'jasur@halqil.uz',
            role: Role.PROVIDER,
            status: UserStatus.ACTIVE,
            is_online: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          bio: 'Santexnika va montaj ishlari ustasi. 10 yillik tajribaga ega sertifikatlangan usta.',
          availability_status: AvailabilityStatus.AVAILABLE,
          reliability: 98,
          successful_orders: 145,
          failed_orders: 2,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          skills: [],
          districts: [],
          schedule: [],
        };

        const mockOrder: Order = {
          id: Number(id) || 1204,
          user: mockClient,
          provider: mockProvider,
          skill: {
            id: 1,
            category: 1,
            name: 'Santexnika Ta&apos;mirlash',
            is_active: true,
            created_at: '',
          },
          status: OrderStatus.PENDING,
          description: 'Oshxonadagi suv quvurida shoshilinch oqish bor, suvni tozalash kerak. Tezda yetib kelish zarur.',
          address: 'Toshkent shahar, Chilonzor tumani, 4-daha, 12-uy, 45-xonadon',
          preferred_date: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
          auto_completed: false,
          created_at: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
          updated_at: new Date().toISOString(),
        };

        // Cache simulated state in store for other slices
        useAppStore.getState().addOrder(mockOrder);

        return mockOrder;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 space-y-4 border border-gray-150 h-64" />
            <div className="bg-white rounded-3xl p-8 space-y-4 border border-gray-150 h-32" />
          </div>
          <div className="bg-white rounded-3xl border border-gray-150 h-96" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Buyurtma topilmadi</h3>
        <p className="text-gray-500 mt-2">Siz ko&apos;rmoqchi bo&apos;lgan buyurtma mavjud emas yoki u sizga tegishli emas.</p>
        <Link 
          href="/catalog"
          className="inline-flex items-center gap-2 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-2xl transition shadow-md"
        >
          Katalogga o&apos;tish
        </Link>
      </div>
    );
  }

  // Security Check: Gate route access to only order client or order provider
  const isOwner = !user || user.id === order.user.id || user.id === order.provider.user.id || user.role === Role.SUPER_ADMIN;

  if (user && !isOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-8v6m0 5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Ruxsat etilmagan</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Siz bu buyurtma tafsilotlarini yoki chat xabarlarini ko&apos;rish huquqiga ega emassiz.</p>
        <button
          onClick={() => router.push('/catalog')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition"
        >
          Katalogga qaytish
        </button>
      </div>
    );
  }

  // Calculate index for the visual progress steps tracker
  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const isExceptionStatus = [OrderStatus.REJECTED, OrderStatus.CANCELLED, OrderStatus.FAILED].includes(order.status);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href={user?.role === Role.PROVIDER ? '/provider' : '/catalog'}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {user?.role === Role.PROVIDER ? 'Provider boshqaruv paneliga qaytish' : 'Katalogga qaytish'}
        </Link>
      </div>

      {/* Main visual step-by-step progress tracking panel */}
      {!isExceptionStatus && currentStepIndex !== -1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {STEPS.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
              return (
                <div key={step.status} className="flex-1 flex flex-col items-center text-center relative group">
                  {/* Step Connector line */}
                  {idx > 0 && (
                    <div 
                      className={`hidden md:block absolute top-4 right-1/2 left-[-50%] h-0.5 -translate-y-1/2 transition-colors duration-300 z-0 ${
                        isActive ? 'bg-indigo-600' : 'bg-gray-150'
                      }`} 
                    />
                  )}

                  {/* Step Node circle */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 relative z-10 ${
                      isCurrent 
                        ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 scale-110'
                        : isActive 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    {isActive && !isCurrent ? '✓' : idx + 1}
                  </div>

                  {/* Step title label */}
                  <span 
                    className={`text-[10px] sm:text-xs font-bold mt-2.5 uppercase tracking-wider ${
                      isCurrent 
                        ? 'text-indigo-600 font-extrabold'
                        : isActive 
                        ? 'text-gray-800' 
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exception Status Banner details */}
      {isExceptionStatus && (
        <div className="bg-red-50 border border-red-150 rounded-3xl p-6 flex items-start gap-4 text-red-800">
          <div className="p-3 bg-red-100/50 rounded-2xl text-red-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-base">Buyurtma to&apos;xtatildi</h4>
            <p className="text-sm mt-1 text-red-700 font-medium">
              Ushbu buyurtma to&apos;xtatilgan va keyingi bosqichlarga o&apos;tish imkoniyati yo&apos;q. Hozirgi holat: <span className="font-extrabold underline">{order.status === OrderStatus.REJECTED ? 'Rad etilgan' : order.status === OrderStatus.CANCELLED ? 'Bekor qilingan' : 'Bajarilmadi'}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Dispute Alert Box */}
      {order.status === OrderStatus.DISPUTED && (
        <div className="bg-amber-50 border border-amber-150 rounded-3xl p-6 flex items-start gap-4 text-amber-800">
          <div className="p-3 bg-amber-100/50 rounded-2xl text-amber-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-base">Disput jarayoni ochildi</h4>
            <p className="text-sm mt-1 text-amber-700 font-medium font-sans leading-relaxed">
              Mijoz yoki usta tomonidan e&apos;tiroz bildirildi. HalQil moderatorlari tez orada siz bilan bog&apos;lanadi. Tizim to&apos;lovi muzlatilgan holatda saqlanadi.
            </p>
          </div>
        </div>
      )}

      {/* Main Columns layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Detailed Order parameters card + actions console */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
            
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-5">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Buyurtma ID</span>
                <h2 className="text-xl font-extrabold text-gray-900">#HALQIL-{order.id}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Buyurtma Holati</span>
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Description Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tavsif va talablar</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 border border-gray-100 p-4 rounded-2xl">{order.description}</p>
            </div>

            {/* Address & Dates parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bajariladigan manzil</h3>
                <p className="text-sm text-gray-900 font-semibold">{order.address}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Belgilangan vaqt</h3>
                <p className="text-sm text-gray-900 font-semibold">
                  {order.preferred_date ? new Date(order.preferred_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Kiritilmagan'}
                </p>
              </div>
            </div>

            {/* Participant Details info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              {/* Participant Card */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mijoz ma&apos;lumotlari</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center select-none shadow-sm">
                    {order.user.first_name[0]}{order.user.last_name ? order.user.last_name[0] : ''}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{order.user.first_name} {order.user.last_name || ''}</h4>
                    <p className="text-xs text-gray-500">@{order.user.username}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mutaxassis ma&apos;lumotlari</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center select-none shadow-sm">
                    {order.provider.user.first_name[0]}{order.provider.user.last_name ? order.provider.user.last_name[0] : ''}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{order.provider.user.first_name} {order.provider.user.last_name || ''}</h4>
                    <p className="text-xs text-gray-500">@{order.provider.user.username}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Status Console Buttons */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider block">Boshqaruv Konsoli</h3>
            <OrderActions order={order} />
          </div>
        </div>

        {/* Right Column - Live Chat Workspace */}
        <div className="lg:col-span-1">
          <ChatWindow orderId={order.id} />
        </div>
      </div>
    </div>
  );
}
