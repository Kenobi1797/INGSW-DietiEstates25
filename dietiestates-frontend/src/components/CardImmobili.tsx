import React from 'react';
import { School, Trees, TrainFront } from 'lucide-react';
import { ImmobileS } from '@/Models/ImmobileS';

interface Props {
  immobile: ImmobileS;
  footer?: React.ReactNode; 
  onClick?: () => void;
}

export default function ImmobileCard({ immobile, footer, onClick }: Props) {
  const imgSrc = immobile.fotoUrls && immobile.fotoUrls.length > 0
    ? immobile.fotoUrls[0]
    : '/placeholder.svg';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {/* Immagine */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={immobile.titolo}
        style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block', flexShrink: 0 }}
      />

      {/* Info */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>

        {/* Prezzo e titolo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb', lineHeight: 1.2 }}>
            € {immobile.prezzo.toLocaleString('it-IT')}
          </span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
            {immobile.titolo}
          </h3>
        </div>

        {/* Statistiche */}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af' }}>Mq</span>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{immobile.dimensioni}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af' }}>Locali</span>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{immobile.numeroStanze}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af' }}>Piano</span>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{immobile.piano === 0 ? 'T' : immobile.piano}</span>
          </div>
        </div>

        {/* Indicatori Geoapify */}
        {(immobile.scuoleVicine || immobile.parchiVicini || immobile.trasportiPubbliciVicini) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {immobile.scuoleVicine && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                <School size={12} />Vicino a scuole
              </span>
            )}
            {immobile.parchiVicini && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                <Trees size={12} />Vicino a parchi
              </span>
            )}
            {immobile.trasportiPubbliciVicini && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                <TrainFront size={12} />Vicino a trasporto pubblico
              </span>
            )}
          </div>
        )}

        {footer && (
          <div onClick={(e) => e.stopPropagation()}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}