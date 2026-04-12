'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getUserColor, getUserInitials } from '@/lib/utils';
import { Trophy, Clock, BarChart2, Shield, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Predictions', icon: Clock },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/history', label: 'History', icon: BarChart2 },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, isLoggedIn, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="main-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-[10px] md:text-xs font-black text-slate-900">IPL</span>
            </div>
            <div>
              <span className="font-bold text-white text-xs md:text-sm leading-none block">IPL 2026</span>
              <span className="text-amber-400 text-[10px] md:text-xs leading-none">Predictions</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 md:gap-4">
            {navLinks
              .filter(link => link.label !== 'Admin' || (currentUser?.toLowerCase() === 'sravanth'))
              .map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-400/10 text-amber-400'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-2 md:gap-3">
            {isLoggedIn && currentUser && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-900"
                    style={{ background: getUserColor(currentUser) }}
                  >
                    {getUserInitials(currentUser)}
                  </div>
                  <span className="text-xs md:text-sm font-medium text-slate-300">{currentUser}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut size={14} className="md:w-[15px] md:h-[15px]" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950/98 backdrop-blur-2xl shadow-2xl px-4 py-4 space-y-1">
          {navLinks
            .filter(link => link.label !== 'Admin' || (currentUser?.toLowerCase() === 'sravanth'))
            .map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          {isLoggedIn && currentUser && (
            <div className="flex items-center gap-3 px-4 py-4 border-t border-white/5 mt-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-900"
                style={{ background: getUserColor(currentUser) }}
              >
                {getUserInitials(currentUser)}
              </div>
              <span className="text-sm font-bold text-slate-300 flex-1">{currentUser}</span>
            </div>
          )}
        </div>
      )}
    </nav>

  );
}
