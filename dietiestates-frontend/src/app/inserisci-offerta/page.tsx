'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BaseButton from '@/components/BaseButton';
import { useUser } from '@/Context/Context';
import PrezzoInput from '@/components/PrezzoInput';

interface ImmobileItem {
  id: number;
  titolo: string;
  indirizzo: string;
}

export default function InserisciOffertaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 animate-pulse">Caricamento...</p></div>}>
      <InserisciOffertaContent />
    </Suspense>
  );
}

function InserisciOffertaContent() {
  const { authuser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlIdImmobile = searchParams.get('idImmobile');
  const [immobili, setImmobili] = useState<ImmobileItem[]>([]);
  const [idImmobile, setIdImmobile] = useState('');
  const [importo, setImporto] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingImmobili, setLoadingImmobili] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchImmobili = async () => {
      setLoadingImmobili(true);
      try {
        const token = sessionStorage.getItem('token');
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
        let defaultId = list.length > 0 ? String(list[0].id) : '';
        if (urlIdImmobile && list.some((i) => i.id === Number(urlIdImmobile))) {
          defaultId = urlIdImmobile;
        }
        setIdImmobile(defaultId);
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
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Token mancante');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          idImmobile: Number(idImmobile),
          prezzoOfferto: importo,
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
      const back = urlIdImmobile ? `/miei-immobili/${urlIdImmobile}/storico` : '/storico-offerte';
      router.push(back);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore durante l\'inserimento';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!authuser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Devi essere loggato per accedere a questa pagina.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
          Inserisci Offerta Manuale
        </h1>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loadingImmobili ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Caricamento immobili...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="select-immobile" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Immobile</label>
              <select
                id="select-immobile"
                value={idImmobile}
                onChange={(e) => setIdImmobile(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
              >
                {immobili.length === 0 ? (
                  <option value="">Nessun immobile disponibile</option>
                ) : (
                  immobili.map((immobile) => (
                    <option key={immobile.id} value={immobile.id}>
                      #{immobile.id} — {immobile.titolo} ({immobile.indirizzo})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="input-importo" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Importo offerta</label>
            <PrezzoInput
              id="input-importo"
              value={importo}
              onChange={(val) => setImporto(val)}
              placeholder="Es. 150.000"
              required
            />
          </div>

          <BaseButton
            type="submit"
            className="btn-primary"
            loading={loading}
            disabled={loading || loadingImmobili || !idImmobile || immobili.length === 0 || importo <= 0}
          >
            Inserisci Offerta
          </BaseButton>
        </form>
      </div>
    </div>
  );
}