export interface OffertaDTO {
  idOfferta: number;
  idImmobile: number;
  idUtente: number;
  prezzoOfferto: number;
  stato: "InAttesa" | "Accettata" | "Rifiutata" | "Controproposta" | "Ritirata";
  dataOfferta: Date;
  offertaManuale: boolean;
  idOffertaOriginale?: number | null;
}
