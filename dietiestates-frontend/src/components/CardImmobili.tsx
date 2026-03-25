import React from 'react';
import Image from 'next/image';
import { ImmobileS } from '@/Models/ImmobileS';

interface Props {
  immobile: ImmobileS;
  footer?: React.ReactNode; 
  onClick?: () => void;
}

export default function ImmobileCard({ immobile, footer, onClick }: Props) {
  return (
    <div 
      className={`card-immobileS ${onClick ? 'clickable' : ''}`} 
      onClick={onClick}
    >
      <div className="card-image-container">
        <Image
          src={immobile.fotoUrls && immobile.fotoUrls.length > 0 ? immobile.fotoUrls[0] : '/placeholder.jpg'}
          alt={immobile.titolo}
          width={400}
          height={240}
          className="card-image object-cover rounded-t-lg"
          unoptimized
        />
      </div>
      <div className="card-info-container">
        <div className="card-header">
          <span className="card-price">
            € {immobile.prezzo.toLocaleString('it-IT')}
          </span>
          <h3 className="card-title">{immobile.titolo}</h3>
        </div>
        <div className="card-stats">
          <div className="stat-item">
            <span className="stat-label">Mq</span>
            <span className="stat-value">{immobile.dimensioni}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Locali</span>
            <span className="stat-value">{immobile.numeroStanze}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Piano</span>
            <span className="stat-value">
              {immobile.piano === 0 ? 'T' : immobile.piano}
            </span>
          </div>
        </div>

        {/* Indicatori Geoapify */}
        <div className="card-indicators">
          {immobile.scuoleVicine && (
            <span className="indicator">🏫 Vicino a scuole</span>
          )}
          {immobile.parchiVicini && (
            <span className="indicator">🌳 Vicino a parchi</span>
          )}
          {immobile.trasportiPubbliciVicini && (
            <span className="indicator">🚇 Vicina a trasporto pubblico</span>
          )}
        </div>

        {footer && (
          <div 
            className="card-footer-actions" 
            onClick={(e) => e.stopPropagation()} 
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}