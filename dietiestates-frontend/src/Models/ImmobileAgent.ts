// @/Types/ImmobileAgente.ts
import { ImmobileS } from "./ImmobileS";

export interface ImmobileAgente extends ImmobileS {
  venduto: boolean;       
  dataVendita?: string;   
}