import Link from 'next/link';
import { Provider } from '@/src/types';
import OptimizedImage from '@/components/common/OptimizedImage';

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const { user, bio, reliability, successful_orders, skills, districts } = provider;
  const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
  
  // Calculate average price range across all skills
  const priceMin = skills && skills.length > 0 ? Math.min(...skills.map(s => parseFloat(s.price_from) || 0)) : 0;
  const priceMax = skills && skills.length > 0 ? Math.max(...skills.map(s => parseFloat(s.price_to) || 0)) : 0;
  const priceString = priceMin && priceMax 
    ? `${priceMin.toLocaleString()} - ${priceMax.toLocaleString()} UZS` 
    : priceMin 
      ? `od ${priceMin.toLocaleString()} UZS` 
      : 'Kelishilgan narx';

  // Average rating calculated from reliability (0-100) mapped to 5 stars
  const stars = reliability ? (reliability / 20).toFixed(1) : '5.0';

  // Join categories/skills
  const skillsList = skills ? skills.map(s => s.skill.name).slice(0, 3).join(', ') : '';
  
  // Join districts
  const districtsList = districts ? districts.map(d => d.district_name).slice(0, 3).join(', ') : '';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div className="p-6">
        {/* Top Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xl overflow-hidden shrink-0">
            {user.avatar ? (
              <OptimizedImage src={user.avatar} alt={fullName} width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              user.first_name[0]
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition truncate">
              {fullName}
            </h3>
            <p className="text-sm text-indigo-600 font-medium truncate">
              {skillsList || 'Mutaxassis'}
            </p>
          </div>
        </div>

        {/* Info stats */}
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{stars}</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
            {successful_orders} muvaffaqiyatli
          </span>
        </div>

        {/* Bio description */}
        <p className="text-sm text-gray-500 mt-4 line-clamp-2">
          {bio || "Ushbu mutaxassis o'z ma'lumotlarini taqdim etmagan."}
        </p>

        {/* Covered Districts */}
        <div className="mt-4">
          <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider mb-1">Tumanlar</span>
          <p className="text-xs text-gray-600 truncate">
            {districtsList || 'Barcha tumanlar'}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="min-w-0">
          <span className="text-xs text-gray-400 block">Narxi</span>
          <span className="font-bold text-gray-800 text-sm block truncate">{priceString}</span>
        </div>
        <Link 
          href={`/catalog/${provider.id}`} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition duration-150 shadow-sm hover:shadow shrink-0"
        >
          Batafsil
        </Link>
      </div>
    </div>
  );
}
