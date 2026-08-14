import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrepNest - AI Placement Preparation Platform',
  description: 'Production-ready SaaS for placement prep, DSA, and AI mock interviews.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
