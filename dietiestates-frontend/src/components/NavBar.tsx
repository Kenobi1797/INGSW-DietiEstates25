"use client";

import Logo from "./Logo";
import Menu from "./Menu";
import { useUser } from "@/Context/Context";
import { getMenuForRole } from "@/Constants/NavbarLinks";
import Link from "next/link";

export default function Navbar({ className = "" }) {
  const { authuser } = useUser();

  // Otteniamo le voci di menu in base al ruolo
  const menuItems = authuser ? getMenuForRole(authuser.ruolo) : [];

  return (
    <nav className={`navbar ${className}`}>
     
      <Logo/>

     {authuser ? (
         <Menu items={menuItems} buttonLabel="Azioni" />
         ) : (
              <Link href="/Login">
                 Accedi
              </Link>
         )}
    </nav>
  );
}
