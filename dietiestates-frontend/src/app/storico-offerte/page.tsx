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
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    fetchStorico();
  }, []);

  const fetchStorico = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOfferte([]);
        setInfoMessage('Sessione non valida. Effettua di nuovo il login.');
        setError('');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/utente`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        setOfferte([]);
        setInfoMessage('Sessione scaduta. Effettua di nuovo il login.');
        setError('');
        return;
      }

      if (response.status === 403) {
        setOfferte([]);
        setInfoMessage('Lo storico offerte e disponibile solo per gli utenti Cliente.');
        setError('');
        return;
      }

      if (response.status === 404) {
        setOfferte([]);
        setInfoMessage('Nessuna offerta presente nello storico.');
        setError('');
        return;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Errore nel caricamento storico');
      }

      const data = await response.json();
      const offerteList: Offerta[] = Array.isArray(data) ? data : [];
      setOfferte(offerteList);
      if (offerteList.length === 0) {
        setInfoMessage('Nessuna offerta presente nello storico.');
      } else {
        setInfoMessage('');
      }
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore nel caricamento storico';
      setError(message);
      setInfoMessage('');
    } finally {
      setLoading(false);
    }
  };

  if (!authuser) return <p>Devi essere loggato.</p>;
  if (loading) return <p>Caricamento...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (authuser.ruolo !== 'Cliente') {
    return (
      <div className="centerGrid">
        <div className="box">
          <h1>Storico Offerte</h1>
          <p>Questa sezione e disponibile solo per account Cliente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="centerGrid">
      <div className="box">
        <h1>Storico Offerte</h1>
        {offerte.length === 0 ? (
          <p>{infoMessage || 'Nessuna offerta nello storico.'}</p>
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