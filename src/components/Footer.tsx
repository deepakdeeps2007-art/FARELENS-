import React from 'react';
import Link from 'next/link';
import { Bus, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Bus className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Fare<span className="text-emerald-400">Lens</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s transparent bus price comparison and Book-Now-or-Wait decision engine. Know the real final payable fare before you checkout.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent &amp; Objective</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Compare &amp; Save</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/search?from=Bangalore&to=Hyderabad" className="hover:text-white transition-colors">Bangalore → Hyderabad Buses</Link></li>
              <li><Link href="/search?from=Mumbai&to=Pune" className="hover:text-white transition-colors">Mumbai → Pune Buses</Link></li>
              <li><Link href="/search?from=Delhi&to=Jaipur" className="hover:text-white transition-colors">Delhi → Jaipur Buses</Link></li>
              <li><Link href="/search?from=Chennai&to=Bangalore" className="hover:text-white transition-colors">Chennai → Bangalore Buses</Link></li>
              <li><Link href="/coupons" className="hover:text-white transition-colors">Verified Bus Coupons</Link></li>
              <li><Link href="/calendar" className="hover:text-white transition-colors">30-Day Fare Calendar</Link></li>
            </ul>
          </div>

          {/* Decision Platform */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Technology &amp; Features</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/alerts" className="hover:text-white transition-colors">Price Drop Tracking</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Traveller Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Verification Portal</Link></li>
              <li><Link href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliate &amp; Partner Disclosure</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About FareLens</Link></li>
            </ul>
          </div>

          {/* Transparency & Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Transparency Policy</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              FareLens is not a ticket merchant or booking agent. When you choose an offer, we transfer you directly to the official provider (redBus, AbhiBus, MakeMyTrip, etc.). We may earn an affiliate commission at no extra cost to you.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliate Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} FareLens Technologies. All rights reserved. Made for Indian travellers.</p>
          <p className="flex items-center gap-1">
            Built with 100% price transparency and zero deceptive dark patterns.
          </p>
        </div>
      </div>
    </footer>
  );
}
