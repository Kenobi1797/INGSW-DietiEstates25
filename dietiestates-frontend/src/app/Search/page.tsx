'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapSearch } from "@/components/MapsWrapper";
import Barraricerca from "@/components/Barraricerca";
import ListaImmobili from "@/components/ListImmobili";
import { ImmobileS } from '@/Models/ImmobileS';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [risultati, setRisultati] = useState<ImmobileS[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filtri = useMemo(() => ({
    lat: searchParams.get('lat'),
    lon: searchParams.get('lon'),
    type: searchParams.get('type') || 'vendita',
    address: searchParams.get('address') || '',
    prezzoMin: searchParams.get('prezzoMin') || '',
    prezzoMax: searchParams.get('prezzoMax') || '',
    stanzeMin: searchParams.get('stanzeMin') || '',
    stanzeMax: searchParams.get('stanzeMax') || '',
    bagni: searchParams.get('bagni') || '',
    classeEnergetica: searchParams.get('classeEnergetica') || '',
  }), [searchParams]);

  useEffect(() => {
    if (!filtri.lat || !filtri.lon) return;

    async function fetchDati() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/immobili/search', {
          method: 'POST',
          body: JSON.stringify({
            ...filtri,
            lat: parseFloat(filtri.lat!),
            lon: parseFloat(filtri.lon!),
          })
        });
        const data = await response.json();
        setRisultati(data);
      } catch (error) {
        console.error("Errore nel caricamento immobili:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDati();
  }, [filtri]);

  return (
    <div className="search-grid-container">
      <header className="area-barra">
        <Barraricerca />
      </header>

      <aside className="area-lista">
        <ListaImmobili immobili={risultati} loading={isLoading} />
      </aside>

      <main className="area-mappa">
        <MapSearch 
          center={filtri.lat && filtri.lon
            ? [parseFloat(filtri.lat), parseFloat(filtri.lon)]
            : [41.8719, 12.5674]
          } 
          immobili={risultati} 
        />
      </main>
    </div>
  );
}