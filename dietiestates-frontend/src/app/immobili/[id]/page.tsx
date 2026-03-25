"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type ImmobileDettaglio = {
  id: number;
  titolo: string;
  descrizione?: string;
  prezzo: number;
  tipologia: string;
  classeEnergetica?: string;
  dimensioni?: number | null;
  numeroStanze?: number | null;
  numeroBagni?: number | null;
  piano?: number | null;
  riscaldamento?: string;
  ascensore: boolean;
  balcone: boolean;
  terrazzo: boolean;
  giardino: boolean;
  postoAuto: boolean;
  climatizzazione: boolean;
  cantina: boolean;
  portineria: boolean;
  indirizzo: string;
  latitudine: number;
  longitudine: number;
  fotoUrls: string[];
  scuoleVicine: boolean;
  parchiVicini: boolean;
  trasportiPubbliciVicini: boolean;
};

export default function ImmobileDettaglioPage() {
  const params = useParams<{ id: string }>();
  const [immobile, setImmobile] = useState<ImmobileDettaglio | null>(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    async function loadDettaglio() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token mancante");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Immobile non trovato");
        const data = await response.json();
        setImmobile(data);
      } catch (err) {
        setErrore(err instanceof Error ? err.message : "Errore nel caricamento");
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      loadDettaglio();
    }
  }, [params?.id]);

  if (loading) return <p className="p-6">Caricamento...</p>;
  if (errore) return <p className="p-6 text-red-600">{errore}</p>;
  if (!immobile) return <p className="p-6">Immobile non disponibile.</p>;

  const immagini = immobile.fotoUrls && immobile.fotoUrls.length > 0 ? immobile.fotoUrls : ["/placeholder.svg"];

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">{immobile.titolo}</h1>
      <p className="text-gray-700 mb-6">{immobile.indirizzo}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {immagini.map((url, index) => (
          <div key={`${immobile.id}-img-${index}`} className="rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={url}
              alt={`${immobile.titolo} - foto ${index + 1}`}
              width={900}
              height={500}
              className="w-full h-[280px] object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <p><strong>Prezzo:</strong> € {immobile.prezzo.toLocaleString("it-IT")}</p>
        <p><strong>Tipologia:</strong> {immobile.tipologia}</p>
        <p><strong>Classe energetica:</strong> {immobile.classeEnergetica || "N/D"}</p>
        <p><strong>Dimensioni:</strong> {immobile.dimensioni ?? "N/D"} mq</p>
        <p><strong>Stanze:</strong> {immobile.numeroStanze ?? "N/D"}</p>
        <p><strong>Bagni:</strong> {immobile.numeroBagni ?? "N/D"}</p>
        <p><strong>Piano:</strong> {immobile.piano ?? "N/D"}</p>
        <p><strong>Riscaldamento:</strong> {immobile.riscaldamento || "N/D"}</p>
      </section>

      <section className="mt-6 text-sm">
        <h2 className="text-lg font-semibold mb-2">Servizi e Dotazioni</h2>
        <p>Ascensore: {immobile.ascensore ? "Si" : "No"}</p>
        <p>Balcone: {immobile.balcone ? "Si" : "No"}</p>
        <p>Terrazzo: {immobile.terrazzo ? "Si" : "No"}</p>
        <p>Giardino: {immobile.giardino ? "Si" : "No"}</p>
        <p>Posto auto: {immobile.postoAuto ? "Si" : "No"}</p>
        <p>Cantina: {immobile.cantina ? "Si" : "No"}</p>
        <p>Portineria: {immobile.portineria ? "Si" : "No"}</p>
        <p>Climatizzazione: {immobile.climatizzazione ? "Si" : "No"}</p>
      </section>

      <section className="mt-6 text-sm">
        <h2 className="text-lg font-semibold mb-2">Punti di Interesse</h2>
        <p>Vicino a scuole: {immobile.scuoleVicine ? "Si" : "No"}</p>
        <p>Vicino a parchi: {immobile.parchiVicini ? "Si" : "No"}</p>
        <p>Vicino a trasporto pubblico: {immobile.trasportiPubbliciVicini ? "Si" : "No"}</p>
      </section>

      {immobile.descrizione && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Descrizione</h2>
          <p className="text-gray-800">{immobile.descrizione}</p>
        </section>
      )}
    </main>
  );
}
