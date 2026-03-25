'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RicercaIndirizzo from '@/components/SearchInd';
import FiltriAvanzati from './Filtri';
import { AvanzatiFilterState } from './Filtri';

export interface StatoRicerca {
  contratto: 'vendita' | 'affitto';
  posizione: { lat: number; lon: number; indirizzo: string } | null;
  indirizzoTestuale: string;
  filtri: AvanzatiFilterState;
}

export default function Barraricerca() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFiltri, setShowFiltri] = useState(false);

  const [ricerca, setRicerca] = useState<StatoRicerca>(() => ({
    contratto: (searchParams.get('type') as 'vendita' | 'affitto') || 'vendita',
    posizione: searchParams.get('lat') ? {
      lat: Number(searchParams.get('lat')),
      lon: Number(searchParams.get('lon')),
      indirizzo: searchParams.get('address') || '',
    } : null,
    indirizzoTestuale: searchParams.get('address') || '',
    filtri: {
      prezzoMin: searchParams.get('prezzoMin') || '',
      prezzoMax: searchParams.get('prezzoMax') || '',
      stanzeMin: searchParams.get('numeroStanzeMin') || '',
      stanzeMax: searchParams.get('numeroStanzeMax') || '',
      bagni: searchParams.get('numeroBagni') || '',
      classeEnergetica: (searchParams.get('classeEnergetica') as AvanzatiFilterState['classeEnergetica']) || '',
    }
  }));

  const hasAddressText = ricerca.indirizzoTestuale.trim().length >= 1;
  const isSearchDisabled = false;

  const updateRicerca = (key: keyof StatoRicerca, value: StatoRicerca[keyof StatoRicerca]) => {
    setRicerca(prev => ({ ...prev, [key]: value }));
    // Non aggiorniamo l'URL qui  solo al click di "Cerca"
  };

  const handleCerca = () => {
    const params = new URLSearchParams();
    params.set('type', ricerca.contratto);
    params.set('tipologia', ricerca.contratto === 'vendita' ? 'Vendita' : 'Affitto');

    if (ricerca.posizione) {
      params.set('lat', ricerca.posizione.lat.toString());
      params.set('lon', ricerca.posizione.lon.toString());
      params.set('address', ricerca.posizione.indirizzo);
    } else if (hasAddressText) {
      params.set('address', ricerca.indirizzoTestuale.trim());
    }

    const filtri = ricerca.filtri;
    if (filtri.prezzoMin) params.set('prezzoMin', filtri.prezzoMin);
    if (filtri.prezzoMax) params.set('prezzoMax', filtri.prezzoMax);
    if (filtri.stanzeMin) params.set('numeroStanzeMin', filtri.stanzeMin);
    if (filtri.stanzeMax) params.set('numeroStanzeMax', filtri.stanzeMax);
    if (filtri.bagni) params.set('numeroBagni', filtri.bagni);
    if (filtri.classeEnergetica) params.set('classeEnergetica', filtri.classeEnergetica);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="search-bar-inner">

      <div className="search-address-wrapper">
        <RicercaIndirizzo 
          initialValue={ricerca.indirizzoTestuale} 
          soloIndirizziPrecisi={false}
          onIndirizzoSelezionato={(lat, lon, ind) => 
            setRicerca(prev => ({ ...prev, posizione: { lat, lon, indirizzo: ind }, indirizzoTestuale: ind }))
          }
          onQueryChange={(value) => {
            setRicerca(prev => ({
              ...prev,
              indirizzoTestuale: value,
              posizione: prev.posizione && prev.posizione.indirizzo === value ? prev.posizione : null,
            }));
          }}
        />
      </div>

      <span className="search-divider">|</span>
        <select 
        className="search-input-reset"
        value={ricerca.contratto}
        onChange={(e) => updateRicerca('contratto', e.target.value as 'vendita' | 'affitto')}
      >
        <option value="vendita">Vendita</option>
        <option value="affitto">Affitto</option>
      </select>

      <span className="search-divider">|</span>

      <div style={{ position: 'relative' }}>
        <button 
          className="search-input-reset"
          style={{ fontWeight: 500 }}
          onClick={(e) => { e.stopPropagation(); setShowFiltri(!showFiltri); }}
        >
          Filtri {Object.values(ricerca.filtri).some(v => v !== '') && '●'}
        </button>

        {showFiltri && (
          <FiltriAvanzati 
            currentFiltri={ricerca.filtri} 
            onFiltriChange={(f) => {
              updateRicerca('filtri', f);
              setShowFiltri(false);
            }} 
            onClose={() => setShowFiltri(false)} 
          />
        )}
      </div>

      <button 
        className="btn-cerca-main" 
        onClick={handleCerca}
        disabled={isSearchDisabled}
        style={{
          opacity: isSearchDisabled ? 0.6 : 1,
          cursor: isSearchDisabled ? 'not-allowed' : 'pointer'
        }}
      >
        Cerca
      </button>
    </div>
  );
}