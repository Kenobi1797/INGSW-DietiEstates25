'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/Context/Context';

interface Agenzia {
  idAgenzia: number;
  nome: string;
}

interface StaffUser {
  idUtente: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: 'Agente' | 'Supporto';
  idAgenzia?: number | null;
}

function getToken() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Token mancante');
  return token;
}

export default function GestioneAgenziePage() {
  const { authuser } = useUser();
  const [agenzie, setAgenzie] = useState<Agenzia[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [selectedAgenzia, setSelectedAgenzia] = useState('');
  const [selectedUtente, setSelectedUtente] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const canManage = authuser?.ruolo === 'AmministratoreAgenzia' || authuser?.ruolo === 'Supporto';

  const loadData = async () => {
    try {
      const token = getToken();
      const [agenzieRes, staffRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/agenzie`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/agenzie/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!agenzieRes.ok) throw new Error('Errore nel caricamento delle agenzie');
      if (!staffRes.ok) throw new Error('Errore nel caricamento dello staff');

      setAgenzie(await agenzieRes.json());
      setStaff(await staffRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dati');
    }
  };

  useEffect(() => {
    if (canManage) {
      loadData();
    }
  }, [canManage]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agenzie/assegna-staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idUtente: Number(selectedUtente),
          idAgenzia: Number(selectedAgenzia),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'assegnazione');

      setSelectedUtente('');
      setSelectedAgenzia('');
      setSuccess('Utente assegnato all\'agenzia con successo');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'assegnazione');
    } finally {
      setLoading(false);
    }
  };

  if (!authuser) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Devi essere loggato.</div>;
  }

  if (!canManage) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Non hai i permessi per gestire le agenzie.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Agenzie</h1>
          <p className="text-sm text-gray-500 mt-1">Assegna agenti o supporto all&apos;agenzia.</p>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">{success}</div>}

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assegna staff a un'agenzia</h2>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleAssign}>
            <select
              value={selectedUtente}
              onChange={(e) => setSelectedUtente(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              required
            >
              <option value="">Seleziona agente/supporto</option>
              {staff.map((utente) => (
                <option key={utente.idUtente} value={utente.idUtente}>
                  {utente.nome} {utente.cognome} - {utente.ruolo}{utente.idAgenzia ? ' (già assegnato)' : ''}
                </option>
              ))}
            </select>

            <select
              value={selectedAgenzia}
              onChange={(e) => setSelectedAgenzia(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              required
            >
              <option value="">Seleziona agenzia</option>
              {agenzie.map((agenzia) => (
                <option key={agenzia.idAgenzia} value={agenzia.idAgenzia}>
                  {agenzia.nome}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-700 disabled:opacity-60"
            >
              Assegna
            </button>
          </form>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stato attuale staff</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 text-gray-600">
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Ruolo</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Id Agenzia</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((utente) => (
                  <tr key={utente.idUtente} className="border-b border-gray-100 text-gray-800">
                    <td className="py-2 pr-4">{utente.nome} {utente.cognome}</td>
                    <td className="py-2 pr-4">{utente.ruolo}</td>
                    <td className="py-2 pr-4">{utente.email}</td>
                    <td className="py-2 pr-4">{utente.idAgenzia ?? 'Non assegnato'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}