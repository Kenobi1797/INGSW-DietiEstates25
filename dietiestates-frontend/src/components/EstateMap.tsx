'use client';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const casettaIcon = L.divIcon({
  className: '',
  html: `
    <svg width="32" height="32" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4))">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#E91E63" stroke="white" stroke-width="1.5" />
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function AutoCenter({ lat, lon }: { lat: number, lon: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== 0 && lon !== 0) {
      map.flyTo([lat, lon], 16);
    }
  }, [lat, lon, map]);
  return null;
}

interface MapPreviewProps {
  lat: number;
  lon: number;
}

export default function EstateMap({ lat, lon }: MapPreviewProps) {
  const defaultPos: [number, number] = [41.9028, 12.4964];
  const hasCoords = lat !== 0 && lon !== 0;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300 shadow-inner">
      <MapContainer
        center={hasCoords ? [lat, lon] : defaultPos}
        zoom={hasCoords ? 16 : 5}
        style={{ height: '300px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoCenter lat={lat} lon={lon} />
        {hasCoords && <Marker position={[lat, lon]} icon={casettaIcon} />}
      </MapContainer>

      {!hasCoords && (
        <div className="bg-gray-50 p-2 text-center text-xs text-gray-500 uppercase tracking-widest font-semibold">
          Inserisci un indirizzo per vedere la mappa
        </div>
      )}
    </div>
  );
}