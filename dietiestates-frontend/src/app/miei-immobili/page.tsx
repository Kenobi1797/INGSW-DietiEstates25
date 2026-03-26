'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/Context/Context';
import { ImmobileAgente } from '@/Models/ImmobileAgent';
import Image from 'next/image';
import { ClipboardList, CircleCheck, BadgeDollarSign, MapPin } from 'lucide-react';

export default function MieiImmobiliPage() {
  const { authuser } = useUser();
  const router = useRouter();
  const [immobili, setImmobili] = useState<ImmobileAgente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMiei() {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setError('Sessione non valida.'); return; }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/miei`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Errore nel caricamento degli immobili');
        const data = await res.json();
        setImmobili(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore');
      } finally {
        setLoading(false);
      }
    }
    fetchMiei();
  }, []);

  if (!authuser) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Devi essere loggato per accedere a questa sezione.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">I Miei Immobili</h1>
          <p className="text-gray-500 text-sm mt-1">
            Seleziona un immobile per gestire le offerte ricevute
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : immobili.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Nessun immobile trovato.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {immobili.map((imm) => (
              <div
                key={imm.id}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', width: '160px', flexShrink: 0 }}>
                  <Image
                    src={imm.fotoUrls?.[0] ?? '/placeholder.svg'}
                    alt={imm.titolo}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                  {imm.venduto && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>VENDUTO</span>
                    </div>
                  )}
                </div>

                {/* Info + azioni */}
                <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', margin: 0 }}>{imm.titolo}</p>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} />{imm.indirizzo}
                        </p>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2563eb', whiteSpace: 'nowrap' }}>
                        € {imm.prezzo.toLocaleString('it-IT')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.78rem', color: '#4b5563' }}>
                      <span>{imm.dimensioni} m²</span>
                      <span>{imm.numeroStanze} locali</span>
                      <span>Piano {imm.piano === 0 ? 'T' : imm.piano}</span>
                    </div>
                  </div>

                  {/* Azioni */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => router.push(`/miei-immobili/${imm.id}/storico`)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px', borderRadius: '8px',
                        border: '1.5px solid #d1d5db', backgroundColor: '#fff',
                        color: '#374151', fontSize: '0.8rem', fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <ClipboardList size={14} /> Storico offerte
                    </button>

                    {!imm.venduto && (
                      <>
                        <button
                          onClick={() => router.push(`/miei-immobili/${imm.id}/valuta`)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px',
                            border: '1.5px solid #d1d5db', backgroundColor: '#fff',
                            color: '#374151', fontSize: '0.8rem', fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <CircleCheck size={14} /> Valuta offerte
                        </button>

                        <button
                          onClick={() => router.push(`/inserisci-offerta?idImmobile=${imm.id}`)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px',
                            border: '1.5px solid #d1d5db', backgroundColor: '#fff',
                            color: '#374151', fontSize: '0.8rem', fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <BadgeDollarSign size={14} /> Offerta manuale
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
