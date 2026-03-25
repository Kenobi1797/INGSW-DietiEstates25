'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/Context/Context';

const EstateMap = dynamic(() => import('@/components/EstateMap'), { ssr: false });

type ImmobileDettaglio = {
  id: number;
  titolo: string;
  descrizione?: string;
  prezzo: number;
  tipologia: string;
  classeEnergetica?: string;
  dimensioni?: number | null;
  numeroStanze?: number | null;
  numeroBagni?: number | null;
  piano?: number | null;
  riscaldamento?: string;
  ascensore: boolean;
  balcone: boolean;
  terrazzo: boolean;
  giardino: boolean;
  postoAuto: boolean;
  climatizzazione: boolean;
  cantina: boolean;
  portineria: boolean;
  indirizzo: string;
  latitudine: number;
  longitudine: number;
  fotoUrls: string[];
  scuoleVicine: boolean;
  parchiVicini: boolean;
  trasportiPubbliciVicini: boolean;
  venduto?: boolean;
};

const DOTAZIONI: { key: keyof ImmobileDettaglio; label: string }[] = [
  { key: 'ascensore', label: '🛗 Ascensore' },
  { key: 'balcone', label: '🌿 Balcone' },
  { key: 'terrazzo', label: '☀️ Terrazzo' },
  { key: 'giardino', label: '🌳 Giardino' },
  { key: 'postoAuto', label: '🚗 Posto auto' },
  { key: 'cantina', label: '📦 Cantina' },
  { key: 'portineria', label: '🏨 Portineria' },
  { key: 'climatizzazione', label: '❄️ Climatizzazione' },
];

export default function ImmobileDettaglioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { authuser } = useUser();

  const [immobile, setImmobile] = useState<ImmobileDettaglio | null>(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [fotoIdx, setFotoIdx] = useState(0);

  const [offertaAmount, setOffertaAmount] = useState('');
  const [offertaLoading, setOffertaLoading] = useState(false);
  const [offertaMsg, setOffertaMsg] = useState('');

  useEffect(() => {
    async function loadDettaglio() {
      try {
        // Il token è opzionale: la pagina è pubblica in lettura
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error('Immobile non trovato');
        const data = await response.json();
        setImmobile(data);
      } catch (err) {
        setErrore(err instanceof Error ? err.message : 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) loadDettaglio();
  }, [params?.id]);

  const handleOfferta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!immobile) return;
    setOffertaLoading(true);
    setOffertaMsg('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Devi effettuare il login');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idImmobile: immobile.id, prezzoOfferto: Number(offertaAmount) }),
      });
      const raw = await res.text();
      if (!res.ok) {
        let msg = "Errore nell'invio offerta";
        try { msg = JSON.parse(raw).error || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      setOffertaMsg('Offerta inviata con successo!');
      setOffertaAmount('');
    } catch (err) {
      setOffertaMsg(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setOffertaLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 text-lg">Caricamento...</p></div>;
  if (errore || !immobile) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="box p-8 text-center max-w-md">
        <p className="text-red-600 mb-4 text-lg">{errore || 'Immobile non trovato'}</p>
        <button className="btn-primary px-6 py-2 rounded font-semibold" onClick={() => router.back()}>Torna indietro</button>
      </div>
    </div>
  );

  const foto = immobile.fotoUrls?.length > 0 ? immobile.fotoUrls : ['/placeholder.svg'];

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="text-red-600 hover:underline mb-4 inline-flex items-center gap-1 text-sm">← Torna ai risultati</button>

        {/* Galleria foto */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-lg mb-6 bg-gray-100" style={{ aspectRatio: '16/7' }}>
          <Image src={foto[fotoIdx]} alt={immobile.titolo} fill className="object-cover" unoptimized />
          {foto.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {foto.map((_, i) => (
                <button key={i} onClick={() => setFotoIdx(i)} aria-label={`Foto ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full border border-white transition-all ${i === fotoIdx ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonna principale */}
          <div className="lg:col-span-2 space-y-6">

            <div>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{immobile.titolo}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  immobile.tipologia === 'Vendita' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>{immobile.tipologia}</span>
              </div>
              <p className="text-gray-500 mt-1 text-sm">📍 {immobile.indirizzo}</p>
              <p className="text-3xl font-bold text-red-600 mt-2">€ {immobile.prezzo.toLocaleString('it-IT')}</p>
            </div>

            {/* Scheda metriche */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { icon: '📐', label: 'mq', value: immobile.dimensioni ?? 'N/D' },
                { icon: '🛏️', label: 'stanze', value: immobile.numeroStanze ?? 'N/D' },
                { icon: '🚿', label: 'bagni', value: immobile.numeroBagni ?? 'N/D' },
                { icon: '🏢', label: 'piano', value: immobile.piano === 0 ? 'T' : String(immobile.piano ?? 'N/D') },
                { icon: '⚡', label: 'classe', value: immobile.classeEnergetica ?? 'N/D' },
                { icon: '🔥', label: 'risc.', value: immobile.riscaldamento || 'N/D' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                  <div className="text-xl">{icon}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  <div className="font-semibold text-sm mt-0.5 truncate">{value}</div>
                </div>
              ))}
            </div>

            {/* Badge Geoapify */}
            <div>
              <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
                Servizi nelle vicinanze
                <span className="text-xs text-gray-400 font-normal bg-gray-100 px-2 py-0.5 rounded">via Geoapify</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'scuoleVicine', label: '🏫 Scuole', value: immobile.scuoleVicine },
                  { key: 'parchiVicini', label: '🌳 Parchi', value: immobile.parchiVicini },
                  { key: 'trasportiPubbliciVicini', label: '🚇 Trasporti pubblici', value: immobile.trasportiPubbliciVicini },
                ].map(({ key, label, value }) => (
                  <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                    value ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {label} <span className="text-xs font-bold">{value ? '✓' : '✗'}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Dotazioni */}
            <div>
              <h2 className="text-base font-semibold mb-2">Dotazioni</h2>
              <div className="flex flex-wrap gap-2">
                {DOTAZIONI.filter(({ key }) => immobile[key]).map(({ label }) => (
                  <span key={label} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{label}</span>
                ))}
                {DOTAZIONI.every(({ key }) => !immobile[key]) && <span className="text-sm text-gray-400">Nessuna dotazione aggiuntiva.</span>}
              </div>
            </div>

            {immobile.descrizione && (
              <div>
                <h2 className="text-base font-semibold mb-2">Descrizione</h2>
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{immobile.descrizione}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <EstateMap lat={immobile.latitudine} lon={immobile.longitudine} />

            {authuser?.ruolo === 'Cliente' && !immobile.venduto && (
              <div className="border-2 border-red-200 rounded-xl p-4 space-y-3">
                <h2 className="text-base font-semibold">Fai un&apos;offerta</h2>
                <form onSubmit={handleOfferta} className="space-y-2">
                  <input type="number" step="0.01" min="1" placeholder="Importo (€)" value={offertaAmount}
                    onChange={(e) => setOffertaAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-red-400 outline-none" required />
                  <button type="submit" disabled={offertaLoading || !offertaAmount}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold text-sm disabled:opacity-50 transition-colors">
                    {offertaLoading ? 'Invio...' : 'Invia Offerta'}
                  </button>
                </form>
                {offertaMsg && <p className={`text-sm font-medium ${offertaMsg.includes('successo') ? 'text-green-600' : 'text-red-600'}`}>{offertaMsg}</p>}
              </div>
            )}

            {immobile.venduto && (
              <div className="bg-gray-100 rounded-xl p-4 text-center border">
                <p className="text-gray-600 font-semibold">🔒 Immobile non disponibile</p>
              </div>
            )}

            {!authuser && (
              <div className="border rounded-xl p-4 text-center bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Accedi per inviare un&apos;offerta</p>
                <Link href="/login" className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 inline-block font-semibold">Accedi</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
