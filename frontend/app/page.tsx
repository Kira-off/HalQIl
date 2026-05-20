'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        console.log('Fetching user data...');
        const res = await fetch('http://localhost:8000/api/users/me/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const json = await res.json();
        console.log('Response status:', res.status);
        console.log('Response body:', json);

        if (res.ok) {
          setUser(json);
        } else {
          // If token is invalid/expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Server bilan aloqa yo\'q');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Salom, {user.first_name}!</h1>
      
      <div className="space-y-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-gray-600 text-sm">Email</p>
          <p className="font-medium text-gray-900">{user.email}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-gray-600 text-sm">Username</p>
          <p className="font-medium text-gray-900">@{user.username}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-gray-600 text-sm">Rol</p>
          <p className="font-medium inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">
            {user.role}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-gray-600 text-sm">Wallet ID</p>
          <p className="font-mono bg-gray-200 inline-block px-2 py-1 text-gray-800 rounded mt-1">
            {user.wallet_id}
          </p>
        </div>
      </div>
      
      <button 
        onClick={handleLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
      >
        Chiqish
      </button>
    </div>
  );
}
