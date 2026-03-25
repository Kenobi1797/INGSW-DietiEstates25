"use client";

import Logo from "./Logo";
import Menu from "./Menu";
import { useUser } from "@/Context/Context";
import { getMenuForRole } from "@/Constants/NavbarLinks";
import Link from "next/link";

import { useRouter } from 'next/navigation';

export default function Navbar({ className = "" }) {
  const { authuser, logout } = useUser();
  const router = useRouter();

  // Otteniamo le voci di menu in base al ruolo
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
          <Menu items={menuItems} buttonLabel="Azioni" />
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/immobili" className="text-red-600 hover:underline font-medium">Immobili</Link>
          <Link href="/Login">Accedi</Link>
        </div>
      )}
    </nav>
  );
}
