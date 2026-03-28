"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import Barraricerca from "@/components/Barraricerca";
import ListaImmobili from "@/components/ListImmobili";
import { ImmobileS } from "@/Models/ImmobileS";

const EstateMap = dynamic(() => import("@/components/EstateMap"), { ssr: false });

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [immobili, setImmobili] = useState<ImmobileS[]>([]);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  // Number(null) === 0, quindi controlliamo esplicitamente la presenza
  const rawLat = searchParams.get("lat");
  const rawLon = searchParams.get("lon");
  const lat = rawLat === null ? 0 : Number(rawLat);
  const lon = rawLon === null ? 0 : Number(rawLon);
  const address = searchParams.get("address") || "";

  // Centro mappa: coordinate esplicite → primo risultato → centro Italia
  const mapCenter = useMemo(() => {
    if (lat !== 0 && lon !== 0) return { lat, lon };
    if (immobili.length > 0) return { lat: immobili[0].latitudine, lon: immobili[0].longitudine };
    return { lat: 41.9028, lon: 12.4964 };
  }, [lat, lon, immobili]);

  useEffect(() => {
    async function fetchImmobili() {
      // Bug fix: Number(null)===0, quindi lat=0/lon=0 NON significa coordinate valide
      const hasCoords = lat !== 0 && lon !== 0 && !Number.isNaN(lat) && !Number.isNaN(lon);

      setLoading(true);
      setErrore(null);

      try {
        const token = typeof globalThis.window === "undefined" ? null : sessionStorage.getItem("token");
        const currentParams = new URLSearchParams(searchParamsKey);
        const query = new URLSearchParams();
        if (hasCoords) {
          query.set('lat', lat.toString());
          query.set('lon', lon.toString());
          query.set('raggioKm', currentParams.get('raggioKm') || '20');
        }
        if (address) query.set('address', address);

        // Se non ci sono filtri, mostriamo comunque una lista immobili
        query.set('limit', currentParams.get('limit') || '100');
        query.set('orderBy', currentParams.get('orderBy') || 'DataCreazione');
        query.set('orderDir', currentParams.get('orderDir') || 'DESC');

        const passThroughParams = [
          'tipologia', 'prezzoMin', 'prezzoMax', 'numeroStanzeMin', 'numeroStanzeMax', 'numeroBagni',
          'classeEnergetica', 'balcone', 'terrazzo', 'giardino', 'ascensore', 'postoAuto', 'cantina',
          'portineria', 'climatizzazione', 'scuoleVicine', 'parchiVicini', 'trasportiPubbliciVicini',
          'orderBy', 'orderDir', 'limit', 'offset'
        ];

        passThroughParams.forEach((key) => {
          const value = currentParams.get(key);
          if (value) query.set(key, value);
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/search?${query.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error(`Errore ricerca immobili: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setImmobili(data as ImmobileS[]);
          setErrore(null);
        } else {
          setImmobili([]);
          setErrore("Nessun immobile trovato con i filtri selezionati.");
        }
      } catch (err) {
        setErrore((err as Error).message || "Errore di ricerca");
        setImmobili([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImmobili();
  }, [lat, lon, address, searchParamsKey]);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Ricerca Immobili</h1>
        <Barraricerca />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {errore && <div className="text-red-700 p-3 border border-red-200 rounded mb-4">{errore}</div>}
            <ListaImmobili
              immobili={immobili}
              loading={loading}
              renderExtra={(immobile) => ({
                onClick: () => router.push(`/immobili/${immobile.id}`)
              })}
            />
          </div>
          <div className="lg:col-span-1">
            <EstateMap lat={mapCenter.lat} lon={mapCenter.lon} immobili={immobili} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Caricamento ricerca...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
