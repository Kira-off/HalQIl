'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

const CATEGORIES = [
  { id: '1', name: 'Santexnika' },
  { id: '2', name: 'Elektr xizmatlari' },
  { id: '3', name: 'Tozalash' },
  { id: '4', name: 'Maishiy texnika ta\'mirlash' },
  { id: '5', name: 'Yuk tashish' },
];

const DISTRICTS = [
  'Chilonzor',
  'Yunusobod',
  'Mirzo Ulug\'bek',
  'Yashnobod',
  'Mirobod',
  'Uchtepa',
  'Olmazor',
  'Shayxontohur',
  'Yakkasaroy',
  'Sergeli',
];

export default function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state initialized from searchParams
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Synchronize state if URL changes externally
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setDistrict(searchParams.get('district') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // Push new params to URL
  const updateQueryParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    updateQueryParams('category', val);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDistrict(val);
    updateQueryParams('district', val);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMinPrice(val);
    updateQueryParams('minPrice', val);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMaxPrice(val);
    updateQueryParams('maxPrice', val);
  };

  const handleClear = () => {
    setCategory('');
    setDistrict('');
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
          </svg>
          Filtrlar
        </h2>
        <button
          onClick={handleClear}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
        >
          Tozalash
        </button>
      </div>

      <div className="space-y-4">
        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Kategoriya</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            <option value="">Barchasi</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Tuman</label>
          <select
            value={district}
            onChange={handleDistrictChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            <option value="">Barchasi</option>
            {DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Narx (UZS)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="dan"
                value={minPrice}
                onChange={handleMinPriceChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="gacha"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
