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
  venduto: boolean;
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

  const selectedImmobile = immobili.find((immobile) => String(immobile.id) === idImmobile);
  const selectedImmobileVenduto = Boolean(selectedImmobile?.venduto);

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
          ? data.map((item: { id?: number | string; titolo?: string; indirizzo?: string; venduto?: boolean }) => ({
              id: Number(item.id),
              titolo: item.titolo || `Immobile ${item.id}`,
              indirizzo: item.indirizzo || 'Indirizzo non disponibile',
              venduto: Boolean(item.venduto),
            }))
          : [];

        setImmobili(list);
        const immobiliDisponibili = list.filter((immobile) => !immobile.venduto);

        let defaultId = immobiliDisponibili.length > 0 ? String(immobiliDisponibili[0].id) : '';
        if (urlIdImmobile && list.some((i) => i.id === Number(urlIdImmobile) && !i.venduto)) {
          defaultId = urlIdImmobile;
        }

        if (urlIdImmobile && list.some((i) => i.id === Number(urlIdImmobile) && i.venduto)) {
          setError('L\'immobile selezionato risulta venduto: non puoi inserire offerte manuali.');
        }

        if (immobiliDisponibili.length === 0) {
          setError('Non hai immobili disponibili: quelli venduti non accettano offerte manuali.');
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
  }, [urlIdImmobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Token mancante');
      if (selectedImmobileVenduto) throw new Error('Impossibile inserire un\'offerta manuale su un immobile venduto.');

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
      const back = idImmobile ? `/miei-immobili/${idImmobile}/storico` : '/storico-offerte';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 dark:bg-white">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-200 dark:bg-white">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-900">
          Inserisci Offerta Manuale
        </h1>

        {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-300 dark:bg-red-50 dark:text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {loadingImmobili ? (
              <p className="text-sm text-gray-500 dark:text-gray-500">Caricamento immobili...</p>
          ) : (
            <div className="flex flex-col gap-1">
                <label htmlFor="select-immobile" className="text-xs font-semibold text-gray-700 dark:text-gray-700">Immobile</label>
              <select
                id="select-immobile"
                value={idImmobile}
                onChange={(e) => setIdImmobile(e.target.value)}
                required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-red-500 dark:border-gray-300 dark:bg-white dark:text-gray-900 dark:focus:border-red-500"
              >
                {immobili.length === 0 ? (
                  <option value="">Nessun immobile disponibile</option>
                ) : (
                  immobili.map((immobile) => (
                    <option key={immobile.id} value={immobile.id} disabled={immobile.venduto}>
                      #{immobile.id} - {immobile.titolo} ({immobile.indirizzo}){immobile.venduto ? ' - VENDUTO' : ''}
                    </option>
                  ))
                )}
              </select>
              {selectedImmobileVenduto && (
                  <p className="text-xs text-amber-700 dark:text-amber-700">
                  L&apos;immobile selezionato e venduto: scegli un immobile disponibile.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="input-importo" className="text-xs font-semibold text-gray-700 dark:text-gray-700">Importo offerta</label>
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
            disabled={loading || loadingImmobili || !idImmobile || immobili.length === 0 || importo <= 0 || selectedImmobileVenduto}
          >
            Inserisci Offerta
          </BaseButton>
        </form>
      </div>
    </div>
  );
}