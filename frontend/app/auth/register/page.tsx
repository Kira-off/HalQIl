'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function parseError(json: unknown): string {
  if (!json) return 'Noma\'lum xatolik';
  if (typeof json === 'string') return json;
  const obj = json as Record<string, unknown>;
  if (obj.detail && typeof obj.detail === 'string') return obj.detail;
  if (Array.isArray(obj.non_field_errors) && obj.non_field_errors.length > 0) {
    return String(obj.non_field_errors[0]);
  }
  const firstKey = Object.keys(obj)[0];
  if (firstKey) {
    const val = obj[firstKey];
    return `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
  }
  return 'Noma\'lum xatolik';
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', username: '',
    email: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }

    setLoading(true);
    try {
      const sendData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      console.log('Sending request:', sendData);

      const res = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendData),
      });

      const json = await res.json();
      console.log('Response status:', res.status);
      console.log('Response body:', json);

      if (res.ok) {
        router.push('/auth/login');
      } else {
        setError(parseError(json));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Server bilan aloqa yo\'q. Backend ishlaydimi?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Ro&apos;yxatdan o&apos;tish
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="first_name" placeholder="Ism"
              value={formData.first_name} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm" />
            <input name="last_name" placeholder="Familiya"
              value={formData.last_name} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm" />
          </div>
          <input name="username" placeholder="Username"
            value={formData.username} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm" />
          <input name="email" type="email" placeholder="Email"
            value={formData.email} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm" />
          <input name="password" type="password" placeholder="Parol"
            value={formData.password} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm" />
          <input name="confirmPassword" type="password"
            placeholder="Parolni tasdiqlang"
            value={formData.confirmPassword} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm" />

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
            {loading ? 'Yuklanmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Allaqachon hisobingiz bormi?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
