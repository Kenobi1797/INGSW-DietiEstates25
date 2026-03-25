"use client";

import { useUser } from "@/Context/Context";
import Link from "next/link";
import { useState, useEffect } from "react";

interface DashboardStats {
  immobiliTotali?: number;
  offerteAttive?: number;
  offerteAccettate?: number;
  agentiTotali?: number;
}

export default function DashboardAgent() {
  const { authuser } = useUser();
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    // Qui potremmo caricare statistiche dal backend in futuro
    // Per ora mostriamo dati di esempio
    if (authuser?.ruolo === 'Agente' || authuser?.ruolo === 'Supporto' || authuser?.ruolo === 'AmministratoreAgenzia') {
      setStats({
        immobiliTotali: 15,
        offerteAttive: 8,
        offerteAccettate: 12,
        agentiTotali: 5
      });
    }
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
            {(authuser.ruolo === 'Supporto' || authuser.ruolo === 'AmministratoreAgenzia') && (
              <div className="bg-orange-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.agentiTotali || 0}</div>
                <div className="text-sm text-orange-800">Agenti Attivi</div>
              </div>
            )}
          </div>
        )}

        {/* Azioni rapide */}
        <h2 className="text-xl font-semibold mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authuser.ruolo === 'Cliente' ? (
            <>
              <Link href="/search" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
                🔍 Ricerca Immobili
              </Link>
              <Link href="/storico-offerte" className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
                📋 Storico Offerte
              </Link>
              <Link href="/controfferte" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
                💬 Controfferte
              </Link>
            </>
          ) : (
            <>
              <Link href="/aggiungi-immobile" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
                🏠 Aggiungi Immobile
              </Link>
              <Link href="/valuta-offerte" className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
                ✅ Valuta Offerte
              </Link>
              <Link href="/inserisci-offerta" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
                💰 Inserisci Offerta
              </Link>
              {(authuser.ruolo === 'Supporto' || authuser.ruolo === 'AmministratoreAgenzia') && (
                <Link href="/crea-staff" className="bg-red-500 hover:bg-red-700 text-white font-bold py-4 px-6 rounded text-center transition-colors">
                  👥 Crea Staff
                </Link>
              )}
            </>
          )}
        </div>

        {/* Sezioni aggiuntive per staff/admin */}
        {(authuser.ruolo === 'Supporto' || authuser.ruolo === 'AmministratoreAgenzia') && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Gestione Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">📊 Report</h3>
                <p className="text-sm text-gray-600">Visualizza statistiche e report di sistema</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">⚙️ Configurazioni</h3>
                <p className="text-sm text-gray-600">Gestisci impostazioni di sistema</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
