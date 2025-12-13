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
    path: "/newestate",
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
    label: "Crea Agente",
    path: "/crea-agente",
    roles: ["Supporto", "AmministratoreAgenzia"],
  },
  {
    label: "Crea Supporto",
    path: "/crea-supporto",
    roles: ["AmministratoreAgenzia"],
  },
];


export function getMenuForRole(role: UserRole | null) {

  if (!role) {
    return navbarLinks.filter(link => link.roles === null);
  }

 
  return navbarLinks.filter(link => link.roles?.includes(role));
}

