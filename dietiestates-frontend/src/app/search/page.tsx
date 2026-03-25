"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Barraricerca from "@/components/Barraricerca";
import ListaImmobili from "@/components/ListImmobili";
import { ImmobileS } from "@/Models/ImmobileS";

const EstateMap = dynamic(() => import("@/components/EstateMap"), { ssr: false });

const sampleImmobili: ImmobileS[] = [
  {
    id: 1001,
    idAgente: 1,
    titolo: "Attico panoramico in centro",
    descrizione: "Splendido attico ristrutturato con vista sul Duomo.",
    prezzo: 425000,
    dimensioni: 135,
    indirizzo: "Via Roma 12, Napoli",
    numeroStanze: 4,
    numeroBagni: 2,
    piano: 5,
    ascensore: true,
    balcone: true,
    terrazzo: true,
    giardino: false,
    postoAuto: false,
    cantina: true,
    portineria: false,
    climatizzazione: true,
    riscaldamento: "Centralizzato",
    classeEnergetica: "A",
    tipologia: "Vendita",
    latitudine: 40.8399,
    longitudine: 14.2500,
    fotoUrls: [
      "https://images.pexels.com/photos/248769/pexels-photo-248769.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    dataCreazione: new Date(),
    venduto: false,
    dataVendita: null,
    scuoleVicine: true,
    parchiVicini: false,
    trasportiPubbliciVicini: true,
    serviziVicinati: true
  },
  {
    id: 1002,
    idAgente: 2,
    titolo: "Appartamento con giardino privato",
    descrizione: "Luminoso appartamento con giardino esclusivo in zona residenziale.",
    prezzo: 265000,
    dimensioni: 90,
    indirizzo: "Via delle Gardenie 21, Caserta",
    numeroStanze: 3,
    numeroBagni: 1,
    piano: 1,
    ascensore: false,
    balcone: true,
    terrazzo: false,
    giardino: true,
    postoAuto: true,
    cantina: false,
    portineria: false,
    climatizzazione: false,
    riscaldamento: "Autonomo",
    classeEnergetica: "B",
    tipologia: "Vendita",
    latitudine: 41.0737,
    longitudine: 14.3349,
    fotoUrls: [
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    dataCreazione: new Date(),
    venduto: false,
    dataVendita: null,
    scuoleVicine: true,
    parchiVicini: true,
    trasportiPubbliciVicini: false,
    serviziVicinati: true
  }
];

export default function Search() {
  const searchParams = useSearchParams();
  const [immobili, setImmobili] = useState<ImmobileS[]>(sampleImmobili);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const address = searchParams.get("address") || "";

  useEffect(() => {
    async function fetchImmobili() {
      if (isNaN(lat) || isNaN(lon)) {
        setImmobili(sampleImmobili);
        setErrore("Nessuna posizione valida fornita: visualizzazione dati di prova.");
        return;
      }
      setLoading(true);
      setErrore(null);

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const query = new URLSearchParams({ lat: lat.toString(), lon: lon.toString(), citta: address, raggioKm: "20" });
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/search?${query.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error(`Errore ricerca immobili: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setImmobili(data);
        } else {
          setImmobili(sampleImmobili);
          setErrore("Nessun risultato reale trovato: visualizzazione dati di prova.");
        }
      } catch (err) {
        setErrore((err as Error).message || "Errore di ricerca");
        setImmobili(sampleImmobili);
      } finally {
        setLoading(false);
      }
    }

    fetchImmobili();
  }, [lat, lon, address]);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Ricerca Immobili</h1>
        <Barraricerca />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {errore && <div className="text-red-700 p-3 border border-red-200 rounded mb-4">{errore}</div>}
            <ListaImmobili immobili={immobili} loading={loading} />
          </div>
          <div className="lg:col-span-1">
            <EstateMap lat={isNaN(lat) ? 0 : lat} lon={isNaN(lon) ? 0 : lon} />
          </div>
        </div>
      </div>
    </div>
  );
}
