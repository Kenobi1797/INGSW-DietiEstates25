'use client';

import { useState, useEffect, useRef } from 'react';

interface RicercaIndirizzoProps {
  onIndirizzoSelezionato: (lat: number, lon: number, indirizzo: string) => void;
  soloIndirizziPrecisi?: boolean;
  initialValue?: string;
}

export default function RicercaIndirizzo({ 
  onIndirizzoSelezionato, 
  soloIndirizziPrecisi = false,
  initialValue = ''
}: RicercaIndirizzoProps) {
  const [query, setQuery] = useState(initialValue);
  const [risultati, setRisultati] = useState<any[]>([]);
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
      setRisultati([]);
      setErrore('');
      return;
    }

    const timer = setTimeout(async () => {
      setErrore('');
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=it`,
          { headers: { 'Accept-Language': 'it' } }
        );
        const data = await res.json();
        let risultatiFiltrati = data;

        if (soloIndirizziPrecisi) {
          risultatiFiltrati = data.filter((r: any) =>
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
      } catch (err) {
        setErrore('Errore durante la ricerca. Riprova.');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, soloIndirizziPrecisi]);

  const seleziona = (r: any) => {
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
        onChange={(e) => setQuery(e.target.value)}
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