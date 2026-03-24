// @/components/MapSearch.tsx
'use client';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ImmobileS } from '@/Models/ImmobileS';

const createCasettaIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker-icon",
    html: `
      <svg width="32" height="32" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4))">
        <path 
          d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" 
          fill="${color}" 
          stroke="white" 
          stroke-width="1.5"
        />
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);
  return null;
}

interface EstateMapProps {
  immobili: ImmobileS[];
  center: [number, number]; 
  onSelectImmobile?: (immobile: ImmobileS) => void;
}

export default function EstateMap({ immobili, center, onSelectImmobile }: EstateMapProps) {

  const mapPosition: [number, number] = center || [41.9028, 12.4964];

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <MapContainer
        center={mapPosition}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      
        <RecenterMap position={mapPosition} />

        {immobili.map((immobile) => {
          const markerColor = immobile.tipologia === 'Vendita' ? '#E91E63' : '#2196F3';
          
          return (
            <Marker
              key={immobile.id}
              position={[immobile.latitudine, immobile.longitudine]}
              icon={createCasettaIcon(markerColor)}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <h3 className="font-bold text-gray-900 leading-tight">{immobile.titolo}</h3>
                  <p className="text-blue-600 font-bold mt-1">€ {immobile.prezzo.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{immobile.dimensioni}mq • {immobile.numeroStanze} stanze</p>
                  
                  {onSelectImmobile && (
                    <button
                      className="w-full mt-2 py-1 px-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded"
                      onClick={() => onSelectImmobile(immobile)}
                    >
                      Vedi Dettagli
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}