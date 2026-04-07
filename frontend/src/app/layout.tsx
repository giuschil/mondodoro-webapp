import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

const GTM_ID = 'GTM-W2X4BVPQ';

export const metadata: Metadata = {
  title: 'ListDreams - Liste Regalo per Gioiellerie',
  description: 'Piattaforma per liste regalo e collette online dedicate a gioiellerie',
  keywords: 'liste regalo, gioiellerie, collette online, regali, matrimonio',
  authors: [{ name: 'ListDreams' }],
  openGraph: {
    title: 'ListDreams - Liste Regalo per Gioiellerie',
    description: 'Crea liste regalo e collette online per la tua gioielleria',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {/* Google Tag Manager (noscript fallback) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: { background: '#10b981' },
                },
                error: {
                  style: { background: '#ef4444' },
                },
              }}
            />
          </AuthProvider>
        </ErrorBoundary>

        {/* Google Tag Manager — loaded after page is interactive, non-blocking */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
        />
        <Script id="gtm-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});`}
        </Script>
      </body>
    </html>
  );
}
