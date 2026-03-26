'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/Context/Context';
import Link from 'next/link';
import { MapPin, Check, X, Inbox, Undo2 } from 'lucide-react';

interface Controfferta {
  idOfferta: number;
  idImmobile: number;
  idUtente: number;
  prezzoOfferto: number;
  stato: string;
  dataOfferta: string;
  idOffertaOriginale: number;
  titolo?: string;
  indirizzo?: string;
}

const STATO_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  InAttesa:  { label: 'In Attesa',  classes: 'bg-yellow-50 border-yellow-300 text-yellow-800', dot: 'bg-yellow-400' },
  Accettata: { label: 'Accettata',  classes: 'bg-green-50 border-green-300 text-green-800',   dot: 'bg-green-500' },
  Rifiutata: { label: 'Rifiutata',  classes: 'bg-red-50 border-red-300 text-red-700',         dot: 'bg-red-500' },
};

export default function ControffertePage() {
  const { authuser } = useUser();
  const [controfferte, setControfferte] = useState<Controfferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingId, setRespondingId] = useState<number | null>(null);

  useEffect(() => { fetchControfferte(); }, []);

  const fetchControfferte = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token mancante');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/controfferte`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Errore nel caricamento controfferte');
      const data = await response.json();
      setControfferte(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento controfferte');
    } finally {
      setLoading(false);
    }
  };

  const handleRispondi = async (idOfferta: number, risposta: 'Accettata' | 'Rifiutata') => {
    const label = risposta === 'Accettata' ? 'accettare' : 'rifiutare';
    if (!confirm(`Vuoi ${label} questa controfferta?`)) return;

    setRespondingId(idOfferta);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/${idOfferta}/rispondi`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ risposta }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Errore nella risposta alla controfferta');
      }
      await fetchControfferte();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore nella risposta');
    } finally {
      setRespondingId(null);
    }
  };

  if (!authuser) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Devi essere loggato per accedere a questa sezione.</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">Caricamento controfferte...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">{error}</p>
    </div>
  );

  const pendenti = controfferte.filter(c => c.stato === 'InAttesa');
  const storico = controfferte.filter(c => c.stato !== 'InAttesa');

  const renderCard = (c: Controfferta) => {
    const statoInfo = STATO_CONFIG[c.stato] ?? { label: c.stato, classes: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' };
    const isPending = c.stato === 'InAttesa';

    return (
      <div key={c.idOfferta}
        className={`rounded-xl border-2 p-4 transition-shadow hover:shadow-sm ${
          isPending ? 'border-blue-300 bg-blue-50/40' : 'border-gray-200 bg-white opacity-80'
        }`}>

        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200 mb-1.5 inline-flex items-center gap-1">
              <Undo2 size={11} /> Controfferta ricevuta dall&apos;agente
            </span>
            <p className="font-semibold text-gray-900 truncate">
              {c.titolo || `Immobile #${c.idImmobile}`}
            </p>
            {c.indirizzo && (
              <p className="text-sm text-gray-500 mt-0.5 truncate inline-flex items-center gap-1"><MapPin size={12} />{c.indirizzo}</p>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-red-600">
              € {c.prezzoOfferto?.toLocaleString('it-IT')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(c.dataOfferta).toLocaleDateString('it-IT', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-gray-100">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statoInfo.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statoInfo.dot}`}></span>
            {statoInfo.label}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/immobili/${c.idImmobile}`}
              className="text-xs text-red-600 hover:underline font-medium">
              Vedi immobile →
            </Link>

            {isPending && (
              <>
                <button
                  onClick={() => handleRispondi(c.idOfferta, 'Accettata')}
                  disabled={respondingId === c.idOfferta}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1.5">
                  {respondingId === c.idOfferta ? '...' : <><Check size={12} strokeWidth={3} /> Accetta</>}
                </button>
                <button
                  onClick={() => handleRispondi(c.idOfferta, 'Rifiutata')}
                  disabled={respondingId === c.idOfferta}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1.5">
                  {respondingId === c.idOfferta ? '...' : <><X size={12} strokeWidth={3} /> Rifiuta</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controfferte</h1>
            <p className="text-gray-500 text-sm mt-1">Proposte di prezzo ricevute dagli agenti immobiliari</p>
          </div>
          <Link href="/storico-offerte"
            className="text-sm text-red-600 hover:underline font-medium">
            ← Storico offerte
          </Link>
        </div>

        {/* Empty state */}
        {controfferte.length === 0 && (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4 text-gray-300"><Inbox size={60} /></div>
            <p className="text-gray-400 text-lg">Nessuna controfferta ricevuta.</p>
          </div>
        )}

        {/* Da valutare */}
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
              {pendenti.map(renderCard)}
            </div>
          </div>
        )}

        {/* Storico risposte */}
        {storico.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
              Storico risposte
              <span className="ml-1 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-300">
                {storico.length}
              </span>
            </h2>
            <div className="space-y-3">
              {storico.map(renderCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}