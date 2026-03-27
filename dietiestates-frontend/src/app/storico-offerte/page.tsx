'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/Context/Context';
import Link from 'next/link';
import { MapPin, MessageSquare, Undo2, Inbox } from 'lucide-react';

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

const STATO_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  InAttesa:       { label: 'In Attesa',       classes: 'bg-yellow-50 border-yellow-300 text-yellow-800',  dot: 'bg-yellow-400' },
  Accettata:      { label: 'Accettata',       classes: 'bg-green-50 border-green-300 text-green-800',    dot: 'bg-green-500' },
  Rifiutata:      { label: 'Rifiutata',       classes: 'bg-red-50 border-red-300 text-red-700',          dot: 'bg-red-500' },
  Controproposta: { label: 'Controproposta',  classes: 'bg-blue-50 border-blue-300 text-blue-800',       dot: 'bg-blue-500' },
  Ritirata:       { label: 'Ritirata',        classes: 'bg-gray-50 border-gray-200 text-gray-500',       dot: 'bg-gray-400' },
};

export default function StoricoOffertePage() {
  const { authuser } = useUser();
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => { fetchStorico(); }, []);

  const fetchStorico = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) { setInfoMessage('Sessione non valida. Effettua di nuovo il login.'); return; }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/storico`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) { setInfoMessage('Sessione scaduta. Effettua di nuovo il login.'); return; }
      if (response.status === 404) { setOfferte([]); setInfoMessage('Nessuna offerta presente nello storico.'); return; }
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Errore nel caricamento storico');
      }

      const data = await response.json();
      const list: Offerta[] = Array.isArray(data) ? data : [];
      setOfferte(list);
      setInfoMessage(list.length === 0 ? 'Nessuna offerta presente nello storico.' : '');
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento storico');
    } finally {
      setLoading(false);
    }
  };

  if (!authuser) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Devi essere loggato per accedere a questa sezione.</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">Caricamento storico offerte...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">{error}</p>
    </div>
  );

  const pendingControfferte = offerte.filter(o => o.idOffertaOriginale && o.stato === 'InAttesa');
  const groupedByImmobile = offerte.reduce<Record<number, Offerta[]>>((acc, offerta) => {
    const key = offerta.idImmobile;
    if (!acc[key]) acc[key] = [];
    acc[key].push(offerta);
    return acc;
  }, {});
  const orderedImmobili = Object.entries(groupedByImmobile).sort(([, a], [, b]) => {
    const dateA = new Date(a[0]?.dataOfferta ?? 0).getTime();
    const dateB = new Date(b[0]?.dataOfferta ?? 0).getTime();
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Storico Offerte</h1>
            <p className="text-gray-500 text-sm mt-1">
              {offerte.length > 0 ? `${offerte.length} offerta/e trovata/e` : 'Nessuna offerta'}
            </p>
          </div>
          {pendingControfferte.length > 0 && authuser.ruolo === 'Cliente' && (
            <Link href="/controfferte"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
              <Undo2 size={15} /> {pendingControfferte.length} controfferta/e da valutare →
            </Link>
          )}
        </div>

        {/* Info / empty state */}
        {infoMessage && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {infoMessage}
          </div>
        )}

        {offerte.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4 text-gray-300"><Inbox size={60} /></div>
            <p className="text-gray-400 text-lg">Nessuna offerta nello storico.</p>
            <Link href="/immobili" className="mt-4 inline-block text-red-600 hover:underline text-sm font-medium">
              Sfoglia gli immobili →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orderedImmobili.map(([idImmobile, offerteImmobile]) => (
              <section key={idImmobile} className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 truncate">
                      {offerteImmobile[0]?.titolo || `Immobile #${idImmobile}`}
                    </p>
                    {offerteImmobile[0]?.indirizzo && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate inline-flex items-center gap-1"><MapPin size={12} />{offerteImmobile[0].indirizzo}</p>
                    )}
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-2.5 py-1 font-semibold">
                    {offerteImmobile.length} offerta/e
                  </span>
                </div>

                <div className="space-y-3">
                  {offerteImmobile.map((offerta) => {
                    const statoInfo = STATO_CONFIG[offerta.stato] ?? { label: offerta.stato, classes: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' };
                    const isControfferta = !!offerta.idOffertaOriginale;

                    return (
                      <div key={offerta.idOfferta}
                        className={`rounded-xl border-2 p-4 transition-shadow hover:shadow-sm ${
                          isControfferta ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'
                        }`}>

                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              {isControfferta ? (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200 inline-flex items-center gap-1">
                                  <Undo2 size={11} /> Controfferta ricevuta
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-semibold border border-gray-200 inline-flex items-center gap-1">
                                  <MessageSquare size={11} /> Offerta inviata
                                </span>
                              )}
                              {offerta.offertaManuale && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">
                                  Manuale
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-xl font-bold text-red-600">
                              € {offerta.prezzoOfferto?.toLocaleString('it-IT')}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(offerta.dataOfferta).toLocaleDateString('it-IT', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statoInfo.classes}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statoInfo.dot}`}></span>
                            {statoInfo.label}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/immobili/${offerta.idImmobile}`}
                              className="text-xs text-red-600 hover:underline font-medium">
                              Vedi immobile →
                            </Link>

                            {isControfferta && offerta.stato === 'InAttesa' && authuser.ruolo === 'Cliente' && (
                              <Link href="/controfferte"
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full font-semibold transition-colors">
                                Rispondi →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}