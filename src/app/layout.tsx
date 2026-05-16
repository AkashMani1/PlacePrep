/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Toaster } from 'sonner';
import { env } from '@/lib/env';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: 'PlacePrep — The Ultimate TCS 90-Day Placement Dashboard',
  description:
    'Crack TCS Ninja, Digital, and Prime rounds in 90 days. Track DSA, Aptitude, Core Subjects, and Projects in one professional dashboard.',
  keywords: ['TCS NQT', 'Placement Prep', 'SDE roles', 'DSA tracker', 'TCS Digital', 'TCS Prime'],
  openGraph: {
    title: 'PlacePrep — The Ultimate TCS 90-Day Placement Dashboard',
    description: 'Systematic 90-day sprint to crack TCS recruitment.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ErrorBoundary>
          <AuthProvider>
            <AppProvider>
              {children}
              <Toaster richColors position="top-right" closeButton theme="dark" />
            </AppProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
