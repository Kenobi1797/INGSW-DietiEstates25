import { UserRole } from "@/Types/Ruoli";


export interface MenuLink {
  label: string;
  path: string;
  roles: UserRole[];
}

export const navbarLinks: MenuLink[] = [

  {
    label: "Home",
    path: "/",
    roles: ["Cliente", "Agente", "Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Ricerca Immobile",
    path: "/search",
    roles: ["Cliente", "Agente", "Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: ["Cliente", "Agente", "Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Storico Offerte",
    path: "/storico-offerte",
    roles: ["Cliente"],
  },
  {
    label: "I Miei Immobili",
    path: "/miei-immobili",
    roles: ["Agente", "Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Gestione Agenzie",
    path: "/gestione-agenzie",
    roles: ["Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Profilo",
    path: "/profilo",
    roles: ["Cliente", "Agente", "Supporto", "AmministratoreAgenzia"],
  },
];


export function getMenuForRole(role: UserRole | null) {

  if (!role) return [];

  return navbarLinks.filter(link => link.roles?.includes(role));
}

