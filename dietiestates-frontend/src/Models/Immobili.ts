import { tipologiaI } from "@/Types/Tipologia";
import { classeEner } from "@/Types/ClasseEnergetica";

export interface Immobile {
  titolo: string;
  descrizione: string;
  prezzo: number;
  tipologia: tipologiaI;
  classeEnergetica: classeEner;
  dimensioni: number;
  numeroStanze: number;
  numeroBagni: number;
  piano: number;
  riscaldamento: string;
  ascensore: boolean;
  balcone: boolean;
  terrazzo: boolean;
  giardino: boolean;
  postoAuto: boolean;
  climatizzazione: boolean;
  cantina: boolean
  portineria: boolean
  indirizzo: string;
  latitudine: number;
  longitudine: number;
  fotoUrls : string[];
}