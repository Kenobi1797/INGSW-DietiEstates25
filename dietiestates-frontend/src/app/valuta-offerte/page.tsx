'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/Context/Context';
import BaseButton from '@/components/BaseButton';

interface Offerta {
  id: number;
  idImmobile: number;
  idCliente: number;
  importo: number;
  dataOfferta: string;
  stato: 'Pendente' | 'Accettata' | 'Rifiutata';
}

export default function ValutaOffertePage() {
  const { authuser } = useUser();
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOfferte();
  }, []);

  const fetchOfferte = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token mancante');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/agente`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Errore nel caricamento offerte');

      const data = await response.json();
      setOfferte(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValuta = async (idOfferta: number, azione: 'accetta' | 'rifiuta') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/${idOfferta}/${azione}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Errore nella valutazione offerta');

      alert(`Offerta ${azione === 'accetta' ? 'accettata' : 'rifiutata'}!`);
      fetchOfferte(); // Ricarica
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
        <h1>Valuta Offerte</h1>
        {offerte.length === 0 ? (
          <p>Nessuna offerta da valutare.</p>
        ) : (
          <ul>
            {offerte.map((offerta) => (
              <li key={offerta.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <p>Immobile ID: {offerta.idImmobile}</p>
                <p>Importo: €{offerta.importo}</p>
                <p>Data: {new Date(offerta.dataOfferta).toLocaleDateString()}</p>
                <p>Stato: {offerta.stato}</p>
                {offerta.stato === 'Pendente' && (
                  <div>
                    <BaseButton onClick={() => handleValuta(offerta.id, 'accetta')} className="btn-primary">
                      Accetta
                    </BaseButton>
                    <BaseButton onClick={() => handleValuta(offerta.id, 'rifiuta')} className="btn-secondary">
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