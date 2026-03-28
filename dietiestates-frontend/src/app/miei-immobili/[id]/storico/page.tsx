'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Undo2, Inbox } from 'lucide-react';
import { formatDateIt, formatEuro, STATO_CONFIG, StatoOfferta } from '@/Constants/offerte';
import { fetchOfferteByImmobile } from '@/Services/offerteService';

interface Offerta {
  idOfferta: number;
  idImmobile: number;
  idUtente: number;
  prezzoOfferto: number;
  stato: StatoOfferta;
  dataOfferta: string;
  offertaManuale?: boolean;
  idOffertaOriginale?: number | null;
  titolo?: string;
  indirizzo?: string;
  nomeUtente?: string;
}

export default function StoricoImmobilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [titoloImmobile, setTitoloImmobile] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    async function fetchStorico() {
      try {
        const list = await fetchOfferteByImmobile<Offerta>(id);
        setOfferte(list);
        if (list.length > 0 && list[0].titolo) setTitoloImmobile(list[0].titolo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento storico');
      } finally {
        setLoading(false);
      }
    }
    fetchStorico();
  }, [id]);

  const byStato: Partial<Record<StatoOfferta, Offerta[]>> = {};
  for (const o of offerte) {
    if (!byStato[o.stato]) byStato[o.stato] = [];
    byStato[o.stato].push(o);
  }
  const statoOrder = ['InAttesa', 'Accettata', 'Controproposta', 'Rifiutata', 'Ritirata'];

  let offerteContent: React.ReactNode;
  if (loading) {
    offerteContent = (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    );
  } else if (offerte.length === 0) {
    offerteContent = (
      <div className="text-center py-20">
        <div className="flex justify-center mb-4 text-gray-300"><Inbox size={60} /></div>
        <p className="text-gray-400 text-lg">Nessuna offerta per questo immobile.</p>
      </div>
    );
  } else {
    offerteContent = (
      <div className="space-y-6">
        {/* Contatore riassuntivo */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {statoOrder.filter(s => byStato[s]?.length > 0).map(s => {
            const cfg = STATO_CONFIG[s];
            return (
              <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.classes}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                {cfg.label}: {byStato[s].length}
              </span>
            );
          })}
        </div>

        {/* Lista offerte raggruppata per stato */}
        {statoOrder.map(stato => {
          const gruppo = byStato[stato];
          if (!gruppo || gruppo.length === 0) return null;
          const cfg = STATO_CONFIG[stato];
          return (
            <div key={stato}>
              <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full inline-block ${cfg.dot}`}></span>
                {cfg.label}
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">{gruppo.length}</span>
              </h2>
              <div className="space-y-2">
                {gruppo.map(offerta => {
                  const isControfferta = !!offerta.idOffertaOriginale;
                  return (
                    <div
                      key={offerta.idOfferta}
                      style={{
                        backgroundColor: '#fff',
                        border: `1.5px solid ${isControfferta ? '#bfdbfe' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          {/* Badge tipo */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            {isControfferta ? (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200 inline-flex items-center gap-1">
                                <Undo2 size={10} /> Controfferta
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold border border-gray-200 inline-flex items-center gap-1">
                                <MessageSquare size={10} /> Offerta cliente
                              </span>
                            )}
                            {offerta.offertaManuale && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold border border-purple-200">Manuale</span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#374151' }}>
                            {offerta.nomeUtente ? (
                              <span>Da: <strong>{offerta.nomeUtente}</strong></span>
                            ) : (
                              <span>Utente #{offerta.idUtente}</span>
                            )}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                            {formatDateIt(offerta.dataOfferta)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2563eb' }}>
                            € {formatEuro(offerta.prezzoOfferto)}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Link valuta offerte se ci sono pendenti */}
        {byStato['InAttesa']?.length > 0 && (
          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <Link
              href={`/miei-immobili/${id}/valuta`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#16a34a', color: '#fff',
                padding: '10px 20px', borderRadius: '10px',
                fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
              }}
            >
              Vai a valuta offerte ({byStato['InAttesa'].length} in attesa) →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/miei-immobili')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.85rem', marginBottom: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={15} /> Torna ai miei immobili
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Storico Offerte</h1>
          {titoloImmobile && (
            <p className="text-gray-500 text-sm mt-1">
              Immobile: <span className="font-semibold text-gray-700">{titoloImmobile}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}

        {offerteContent}
      </div>
    </div>
  );
}
