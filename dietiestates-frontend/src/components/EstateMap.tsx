'use client';
import { useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Home } from 'lucide-react';
import { ImmobileS } from '@/Models/ImmobileS';

const casettaIcon = L.divIcon({
  className: '',
  html: renderToStaticMarkup(
    <div style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
      <Home size={32} color="#E91E63" strokeWidth={2} />
    </div>
  ),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function AutoCenter({ lat, lon }: { lat: number, lon: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== 0 && lon !== 0) {
      map.flyTo([lat, lon], 12);
    }
  }, [lat, lon, map]);
  return null;
}

interface MapPreviewProps {
  lat?: number;
  lon?: number;
  immobili?: ImmobileS[];
}

export default function EstateMap({ lat = 0, lon = 0, immobili = [] }: MapPreviewProps) {
  const defaultPos: [number, number] = [41.9028, 12.4964];
  const safeLat = Number(lat);
  const safeLon = Number(lon);
  const hasCoords = Number.isFinite(safeLat) && Number.isFinite(safeLon) && safeLat !== 0 && safeLon !== 0;
  const center: [number, number] = hasCoords ? [safeLat, safeLon] : defaultPos;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300 shadow-inner">
      <MapContainer
        center={center}
        zoom={hasCoords ? 12 : 5}
        style={{ height: '440px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoCenter lat={lat || 0} lon={lon || 0} />
        {/* Marker centro ricerca solo quando non ci sono risultati da mostrare */}
        {hasCoords && immobili.length === 0 && (
          <Marker position={[safeLat, safeLon]} icon={casettaIcon} />
        )}
        {immobili
          .filter((immobile) => Number.isFinite(Number(immobile.latitudine)) && Number.isFinite(Number(immobile.longitudine)))
          .map((immobile) => (
            <Marker
              key={`immobile-map-${immobile.id}`}
              position={[Number(immobile.latitudine), Number(immobile.longitudine)]}
              icon={casettaIcon}
            >
              <Popup>
                <div style={{ minWidth: 150 }}>
                  <p style={{ fontWeight: 700, marginBottom: 2, fontSize: 13 }}>{immobile.titolo}</p>
                  <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
                    &euro; {immobile.prezzo?.toLocaleString('it-IT')}
                  </p>
                  <a
                    href={`/immobili/${immobile.id}`}
                    style={{ fontSize: 11, color: '#1d4ed8', textDecoration: 'underline' }}
                  >
                    Vedi dettagli &rarr;
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {!hasCoords && (
        <div className="bg-gray-50 p-2 text-center text-xs text-gray-500 uppercase tracking-widest font-semibold">
          Inserisci un indirizzo per vedere la mappa
        </div>
      )}
    </div>
  );
}