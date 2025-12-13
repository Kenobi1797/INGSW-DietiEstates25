"use client";

import Logo from "./Logo";
import Menu from "./Menu";
import { useContext } from "react";
import { UserContext } from "@/Context/Context";
import { getMenuForRole } from "@/Constants/NavbarLinks";

export default function Navbar() {
  const { activeRole } = useContext(UserContext);

  // Otteniamo le voci di menu in base al ruolo
  const menuItems = getMenuForRole(activeRole);

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-300 bg-white">
     
      <Logo color="black" />

     
      <Menu items={menuItems} buttonLabel="Azioni" />
    </nav>
  );
}
