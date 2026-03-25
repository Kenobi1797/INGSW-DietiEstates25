"use client";

import { useUser } from "@/Context/Context";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  immobiliTotali: number;
  offerteAttive: number;
  offerteAccettate: number;
}

export default function DashboardAgent() {
  const { authuser } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    immobiliTotali: 0,
    offerteAttive: 0,
    offerteAccettate: 0,
  });
  const [statsError, setStatsError] = useState<string>('');

  useEffect(() => {
    const fetchStats = async () => {
      if (!authuser || authuser.ruolo === 'Cliente' || authuser.ruolo === 'Supporto') return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [immobiliRes, offerteRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/miei`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/agente`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!immobiliRes.ok || !offerteRes.ok) {
          throw new Error('Impossibile caricare statistiche reali');
        }

        const immobiliData = await immobiliRes.json();
        const offerteData = await offerteRes.json();

        const offerteList = Array.isArray(offerteData) ? offerteData : [];
        const immobiliList = Array.isArray(immobiliData) ? immobiliData : [];

        setStats({
          immobiliTotali: immobiliList.length,
          offerteAttive: offerteList.filter((o: { stato?: string }) => o.stato === 'InAttesa').length,
          offerteAccettate: offerteList.filter((o: { stato?: string }) => o.stato === 'Accettata').length,
        });
      } catch (err) {
        setStatsError(err instanceof Error ? err.message : 'Errore nel caricamento statistiche');
      }
    };

    fetchStats();
  }, [authuser]);

  if (!authuser) {
    return <p>Devi essere loggato per accedere alla dashboard.</p>;
  }

  return (
    <div className="centerGrid">
      <div className="box">
        <h1>Dashboard {authuser.ruolo}</h1>
        <p>Benvenuto, {authuser.nome} {authuser.cognome}!</p>

        {/* Statistiche per agenti/staff */}
        {(authuser.ruolo === 'Agente' || authuser.ruolo === 'Supporto' || authuser.ruolo === 'AmministratoreAgenzia') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-8">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.immobiliTotali || 0}</div>
              <div className="text-sm text-blue-800">Immobili Gestiti</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.offerteAttive || 0}</div>
              <div className="text-sm text-green-800">Offerte Attive</div>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.offerteAccettate || 0}</div>
              <div className="text-sm text-purple-800">Offerte Accettate</div>
            </div>
          </div>
        )}

        {statsError && <p className="text-sm text-red-600 mb-4">{statsError}</p>}

        {/* Azioni rapide */}
        <h2 className="text-xl font-semibold mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/search" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
            🔍 Ricerca Immobili
          </Link>

          {authuser.ruolo === 'Cliente' && (
            <Link href="/storico-offerte" className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
              📋 Storico Offerte
            </Link>
          )}

          {(authuser.ruolo === 'Agente' || authuser.ruolo === 'AmministratoreAgenzia') && (
            <Link href="/aggiungi-immobile" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
              🏠 Aggiungi Immobile
            </Link>
          )}

          {(authuser.ruolo === 'Agente' || authuser.ruolo === 'AmministratoreAgenzia') && (
            <Link href="/valuta-offerte" className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
              ✅ Valuta Offerte
            </Link>
          )}

          {(authuser.ruolo === 'Agente' || authuser.ruolo === 'AmministratoreAgenzia') && (
            <Link href="/inserisci-offerta" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
              💰 Inserisci Offerta
            </Link>
          )}

          {authuser.ruolo === 'AmministratoreAgenzia' && (
            <Link href="/crea-staff" className="bg-red-500 hover:bg-red-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
              👥 Crea Staff
            </Link>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Dashboard focalizzata sulle funzionalita implementate: account, immobili, ricerca, offerte e servizi Geoapify.
        </p>
      </div>
    </div>
  );
}
