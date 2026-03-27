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
  importance?: number;
  address?: {
    road?: string;
    pedestrian?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
}

export default function RicercaIndirizzo({ 
  onIndirizzoSelezionato, 
  soloIndirizziPrecisi = false,
  initialValue = '',
  onQueryChange
}: Readonly<RicercaIndirizzoProps>) {
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
        const normalizedQuery = `${query}, Italia`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(normalizedQuery)}&format=jsonv2&addressdetails=1&limit=8&countrycodes=it&dedupe=1&accept-language=it`,
          { headers: { 'Accept-Language': 'it' } }
        );
        const data = await res.json();
        const risultatiDto = Array.isArray(data) ? (data as NominatimResult[]) : [];
        let risultatiFiltrati = risultatiDto;

        if (soloIndirizziPrecisi) {
          risultatiFiltrati = risultatiDto.filter((r) => {
            const hasStreet = Boolean(r.address?.road || r.address?.pedestrian);
            const hasLocality = Boolean(r.address?.city || r.address?.town || r.address?.village || r.address?.municipality);
            return hasStreet && hasLocality;
          });
        }

        risultatiFiltrati = risultatiFiltrati.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));

        if (risultatiFiltrati.length === 0) {
          setErrore(soloIndirizziPrecisi
            ? 'Nessun risultato: prova a inserire via e città (es. Via Roma, Napoli)'
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

  const buildCleanAddress = (r: NominatimResult): string => {
    const addr = r.address;
    if (!addr) return r.display_name;
    const street = addr.road || addr.pedestrian || '';
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    if (street && city) return `${street}, ${city}`;
    return r.display_name;
  };

  const seleziona = (r: NominatimResult) => {
    const nomeVisualizzato = buildCleanAddress(r);
    setQuery(nomeVisualizzato);
    setRisultati([]);
    onIndirizzoSelezionato(Number.parseFloat(r.lat), Number.parseFloat(r.lon), nomeVisualizzato);
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
          {risultati.map((r) => (
            <li
              key={`${r.display_name}-${r.lat}-${r.lon}`}
              className="address-result-item"
            >
              <button
                type="button"
                onClick={() => seleziona(r)}
                className="w-full text-left"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}