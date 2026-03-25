'use client';

import { useState, useEffect, useRef } from 'react';

interface RicercaIndirizzoProps {
  onIndirizzoSelezionato: (lat: number, lon: number, indirizzo: string) => void;
  soloIndirizziPrecisi?: boolean;
  initialValue?: string;
  onQueryChange?: (value: string) => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    pedestrian?: string;
    house_number?: string;
  };
}

export default function RicercaIndirizzo({ 
  onIndirizzoSelezionato, 
  soloIndirizziPrecisi = false,
  initialValue = '',
  onQueryChange
}: RicercaIndirizzoProps) {
  const [query, setQuery] = useState(initialValue);
  const [risultati, setRisultati] = useState<NominatimResult[]>([]);
  const [errore, setErrore] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setRisultati([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      const clearTimer = setTimeout(() => {
        setRisultati([]);
        setErrore('');
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    const timer = setTimeout(async () => {
      setErrore('');
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=it`,
          { headers: { 'Accept-Language': 'it' } }
        );
        const data = await res.json();
        const risultatiDto = data as NominatimResult[];
        let risultatiFiltrati = risultatiDto;

        if (soloIndirizziPrecisi) {
          risultatiFiltrati = risultatiDto.filter((r) =>
            r.address?.road || r.address?.pedestrian || r.address?.house_number
          );
        }

        if (risultatiFiltrati.length === 0) {
          setErrore(soloIndirizziPrecisi
            ? 'Inserisci un indirizzo specifico'
            : 'Nessun risultato trovato'
          );
        } else {
          setRisultati(risultatiFiltrati);
        }
      } catch {
        setErrore('Errore durante la ricerca. Riprova.');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, soloIndirizziPrecisi]);

  const seleziona = (r: NominatimResult) => {
    const nomeVisualizzato = r.display_name;
    setQuery(nomeVisualizzato);
    setRisultati([]);
    onIndirizzoSelezionato(parseFloat(r.lat), parseFloat(r.lon), nomeVisualizzato);
  };

  return (
    <div className="address-search-container" ref={containerRef}>
      <input
        className="search-input-reset"
        type="text"
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          onQueryChange?.(value);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
        placeholder={soloIndirizziPrecisi ? "Via, Numero, Città" : "Cerca città o indirizzo..."}
      />

      {errore && <p className="address-error-msg">{errore}</p>}

      {risultati.length > 0 && (
        <ul className="address-results-list" style={{ position: 'absolute', zIndex: 1000, background: 'white', width: '100%' }}>
          {risultati.map((r, i) => (
            <li
              key={i}
              className="address-result-item"
              onClick={() => seleziona(r)}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}