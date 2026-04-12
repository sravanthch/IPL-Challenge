import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IPL 2026 Predictions — Sravanth, Srivatsav, Sathwik, Vikhyath & Nithin',
  description: 'A friendly IPL 2026 match prediction contest between five friends. Predict match winners, track scores on the leaderboard, and view match history.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <AppProvider>
          <Navbar />
          <main className="pt-16 md:pt-20">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
