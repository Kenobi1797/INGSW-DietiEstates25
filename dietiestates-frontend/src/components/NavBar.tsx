"use client";

import Logo from "./Logo";
import Menu from "./Menu";
import { useUser } from "@/Context/Context";
import { getMenuForRole } from "@/Constants/NavbarLinks";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  readonly className?: string;
  /** compact=true → mostra dropdown "Azioni" (solo sulla home) */
  readonly compact?: boolean;
}

export default function Navbar({ className = "", compact = false }: NavbarProps) {
  const { authuser, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = authuser ? getMenuForRole(authuser.ruolo) : [];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className={`navbar ${className}`}>
      <Logo />

      {authuser ? (
        <>
          {compact ? (
            /* ── Home: bottone dropdown ── */
            <Menu items={menuItems} buttonLabel="Azioni" />
          ) : (
            /* ── Altre pagine: link in riga ── */
            <div className="flex items-center gap-1 flex-wrap">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-gray-700 hover:text-red-600 font-medium text-sm">Ricerca Immobili</Link>
          <Link href="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 border border-red-600 hover:bg-red-50">Accedi</Link>
        </div>
      )}
    </nav>
  );
}
