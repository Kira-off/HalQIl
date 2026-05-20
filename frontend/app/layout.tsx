import Navbar from '../components/Navbar';
import Providers from './providers';
import ErrorBoundary from '../components/common/ErrorBoundary';
import './globals.css';

export const metadata = {
  title: 'HalQil Test',
  description: 'HalQil API test frontend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </Providers>
      </body>
    </html>
  );
}
