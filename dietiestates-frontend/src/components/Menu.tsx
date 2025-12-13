"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuLink } from "@/Constants/NavbarLinks";

interface MenuProps {
  items: MenuLink[];       // Voci da visualizzare
  buttonLabel?: string;    // Testo del bottone (opzionale)
}

export default function Menu({ items, buttonLabel = "Menu" }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bottone che apre/chiude il menu */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none"
        onClick={() => setIsOpen(prev => !prev)}
      >
        {buttonLabel}
      </button>

      {/* Lista menu */}
      {isOpen && (
        <ul className="absolute right-0 top-full mt-1 bg-white border border-gray-300 w-44 shadow-lg rounded-md z-50">
          {items.map(item => (
            <li
              key={item.path}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Link href={item.path}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
