'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/Context/Context';
import Link from 'next/link';
import PrezzoInput from '@/components/PrezzoInput';

type StatoOfferta = 'InAttesa' | 'Accettata' | 'Rifiutata' | 'Controproposta' | 'Ritirata';

interface Offerta {
  idOfferta: number;
  idImmobile: number;
  idUtente: number;
  prezzoOfferto: number;
  dataOfferta: string;
  stato: StatoOfferta;
  titolo?: string;
  indirizzo?: string;
}

const STATO_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  InAttesa:       { label: 'In Attesa',      classes: 'bg-yellow-50 border-yellow-300 text-yellow-800', dot: 'bg-yellow-400' },
  Accettata:      { label: 'Accettata',      classes: 'bg-green-50 border-green-300 text-green-800',   dot: 'bg-green-500' },
  Rifiutata:      { label: 'Rifiutata',      classes: 'bg-red-50 border-red-300 text-red-700',         dot: 'bg-red-500' },
  Controproposta: { label: 'Controproposta', classes: 'bg-blue-50 border-blue-300 text-blue-800',      dot: 'bg-blue-500' },
  Ritirata:       { label: 'Ritirata',       classes: 'bg-gray-50 border-gray-200 text-gray-500',      dot: 'bg-gray-400' },
};

export default function ValutaOffertePage() {
  const { authuser } = useUser();
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Per ogni offerta aperta al form controproposta, tiene l'importo digitato
  const [contropropostaForms, setContropropostaForms] = useState<Record<number, number>>({});
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => { fetchOfferte(); }, []);

  const fetchOfferte = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token mancante');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/agente`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Errore nel caricamento offerte');
      const data = await response.json();
      setOfferte(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento offerte');
    } finally {
      setLoading(false);
    }
  };

  const toggleContropropostaForm = (idOfferta: number) => {
    setContropropostaForms(prev => {
      const next = { ...prev };
      if (next[idOfferta] !== undefined) {
        delete next[idOfferta];
      } else {
        next[idOfferta] = 0;
      }
      return next;
    });
  };

  const handleValuta = async (idOfferta: number, azione: 'Accettata' | 'Rifiutata' | 'Controproposta') => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Token mancante'); return; }

    const body: { nuovoStato: string; prezzoControproposta?: number } = { nuovoStato: azione };

    if (azione === 'Controproposta') {
      const importo = contropropostaForms[idOfferta];
      if (!importo || importo <= 0) {
        setError('Inserisci un importo valido per la controproposta');
        return;
      }
      body.prezzoControproposta = importo;
    }

    setActionLoadingId(idOfferta);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/${idOfferta}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Errore nella valutazione offerta');
      }
      // Chiudi il form controproposta se aperto
      setContropropostaForms(prev => { const n = { ...prev }; delete n[idOfferta]; return n; });
      await fetchOfferte();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante la valutazione');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!authuser) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Devi essere loggato per accedere a questa sezione.</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">Caricamento offerte...</p>
    </div>
  );

  const pendenti = offerte.filter(o => o.stato === 'InAttesa');
  const storiche = offerte.filter(o => o.stato !== 'InAttesa');

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Valuta Offerte</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestisci le offerte ricevute sugli immobili della tua agenzia
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
            <button onClick={() => setError('')} className="ml-2 font-bold">✕</button>
          </div>
        )}

        {offerte.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400 text-lg">Nessuna offerta ricevuta.</p>
          </div>
        )}

        {/* Offerte in attesa */}
        {pendenti.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
              Da valutare
              <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-300">
                {pendenti.length}
              </span>
            </h2>
            <div className="space-y-3">
              {pendenti.map((offerta) => (
                <div key={offerta.idOfferta}
                  className="rounded-xl border-2 border-yellow-300 bg-yellow-50/40 p-4">

                  <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {offerta.titolo || `Immobile #${offerta.idImmobile}`}
                      </p>
                      {offerta.indirizzo && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">📍 {offerta.indirizzo}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(offerta.dataOfferta).toLocaleDateString('it-IT', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-red-600">
                        € {offerta.prezzoOfferto?.toLocaleString('it-IT')}
                      </p>
                      <Link href={`/immobili/${offerta.idImmobile}`}
                        className="text-xs text-red-600 hover:underline font-medium">
                        Vedi immobile →
                      </Link>
                    </div>
                  </div>

                  {/* Azioni */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-yellow-200">
                    <button
                      onClick={() => handleValuta(offerta.idOfferta, 'Accettata')}
                      disabled={actionLoadingId === offerta.idOfferta}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                      ✓ Accetta
                    </button>
                    <button
                      onClick={() => handleValuta(offerta.idOfferta, 'Rifiutata')}
                      disabled={actionLoadingId === offerta.idOfferta}
                      className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                      ✗ Rifiuta
                    </button>
                    <button
                      onClick={() => toggleContropropostaForm(offerta.idOfferta)}
                      disabled={actionLoadingId === offerta.idOfferta}
                      className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-1.5 rounded-lg font-semibold transition-colors border border-blue-300 disabled:opacity-50">
                      ↩ Controproposta
                    </button>
                  </div>

                  {/* Form controproposta inline (no window.prompt) */}
                  {contropropostaForms[offerta.idOfferta] !== undefined && (
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Importo controproposta:</p>
                      <div className="flex gap-2 flex-wrap">
                        <PrezzoInput
                          value={contropropostaForms[offerta.idOfferta] ?? 0}
                          onChange={(val) => setContropropostaForms(prev => ({
                            ...prev, [offerta.idOfferta]: val
                          }))}
                          placeholder="Es. 180.000"
                          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 outline-none"
                        />
                        <button
                          onClick={() => handleValuta(offerta.idOfferta, 'Controproposta')}
                          disabled={actionLoadingId === offerta.idOfferta || !contropropostaForms[offerta.idOfferta]}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                          {actionLoadingId === offerta.idOfferta ? 'Invio...' : 'Invia'}
                        </button>
                        <button
                          onClick={() => toggleContropropostaForm(offerta.idOfferta)}
                          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                          Annulla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storico */}
        {storiche.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
              Storico
              <span className="ml-1 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-300">
                {storiche.length}
              </span>
            </h2>
            <div className="space-y-3">
              {storiche.map((offerta) => {
                const statoInfo = STATO_CONFIG[offerta.stato] ?? { label: offerta.stato, classes: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' };
                return (
                  <div key={offerta.idOfferta}
                    className="rounded-xl border-2 border-gray-200 bg-white opacity-80 p-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {offerta.titolo || `Immobile #${offerta.idImmobile}`}
                        </p>
                        {offerta.indirizzo && (
                          <p className="text-sm text-gray-500 mt-0.5 truncate">📍 {offerta.indirizzo}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(offerta.dataOfferta).toLocaleDateString('it-IT', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-lg font-bold text-red-600">
                          € {offerta.prezzoOfferto?.toLocaleString('it-IT')}
                        </p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statoInfo.classes}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statoInfo.dot}`}></span>
                          {statoInfo.label}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <Link href={`/immobili/${offerta.idImmobile}`}
                        className="text-xs text-red-600 hover:underline font-medium">
                        Vedi immobile →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}