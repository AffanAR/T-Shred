import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore: allow importing global css without type declarations
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'T-Shred | AI Task Shredder ',
  description: 'Manage and shred your daily overwhelming tasks into tiny microscopic steps.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F4F6F9] text-slate-900 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}