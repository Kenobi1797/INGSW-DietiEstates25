"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  readonly id: number;
  readonly isVenduto: boolean;
}

export default function AgentActions({ id, isVenduto }: Props){
  
const router = useRouter();

  const handleAction = (e: React.MouseEvent, type: 'offerta manuale' | 'valuta offerte' | 'storico') => {
    e.stopPropagation();

    switch (type) {
    case 'offerta manuale': {
      globalThis.prompt("Inserisci l'importo dell'offerta manuale:");
      if (isVenduto) {
      // chiamata da fare
      return; 
    }
      break;
    }

    case 'valuta offerte':
      router.push(`/dashboard/valuta/${id}`);
      break;

    case 'storico':
      router.push(`/dashboard/storico/${id}`);
      break;
  }
  };

  return (
    <div className="container-azioni-agente"> 

      <button 
        onClick={(e) => handleAction(e, 'offerta manuale')}
        disabled={isVenduto}
      >
        Manuale
      </button>
      <button 
        onClick={(e) => handleAction(e, 'valuta offerte')}
        disabled={isVenduto}
      >
        Valuta
      </button>

      <button onClick={(e) => handleAction(e, 'storico')}>
        Storico
      </button>
    </div>
  );
}