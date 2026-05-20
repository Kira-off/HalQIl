'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '../lib/auth';

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth status on mount and when local storage changes
    setIsAuthenticated(authApi.isAuthenticated());
    
    // Add event listener to catch login/logout across tabs or components
    const handleStorageChange = () => {
      setIsAuthenticated(authApi.isAuthenticated());
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Note: We'd normally use a global store (like Zustand) to sync this perfectly
    // For this simple test, we'll just check on interval as well
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            HalQil
          </Link>
          
          <div className="flex space-x-4">
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium px-3 py-2 rounded-md transition"
              >
                Chiqish
              </button>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition"
                >
                  Kirish
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
                >
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
