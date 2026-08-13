'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletStatusBadge } from '../wallet/WalletStatusBadge';

const NAV_ITEMS = [
  { label: 'Marketplace', href: '/loans' },
  { label: 'Create Loan', href: '/loans/create' },
  { label: 'My Loans', href: '/my-loans' },
  { label: 'My Investments', href: '/my-investments' },
  { label: 'Activity', href: '/activity' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Analytics', href: '/analytics' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-900/30 flex items-center justify-center font-black text-white text-lg">
              S
            </span>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
              StellarLend
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-950/50 text-purple-300 border border-purple-800/50'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <WalletStatusBadge />
        </div>
      </div>
    </header>
  );
}
