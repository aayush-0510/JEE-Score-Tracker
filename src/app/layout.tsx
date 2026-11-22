import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JEE Main Score & Mock Analyzer | 99+ Percentile Tracker',
  description: 'Precision JEE score calculator (+4/-1 format), mock test comparison, lagging area diagnostic, mistake notebook, and 15 Ultimate Challenges syllabus tracker for Physics, Chemistry, and Mathematics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
