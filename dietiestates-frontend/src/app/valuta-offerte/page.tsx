'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/Context/Context';
import BaseButton from '@/components/BaseButton';
import Link from 'next/link';

interface Offerta {
  idOfferta: number;
  idImmobile: number;
  idUtente: number;
  prezzoOfferto: number;
  dataOfferta: string;
  stato: 'InAttesa' | 'Accettata' | 'Rifiutata' | 'Controproposta' | 'Ritirata';
  titolo?: string;
  indirizzo?: string;
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento offerte');
    } finally {
      setLoading(false);
    }
  };

  const handleValuta = async (idOfferta: number, azione: 'Accettata' | 'Rifiutata' | 'Controproposta') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token mancante');

      const body: { nuovoStato: 'Accettata' | 'Rifiutata' | 'Controproposta'; prezzoControproposta?: number } = {
        nuovoStato: azione,
      };

      if (azione === 'Controproposta') {
        const valore = window.prompt("Inserisci importo controproposta:");
        const parsed = Number(valore);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error('Importo controproposta non valido');
        }
        body.prezzoControproposta = parsed;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/${idOfferta}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Errore nella valutazione offerta');

      alert(`Offerta aggiornata: ${azione}`);
      fetchOfferte(); // Ricarica
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Errore durante la valutazione');
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
              <li key={offerta.idOfferta} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <p>Immobile: {offerta.titolo || `ID ${offerta.idImmobile}`}</p>
                <p>Indirizzo: {offerta.indirizzo || 'N/A'}</p>
                <p>Importo: €{offerta.prezzoOfferto?.toLocaleString('it-IT')}</p>
                <p>Data: {new Date(offerta.dataOfferta).toLocaleDateString()}</p>
                <p>Stato: {offerta.stato}</p>
                <p>
                  <Link href={`/immobili/${offerta.idImmobile}`} className="underline text-red-600">
                    Apri scheda immobile
                  </Link>
                </p>
                {offerta.stato === 'InAttesa' && (
                  <div>
                    <BaseButton onClick={() => handleValuta(offerta.idOfferta, 'Accettata')} className="btn-primary">
                      Accetta
                    </BaseButton>
                    <BaseButton onClick={() => handleValuta(offerta.idOfferta, 'Rifiutata')} className="btn-secondary">
                      Rifiuta
                    </BaseButton>
                    <BaseButton onClick={() => handleValuta(offerta.idOfferta, 'Controproposta')} className="btn-default">
                      Controproposta
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