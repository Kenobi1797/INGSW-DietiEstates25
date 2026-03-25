"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Barraricerca from "@/components/Barraricerca";
import ListaImmobili from "@/components/ListImmobili";
import EstateMap from "@/components/EstateMap";
import { ImmobileS } from "@/Models/ImmobileS";

export default function Search() {
  const searchParams = useSearchParams();
  const [immobili, setImmobili] = useState<ImmobileS[]>([]);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const address = searchParams.get("address") || "";

  useEffect(() => {
    async function fetchImmobili() {
      if (isNaN(lat) || isNaN(lon)) {
        setImmobili([]);
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
        setImmobili(data || []);
      } catch (err) {
        setErrore((err as Error).message || "Errore di ricerca");
        setImmobili([]);
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
