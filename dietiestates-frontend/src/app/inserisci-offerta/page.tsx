'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from '@/components/BaseButton';
import { useUser } from '@/Context/Context';

interface ImmobileItem {
  id: number;
  titolo: string;
  indirizzo: string;
}

export default function InserisciOffertaPage() {
  const { authuser } = useUser();
  const router = useRouter();
  const [immobili, setImmobili] = useState<ImmobileItem[]>([]);
  const [idImmobile, setIdImmobile] = useState('');
  const [importo, setImporto] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingImmobili, setLoadingImmobili] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchImmobili = async () => {
      setLoadingImmobili(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/miei`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Impossibile caricare gli immobili');
        }

        const data = await response.json();
        const list = Array.isArray(data)
          ? data.map((item: { id?: number | string; titolo?: string; indirizzo?: string }) => ({
              id: Number(item.id),
              titolo: item.titolo || `Immobile ${item.id}`,
              indirizzo: item.indirizzo || 'Indirizzo non disponibile',
            }))
          : [];

        setImmobili(list);
        if (list.length > 0) {
          setIdImmobile(String(list[0].id));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Errore caricamento immobili';
        setError(message);
      } finally {
        setLoadingImmobili(false);
      }
    };

    fetchImmobili();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token mancante');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          idImmobile: Number(idImmobile),
          prezzoOfferto: Number(importo),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let message = 'Errore nell\'inserimento offerta';
        try {
          const data = JSON.parse(text);
          message = data.error || message;
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }

      alert('Offerta inserita con successo!');
      router.push('/storico-offerte');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore durante l\'inserimento';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!authuser) {
    return <p>Devi essere loggato per accedere a questa pagina.</p>;
  }

  return (
    <div className="centerGrid">
      <div className="box">
        <h1>Inserisci Offerta Manuale</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit} className="form">
          {loadingImmobili ? (
            <p>Caricamento immobili...</p>
          ) : (
            <select value={idImmobile} onChange={(e) => setIdImmobile(e.target.value)} required>
              {immobili.length === 0 ? (
                <option value="">Nessun immobile disponibile</option>
              ) : (
                immobili.map((immobile) => (
                  <option key={immobile.id} value={immobile.id}>
                    #{immobile.id} - {immobile.titolo} ({immobile.indirizzo})
                  </option>
                ))
              )}
            </select>
          )}
          <input
            type="number"
            step="0.01"
            placeholder="Importo (€)"
            value={importo}
            onChange={(e) => setImporto(e.target.value)}
            required
          />
          <BaseButton
            type="submit"
            className="btn-primary"
            loading={loading}
            disabled={loading || loadingImmobili || !idImmobile || immobili.length === 0}
          >
            Inserisci Offerta
          </BaseButton>
        </form>
      </div>
    </div>
  );
}