import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/AppProviders'; // To be created for Supabase context

const geistSans = GeistSans; // Using GeistSans directly
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'Renderri - AI Image Generation',
  description: 'Generate, edit, and enhance images with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
