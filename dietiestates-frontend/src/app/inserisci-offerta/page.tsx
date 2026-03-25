'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from '@/components/BaseButton';
import { useUser } from '@/Context/Context';

export default function InserisciOffertaPage() {
  const { authuser } = useUser();
  const router = useRouter();
  const [idImmobile, setIdImmobile] = useState('');
  const [importo, setImporto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token mancante');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/manuale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          idImmobile: parseInt(idImmobile),
          importo: parseFloat(importo),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore nell\'inserimento offerta');
      }

      alert('Offerta inserita con successo!');
      router.push('/storico-offerte');
    } catch (err: any) {
      setError(err.message);
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
          <input
            type="number"
            placeholder="ID Immobile"
            value={idImmobile}
            onChange={(e) => setIdImmobile(e.target.value)}
            required
          />
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
            disabled={loading}
          >
            Inserisci Offerta
          </BaseButton>
        </form>
      </div>
    </div>
  );
}