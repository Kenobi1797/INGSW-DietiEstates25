'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/Context/Context';
import PrezzoInput from '@/components/PrezzoInput';
import {
  ArrowUpDown, Leaf, Sun, Trees, Car, Package, Hotel, Snowflake,
  Ruler, BedDouble, ShowerHead, Building2, Zap, Flame,
  MapPin, School, TrainFront, Check, X, Lock, ChevronLeft, ChevronRight,
} from 'lucide-react';

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

const DOTAZIONI: { key: keyof ImmobileDettaglio; icon: React.ReactNode; label: string }[] = [
  { key: 'ascensore',      icon: <ArrowUpDown size={14} />, label: 'Ascensore' },
  { key: 'balcone',        icon: <Leaf size={14} />,       label: 'Balcone' },
  { key: 'terrazzo',       icon: <Sun size={14} />,        label: 'Terrazzo' },
  { key: 'giardino',       icon: <Trees size={14} />,      label: 'Giardino' },
  { key: 'postoAuto',      icon: <Car size={14} />,        label: 'Posto auto' },
  { key: 'cantina',        icon: <Package size={14} />,    label: 'Cantina' },
  { key: 'portineria',     icon: <Hotel size={14} />,      label: 'Portineria' },
  { key: 'climatizzazione',icon: <Snowflake size={14} />,  label: 'Climatizzazione' },
];

export default function ImmobileDettaglioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { authuser } = useUser();

  const [immobile, setImmobile] = useState<ImmobileDettaglio | null>(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [fotoIdx, setFotoIdx] = useState(0);

  const [offertaAmount, setOffertaAmount] = useState(0);
  const [offertaLoading, setOffertaLoading] = useState(false);
  const [offertaMsg, setOffertaMsg] = useState('');

  const goToNextFoto = (totalFoto: number) => {
    setFotoIdx((prev) => (prev + 1) % totalFoto);
  };

  const goToPrevFoto = (totalFoto: number) => {
    setFotoIdx((prev) => (prev - 1 + totalFoto) % totalFoto);
  };

  useEffect(() => {
    async function loadDettaglio() {
      try {
        // Il token è opzionale: la pagina è pubblica in lettura
        const token = globalThis.window === undefined ? null : sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Devi effettuare il login');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idImmobile: immobile.id, prezzoOfferto: offertaAmount }),
      });
      const raw = await res.text();
      if (!res.ok) {
        let msg = "Errore nell'invio offerta";
        try { msg = JSON.parse(raw).error || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      setOffertaMsg('Offerta inviata con successo!');
      setOffertaAmount(0);
    } catch (err) {
      setOffertaMsg(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setOffertaLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-600 text-lg">Caricamento...</p></div>;
  if (errore || !immobile) return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="box p-8 text-center max-w-md bg-white border-red-200">
        <p className="text-red-600 mb-4 text-lg">{errore || 'Immobile non trovato'}</p>
        <button className="btn-primary px-6 py-2 rounded font-semibold" onClick={() => router.back()}>Torna indietro</button>
      </div>
    </div>
  );

  const foto = immobile.fotoUrls?.length > 0 ? immobile.fotoUrls : ['/placeholder.svg'];

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="text-red-600 hover:underline mb-4 inline-flex items-center gap-1 text-sm">← Torna ai risultati</button>

        {/* Galleria foto */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-lg mb-3 bg-gray-200 border border-gray-200" style={{ aspectRatio: '16/7' }}>
          <Image src={foto[fotoIdx]} alt={immobile.titolo} fill className="object-cover" unoptimized />
          {foto.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goToPrevFoto(foto.length)}
                aria-label="Foto precedente"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 hover:bg-black/75 text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => goToNextFoto(foto.length)}
                aria-label="Foto successiva"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 hover:bg-black/75 text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {foto.length > 1 && (
          <div className="mb-6">
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2 min-w-max pr-1">
                {foto.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setFotoIdx(i)}
                    aria-label={`Apri foto ${i + 1}`}
                    className={`relative w-24 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      i === fotoIdx
                        ? 'border-red-500 ring-1 ring-red-500/50'
                        : 'border-transparent opacity-75 hover:opacity-100 hover:border-red-300'
                    }`}
                  >
                    <Image src={url} alt={`Anteprima ${i + 1}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
              <p className="text-gray-600 mt-1 text-sm inline-flex items-center gap-1"><MapPin size={13} />{immobile.indirizzo}</p>
              <p className="text-3xl font-bold text-red-600 mt-2">€ {immobile.prezzo.toLocaleString('it-IT')}</p>
            </div>

            {/* Scheda metriche */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { icon: <Ruler size={20} />,      label: 'mq',     value: immobile.dimensioni ?? 'N/D' },
                { icon: <BedDouble size={20} />,   label: 'stanze', value: immobile.numeroStanze ?? 'N/D' },
                { icon: <ShowerHead size={20} />,  label: 'bagni',  value: immobile.numeroBagni ?? 'N/D' },
                { icon: <Building2 size={20} />,   label: 'piano',  value: immobile.piano === 0 ? 'T' : String(immobile.piano ?? 'N/D') },
                { icon: <Zap size={20} />,         label: 'classe', value: immobile.classeEnergetica ?? 'N/D' },
                { icon: <Flame size={20} />,       label: 'risc.',  value: immobile.riscaldamento || 'N/D' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-white rounded-lg p-2 text-center border border-gray-200">
                  <div className="flex justify-center text-gray-700">{icon}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{label}</div>
                  <div className="font-semibold text-sm mt-0.5 truncate text-gray-900">{value}</div>
                </div>
              ))}
            </div>

            {/* Badge Geoapify */}
            <div>
              <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
                Servizi nelle vicinanze
                {' '}
                <span className="text-xs text-gray-600 font-normal bg-gray-100 px-2 py-0.5 rounded">via Geoapify</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'scuoleVicine',            icon: <School size={14} />,     label: 'Scuole',             value: immobile.scuoleVicine },
                  { key: 'parchiVicini',             icon: <Trees size={14} />,      label: 'Parchi',             value: immobile.parchiVicini },
                  { key: 'trasportiPubbliciVicini',  icon: <TrainFront size={14} />, label: 'Trasporti pubblici', value: immobile.trasportiPubbliciVicini },
                ].map(({ key, icon, label, value }) => (
                  <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                    value
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}>
                    {icon}{label}{value ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                ))}
              </div>
            </div>

            {/* Dotazioni */}
            <div>
              <h2 className="text-base font-semibold mb-2">Dotazioni</h2>
              <div className="flex flex-wrap gap-2">
                {DOTAZIONI.filter(({ key }) => immobile[key]).map(({ icon, label }) => (
                  <span key={label} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1.5">{icon}{label}</span>
                ))}
                {DOTAZIONI.every(({ key }) => !immobile[key]) && <span className="text-sm text-gray-600">Nessuna dotazione aggiuntiva.</span>}
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
              <div className="border-2 border-red-200 rounded-xl p-4 space-y-3 bg-white">
                <h2 className="text-base font-semibold text-gray-900">Fai un&apos;offerta</h2>
                <form onSubmit={handleOfferta} className="space-y-2">
                  <PrezzoInput
                    value={offertaAmount}
                    onChange={(val) => setOffertaAmount(val)}
                    placeholder="Importo (€)"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:border-red-400 outline-none"
                  />
                  <button type="submit" disabled={offertaLoading || offertaAmount <= 0}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold text-sm disabled:opacity-50 transition-colors">
                    {offertaLoading ? 'Invio...' : 'Invia Offerta'}
                  </button>
                </form>
                {offertaMsg && <p className={`text-sm font-medium ${offertaMsg.includes('successo') ? 'text-green-600' : 'text-red-600'}`}>{offertaMsg}</p>}
              </div>
            )}

            {immobile.venduto && (
              <div className="bg-gray-100 rounded-xl p-4 text-center border border-gray-200">
                <p className="text-gray-700 font-semibold inline-flex items-center gap-1.5"><Lock size={15} /> Immobile non disponibile</p>
              </div>
            )}

            {!authuser && (
              <div className="border border-gray-200 rounded-xl p-4 text-center bg-gray-50">
                <p className="text-sm text-gray-700 mb-2">Accedi per inviare un&apos;offerta</p>
                <Link href="/login" className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 inline-block font-semibold">Accedi</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
