'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/Context/Context';

interface Offerta {
  idOfferta: number;
  idImmobile: number;
  idUtente: number;
  prezzoOfferto: number;
  stato: string;
  dataOfferta: string;
  offertaManuale?: boolean;
  idOffertaOriginale?: number | null;
  titolo?: string;
  indirizzo?: string;
}

export default function StoricoOffertePage() {
  const { authuser } = useUser();
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStorico();
  }, []);

  const fetchStorico = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token mancante');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/utente`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Errore nel caricamento storico');

      const data = await response.json();
      setOfferte(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authuser) return <p>Devi essere loggato.</p>;
  if (loading) return <p>Caricamento...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="centerGrid">
      <div className="box">
        <h1>Storico Offerte</h1>
        {offerte.length === 0 ? (
          <p>Nessuna offerta nello storico.</p>
        ) : (
          <ul>
            {offerte.map((offerta) => (
              <li key={offerta.idOfferta} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <p>Immobile: {offerta.titolo || `ID ${offerta.idImmobile}`}</p>
                <p>Indirizzo: {offerta.indirizzo || 'N/A'}</p>
                <p>Importo: €{offerta.prezzoOfferto?.toLocaleString()}</p>
                <p>Data: {new Date(offerta.dataOfferta).toLocaleDateString('it-IT')}</p>
                <p>Stato: {offerta.stato}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}