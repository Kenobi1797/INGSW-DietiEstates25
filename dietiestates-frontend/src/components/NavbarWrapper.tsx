// components/NavbarWrapper.tsx
"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";
import { noNavbarPaths, trasparentPaths } from "@/Constants/PathNav";

export default function NavbarWrapper() {
  const pathname = usePathname()

  if (noNavbarPaths.includes(pathname)) return null

  const className = trasparentPaths.includes(pathname) ? "trasparente" : "default"
  // Sulla home mostra solo il bottone dropdown "Azioni"; altrove mostra i link in riga
  const compact = pathname === '/'

  return <Navbar className={className} compact={compact} />
}