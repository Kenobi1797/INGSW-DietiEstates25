import React from 'react';
import { School, Trees, TrainFront, MapPin } from 'lucide-react';
import { ImmobileS } from '@/Models/ImmobileS';

interface Props {
  readonly immobile: ImmobileS;
  readonly footer?: React.ReactNode;
  readonly onClick?: () => void;
}

export default function ImmobileCard({ immobile, footer, onClick }: Props) {
  const imgSrc = immobile.fotoUrls && immobile.fotoUrls.length > 0
    ? immobile.fotoUrls[0]
    : '/placeholder.svg';

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      style={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {/* Immagine */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={immobile.titolo}
        style={{ width: '160px', flexShrink: 0, objectFit: 'cover', alignSelf: 'stretch', display: 'block' }}
      />

      {/* Info */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          {/* Titolo + prezzo */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', margin: 0 }}>{immobile.titolo}</p>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={12} />{immobile.indirizzo}
              </p>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2563eb', whiteSpace: 'nowrap' }}>
              € {immobile.prezzo.toLocaleString('it-IT')}
            </span>
          </div>

          {/* Statistiche */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.78rem', color: '#4b5563' }}>
            <span>{immobile.dimensioni} m²</span>
            <span>{immobile.numeroStanze} locali</span>
            <span>Piano {immobile.piano === 0 ? 'T' : immobile.piano}</span>
            <span>{immobile.numeroBagni} {immobile.numeroBagni === 1 ? 'bagno' : 'bagni'}</span>
          </div>

          {/* Indicatori Geoapify */}
          {(immobile.scuoleVicine || immobile.parchiVicini || immobile.trasportiPubbliciVicini) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
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
        </div>

        {footer && (
          <div role="presentation" onClick={(e) => e.stopPropagation()}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}