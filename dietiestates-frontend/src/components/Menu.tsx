"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuLink } from "@/Constants/NavbarLinks";

interface MenuProps {
  readonly items: MenuLink[];       // Voci da visualizzare
  readonly buttonLabel?: string;    // Testo del bottone (opzionale)
}

export default function Menu({ items, buttonLabel = "Menu" }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
     {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        className="inline-flex items-center gap-2 border border-red-200 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span>{buttonLabel}</span>
        <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <ul className="absolute right-0 top-full mt-2 bg-white border border-gray-200 text-black min-w-52 shadow-lg rounded-xl z-50 py-2">
          {items.map(item => (
            <li key={item.path} className="px-2 py-0">
              <Link
                href={item.path}
                className="block px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
