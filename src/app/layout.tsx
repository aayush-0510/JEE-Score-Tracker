import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JEE Score & Mock Analyzer | Target 99+ Percentile',
  description: 'Precision JEE score calculator (+4/-1 format), mock test comparison, lagging area diagnostic, mistake notebook, and 15 Ultimate Challenges syllabus tracker.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'JEE Score Analyzer',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-blue-600 selection:text-white pb-safe">
        {children}
      </body>
    </html>
  );
}
