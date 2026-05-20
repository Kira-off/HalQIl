'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleGoHome = () => {
    window.location.href = '/catalog';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-xl mx-auto my-12 bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-xl">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Kutilmagan xatolik yuz berdi</h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
              Tizimda kutilmagan xatolik aniqlandi. Muammo tez orada mutaxassislarimiz tomonidan bartaraf etiladi. Keltirilgan noqulaylik uchun uzr so&apos;raymiz.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-2xl text-left text-xs font-mono text-red-700 max-h-40 overflow-auto max-w-sm mx-auto">
                {this.state.error.toString()}
              </div>
            )}
          </div>
          <button
            onClick={this.handleGoHome}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl transition shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
