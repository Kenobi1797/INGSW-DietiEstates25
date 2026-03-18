import { UserRole } from "@/Types/Ruoli";


export interface MenuLink {
  label: string;
  path: string;
  roles: UserRole[]; // solo chi può vedere la voce
}

export const navbarLinks: MenuLink[] = [
  // Link visibili a tutti
  {
    label: "Home",
    path: "/",
    roles: ["Cliente"],
  },
  {
    label: "Ricerca Immobile",
    path: "/search",
    roles: ["Cliente"],
  },
  {
    label: "Storico Offerte",
    path: "/storico-offerte",
    roles: ["Cliente", "Agente", "Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Controfferte",
    path: "/controfferte",
    roles: ["Cliente"],
  },
  {
    label: "Aggiungi Immobile",
    path: "/aggiungi-immobile",
    roles: ["Agente", "Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Valuta Offerte",
    path: "/valuta-offerte",
    roles: ["Agente", "Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Inserisci Offerta Manuale",
    path: "/inserisci-offerta",
    roles: ["Agente", "Supporto", "AmministratoreAgenzia"],
  },
  {
  label: "Crea Staff",
  path: "/crea-staff",
  roles: ["Supporto", "AmministratoreAgenzia"],
},
];


export function getMenuForRole(role: UserRole | null) {

  if (!role) return [];

  return navbarLinks.filter(link => link.roles?.includes(role));
}

