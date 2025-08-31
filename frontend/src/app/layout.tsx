import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mondodoro - Liste Regalo per Gioiellerie',
  description: 'Piattaforma per liste regalo e collette online dedicate a gioiellerie',
  keywords: 'liste regalo, gioiellerie, collette online, regali, matrimonio',
  authors: [{ name: 'Mondodoro' }],
  openGraph: {
    title: 'Mondodoro - Liste Regalo per Gioiellerie',
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
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
