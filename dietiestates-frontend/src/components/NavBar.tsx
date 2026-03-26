"use client";

import Logo from "./Logo";
import Menu from "./Menu";
import { useUser } from "@/Context/Context";
import { getMenuForRole } from "@/Constants/NavbarLinks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from 'next/navigation';

interface NavbarProps {
  className?: string;
  /** compact=true → mostra dropdown "Azioni" (solo sulla home) */
  compact?: boolean;
}

export default function Navbar({ className = "", compact = false }: NavbarProps) {
  const { authuser, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = authuser ? getMenuForRole(authuser.ruolo) : [];

  const handleLogout = () => {
    logout();
    router.push('/login');
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
          <Link href="/immobili" className="text-red-600 hover:underline font-medium">Immobili</Link>
          <Link href="/login">Accedi</Link>
        </div>
      )}
    </nav>
  );
}
