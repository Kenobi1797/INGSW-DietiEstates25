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
     {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        className="bg-transparent px-4 py-2 rounded focus:outline-none"
        onClick={() => setIsOpen(prev => !prev)}
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <ul className="absolute right-0 top-full mt-1 bg-white border-2 border-black text-black w-44 shadow-lg rounded-md z-50">
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
