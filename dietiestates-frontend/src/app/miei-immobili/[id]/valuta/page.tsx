'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PrezzoInput from '@/components/PrezzoInput';
import { ArrowLeft, Check, X, Undo2, Inbox, MapPin } from 'lucide-react';

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
  nomeUtente?: string;
}

const STATO_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  InAttesa:       { label: 'In Attesa',      classes: 'bg-yellow-50 border-yellow-300 text-yellow-800', dot: 'bg-yellow-400' },
  Accettata:      { label: 'Accettata',      classes: 'bg-green-50 border-green-300 text-green-800',   dot: 'bg-green-500' },
  Rifiutata:      { label: 'Rifiutata',      classes: 'bg-red-50 border-red-300 text-red-700',         dot: 'bg-red-500' },
  Controproposta: { label: 'Controproposta', classes: 'bg-blue-50 border-blue-300 text-blue-800',      dot: 'bg-blue-500' },
  Ritirata:       { label: 'Ritirata',       classes: 'bg-gray-50 border-gray-200 text-gray-500',      dot: 'bg-gray-400' },
};

export default function ValutaImmobilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [titoloImmobile, setTitoloImmobile] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contropropostaForms, setContropropostaForms] = useState<Record<number, number>>({});
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchOfferte();
  }, [id]);

  async function fetchOfferte() {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) { setError('Sessione non valida.'); return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/immobile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Errore nel caricamento offerte');
      const data = await res.json();
      const list: Offerta[] = Array.isArray(data) ? data : [];
      setOfferte(list);
      if (list.length > 0 && list[0].titolo) setTitoloImmobile(list[0].titolo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setLoading(false);
    }
  }

  const toggleContropropostaForm = (idOfferta: number) => {
    setContropropostaForms(prev => {
      const next = { ...prev };
      if (next[idOfferta] === undefined) next[idOfferta] = 0;
      else delete next[idOfferta];
      return next;
    });
  };

  const handleValuta = async (idOfferta: number, azione: 'Accettata' | 'Rifiutata' | 'Controproposta') => {
    const token = sessionStorage.getItem('token');
    if (!token) { setError('Token mancante'); return; }

    const body: { nuovoStato: string; prezzoControproposta?: number } = { nuovoStato: azione };
    if (azione === 'Controproposta') {
      const importo = contropropostaForms[idOfferta];
      if (!importo || importo <= 0) { setError('Inserisci un importo valido per la controproposta'); return; }
      body.prezzoControproposta = importo;
    }

    setActionLoadingId(idOfferta);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/${idOfferta}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Errore nella valutazione');
      }
      setContropropostaForms(prev => { const n = { ...prev }; delete n[idOfferta]; return n; });
      await fetchOfferte();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la valutazione');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendenti = offerte.filter(o => o.stato === 'InAttesa');
  const storiche = offerte.filter(o => o.stato !== 'InAttesa');

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Valuta Offerte</h1>
              {titoloImmobile && (
                <p className="text-gray-500 text-sm mt-1">
                  Immobile: <span className="font-semibold text-gray-700">{titoloImmobile}</span>
                </p>
              )}
            </div>
            <Link
              href={`/miei-immobili/${id}/storico`}
              style={{ fontSize: '0.82rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
            >
              Vedi storico completo →
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
            <button onClick={() => setError('')} style={{ marginLeft: '8px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Offerte in attesa */}
            {pendenti.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-4 text-gray-300"><Inbox size={56} /></div>
                <p className="text-gray-400 text-lg">Nessuna offerta da valutare.</p>
                {storiche.length > 0 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Ci sono {storiche.length} offerte nello{' '}
                    <Link href={`/miei-immobili/${id}/storico`} style={{ color: '#2563eb' }}>storico</Link>.
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
                  {' '}Da valutare{' '}
                  <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-300">
                    {pendenti.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {pendenti.map(offerta => (
                    <div
                      key={offerta.idOfferta}
                      style={{ backgroundColor: '#fefce8', border: '1.5px solid #fde047', borderRadius: '12px', padding: '16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                            {offerta.nomeUtente ? offerta.nomeUtente : `Utente #${offerta.idUtente}`}
                          </p>
                          {offerta.indirizzo && (
                            <p style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <MapPin size={11} />{offerta.indirizzo}
                            </p>
                          )}
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                            {new Date(offerta.dataOfferta).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#2563eb', alignSelf: 'flex-start' }}>
                          € {offerta.prezzoOfferto?.toLocaleString('it-IT')}
                        </p>
                      </div>

                      {/* Azioni */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #fde68a', paddingTop: '12px' }}>
                        <button
                          onClick={() => handleValuta(offerta.idOfferta, 'Accettata')}
                          disabled={actionLoadingId === offerta.idOfferta}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: actionLoadingId === offerta.idOfferta ? 0.5 : 1 }}
                        >
                          <Check size={14} strokeWidth={3} /> Accetta
                        </button>
                        <button
                          onClick={() => handleValuta(offerta.idOfferta, 'Rifiutata')}
                          disabled={actionLoadingId === offerta.idOfferta}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: actionLoadingId === offerta.idOfferta ? 0.5 : 1 }}
                        >
                          <X size={14} strokeWidth={3} /> Rifiuta
                        </button>
                        <button
                          onClick={() => toggleContropropostaForm(offerta.idOfferta)}
                          disabled={actionLoadingId === offerta.idOfferta}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #93c5fd', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: actionLoadingId === offerta.idOfferta ? 0.5 : 1 }}
                        >
                          <Undo2 size={14} /> Controproposta
                        </button>
                      </div>

                      {/* Form controproposta inline */}
                      {contropropostaForms[offerta.idOfferta] !== undefined && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #fde68a' }}>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Importo controproposta:</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <PrezzoInput
                              value={contropropostaForms[offerta.idOfferta] ?? 0}
                              onChange={(val) => setContropropostaForms(prev => ({ ...prev, [offerta.idOfferta]: val }))}
                              placeholder="Es. 180.000"
                              className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 outline-none"
                            />
                            <button
                              onClick={() => handleValuta(offerta.idOfferta, 'Controproposta')}
                              disabled={actionLoadingId === offerta.idOfferta || !contropropostaForms[offerta.idOfferta]}
                              style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: (!contropropostaForms[offerta.idOfferta] || actionLoadingId === offerta.idOfferta) ? 0.5 : 1 }}
                            >
                              {actionLoadingId === offerta.idOfferta ? 'Invio...' : 'Invia'}
                            </button>
                            <button
                              onClick={() => toggleContropropostaForm(offerta.idOfferta)}
                              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#6b7280', fontSize: '0.82rem', cursor: 'pointer' }}
                            >
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

            {/* Storico offerte chiuse (compatte) */}
            {storiche.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
                  {' '}Già gestite{' '}
                  <span className="ml-1 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-300">{storiche.length}</span>
                </h2>
                <div className="space-y-2">
                  {storiche.map(offerta => {
                    const cfg = STATO_CONFIG[offerta.stato] ?? STATO_CONFIG['Ritirata'];
                    return (
                      <div
                        key={offerta.idOfferta}
                        style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', opacity: 0.8 }}
                      >
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                            {offerta.nomeUtente ?? `Utente #${offerta.idUtente}`}
                          </p>
                          <p style={{ fontSize: '0.73rem', color: '#9ca3af' }}>
                            {new Date(offerta.dataOfferta).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#374151' }}>
                            € {offerta.prezzoOfferto?.toLocaleString('it-IT')}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
