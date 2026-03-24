// @/components/ListImmobili.tsx
import React from 'react';
import ImmobileCard from './CardImmobili';
import { ImmobileS } from '@/Models/ImmobileS';

interface Props {
  immobili: ImmobileS[];
  loading: boolean;
  renderExtra?: (immobile: ImmobileS) => {
    footer?: React.ReactNode;
    onClick?: () => void;
  };
}

export default function ListaImmobili({ immobili, loading, renderExtra }: Props) {

  if (loading) {
    return (
      <div className="lista-immobili-status">
        <p>Caricamento risultati...</p>
      </div>
    );
  }

  if (immobili.length === 0) {
    return (
      <div className="lista-immobili-status">
        <p>Nessun immobile trovato in questa zona.</p>
      </div>
    );
  }

  return (
    <div className="lista-immobili">
      {immobili.map((immobile) => {
        const extra = renderExtra?.(immobile);

        return (
          <ImmobileCard 
            key={immobile.id} 
            immobile={immobile}
            footer={extra?.footer}
            onClick={extra?.onClick}
          />
        );
      })}
    </div>
  );
}