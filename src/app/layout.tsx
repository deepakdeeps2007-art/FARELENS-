import type { Metadata } from 'next';
import './globals.css';
import { DemoBanner } from '@/components/DemoBanner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FareLens – India Bus Price Comparison & Book-Now-or-Wait Engine',
  description: 'Compare final payable prices across redBus, AbhiBus, MakeMyTrip, and Paytm. Discover verified coupons and receive honest Book-Now-or-Wait recommendations.',
  keywords: ['bus ticket price comparison', 'redbus vs abhibus', 'bus coupons', 'cheapest bus fares india', 'book bus now or wait'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <DemoBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
