import type { Metadata, Viewport } from 'next';
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

/**
 * Viewport export — separate from metadata in Next.js 14+.
 * `viewport-fit=cover` is REQUIRED for iPhone Notch / Dynamic Island
 * safe area insets (env(safe-area-inset-*)) to work correctly.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Allows content to extend under the notch/island; we control padding via CSS
  viewportFit: 'cover',
  // Prevent iOS font size inflation in landscape
  maximumScale: 1,
  userScalable: false,
  // Theme color for the browser chrome bar
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>" />

        {/*
          FOUC Prevention: Blocking script that runs SYNCHRONOUSLY before React hydrates.
          This reads the persisted theme from localStorage (key: 'placeprep_v5') and
          applies or removes the 'dark' class on <html> instantly — zero flash.

          Why dangerouslySetInnerHTML? Because we need a BLOCKING script tag.
          Async/deferred scripts run too late; React has already rendered by then.
          The try/catch swallows errors in SSR, private browsing, or storage-blocked envs.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('placeprep_v5');
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    // Apply dark class if theme is explicitly 'dark', or if not set
                    // (default is dark, matching INITIAL_STATE in AppContext)
                    if (!parsed.theme || parsed.theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } else {
                    // No stored state yet: apply dark as default
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // Fallback: apply dark (matches app default)
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ErrorBoundary>
          <AuthProvider>
            <AppProvider>
              {/* mobile-viewport-shell applies ONLY on <768px via CSS — no-op on desktop */}
              <div className="mobile-viewport-shell">
                {children}
                <Toaster richColors position="top-right" closeButton theme="dark" />
              </div>
            </AppProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
