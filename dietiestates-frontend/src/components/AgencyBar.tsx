"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuLink } from "@/Constants/NavbarLinks";

interface AgencyBarProps {
  readonly items: MenuLink[];
}

export default function AgencyBar({ items }: AgencyBarProps) {
  const pathname = usePathname();

  // Se non ci sono item per il ruolo, non renderizziamo nulla
  if (!items || items.length === 0) return null;

  return (
    <nav className="w-full bg-white border-b-2 border-black py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
        {items.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                px-4 py-2 text-sm font-bold uppercase tracking-tight transition-all
                border-2 rounded-md
                ${isActive 
                  ? "bg-black text-white border-black" 
                  : "bg-transparent text-black border-transparent hover:border-black hover:bg-gray-50"
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}