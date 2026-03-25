'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/Context/Context';
import BaseButton from '@/components/BaseButton';

interface Controfferta {
  id: number;
  idOffertaOriginale: number;
  importo: number;
  dataControfferta: string;
  stato: 'Pendente' | 'Accettata' | 'Rifiutata';
  titoloImmobile?: string;
}

export default function ControffertePage() {
  const { authuser } = useUser();
  const [controfferte, setControfferte] = useState<Controfferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchControfferte();
  }, []);

  const fetchControfferte = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token mancante');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/controfferte`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Errore nel caricamento controfferte');

      const data = await response.json();
      setControfferte(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValuta = async (idControfferta: number, azione: 'accetta' | 'rifiuta') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/controfferte/${idControfferta}/${azione}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Errore nella valutazione controfferta');

      alert(`Controfferta ${azione === 'accetta' ? 'accettata' : 'rifiutata'}!`);
      fetchControfferte();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!authuser) return <p>Devi essere loggato.</p>;
  if (loading) return <p>Caricamento...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="centerGrid">
      <div className="box">
        <h1>Controfferte</h1>
        {controfferte.length === 0 ? (
          <p>Nessuna controfferta ricevuta.</p>
        ) : (
          <ul>
            {controfferte.map((controfferta) => (
              <li key={controfferta.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <p>Immobile: {controfferta.titoloImmobile || `ID ${controfferta.idOffertaOriginale}`}</p>
                <p>Importo: €{controfferta.importo}</p>
                <p>Data: {new Date(controfferta.dataControfferta).toLocaleDateString()}</p>
                <p>Stato: {controfferta.stato}</p>
                {controfferta.stato === 'Pendente' && (
                  <div>
                    <BaseButton onClick={() => handleValuta(controfferta.id, 'accetta')} className="btn-primary">
                      Accetta
                    </BaseButton>
                    <BaseButton onClick={() => handleValuta(controfferta.id, 'rifiuta')} className="btn-secondary">
                      Rifiuta
                    </BaseButton>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}