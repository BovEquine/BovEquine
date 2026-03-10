'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/horses', label: 'Horses', icon: '🐴' },
  { href: '/health', label: 'Health Monitor', icon: '❤️' },
  { href: '/alerts', label: 'Alerts', icon: '🔔' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-amber-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐎</span>
            <span className="text-xl font-bold tracking-tight">BovEquine</span>
            <span className="hidden sm:block text-amber-300 text-sm font-medium">AI Health Monitor</span>
          </div>
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-700 text-white'
                      : 'text-amber-100 hover:bg-amber-800 hover:text-white'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
