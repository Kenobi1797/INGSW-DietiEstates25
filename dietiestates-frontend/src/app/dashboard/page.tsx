"use client";

import { useUser } from "@/Context/Context";
import Link from "next/link";
import { useState } from "react";
import ListaImmobili from "@/components/ListImmobili";
import { ImmobileS } from "@/Models/ImmobileS";

interface DashboardStats {
  immobiliTotali?: number;
  offerteAttive?: number;
  offerteAccettate?: number;
  agentiTotali?: number;
}

const sampleImmobili: ImmobileS[] = [
  {
    id: 1001,
    idAgente: 1,
    titolo: "Attico panoramico in centro",
    descrizione: "Splendido attico ristrutturato con vista sul Duomo.",
    prezzo: 425000,
    dimensioni: 135,
    indirizzo: "Via Roma 12, Napoli",
    numeroStanze: 4,
    numeroBagni: 2,
    piano: 5,
    ascensore: true,
    balcone: true,
    terrazzo: true,
    giardino: false,
    postoAuto: false,
    cantina: true,
    portineria: false,
    climatizzazione: true,
    riscaldamento: "Centralizzato",
    classeEnergetica: "A",
    tipologia: "Vendita",
    latitudine: 40.8399,
    longitudine: 14.2500,
    fotoUrls: [
      "https://images.pexels.com/photos/248769/pexels-photo-248769.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    dataCreazione: new Date(),
    venduto: false,
    dataVendita: null,
    scuoleVicine: true,
    parchiVicini: false,
    trasportiPubbliciVicini: true,
    serviziVicinati: true
  },
  {
    id: 1002,
    idAgente: 2,
    titolo: "Appartamento con giardino privato",
    descrizione: "Luminoso appartamento con giardino esclusivo in zona residenziale.",
    prezzo: 265000,
    dimensioni: 90,
    indirizzo: "Via delle Gardenie 21, Caserta",
    numeroStanze: 3,
    numeroBagni: 1,
    piano: 1,
    ascensore: false,
    balcone: true,
    terrazzo: false,
    giardino: true,
    postoAuto: true,
    cantina: false,
    portineria: false,
    climatizzazione: false,
    riscaldamento: "Autonomo",
    classeEnergetica: "B",
    tipologia: "Vendita",
    latitudine: 41.0737,
    longitudine: 14.3349,
    fotoUrls: [
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    dataCreazione: new Date(),
    venduto: false,
    dataVendita: null,
    scuoleVicine: true,
    parchiVicini: true,
    trasportiPubbliciVicini: false,
    serviziVicinati: true
  }
];

export default function DashboardAgent() {
  const { authuser } = useUser();
  const [immobili] = useState<ImmobileS[]>(sampleImmobili);
  const stats: DashboardStats = {
    immobiliTotali: immobili.length,
    offerteAttive: 8,
    offerteAccettate: 12,
    agentiTotali: 5
  };

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
            <h2 className="text-xl font-semibold mb-4">Prezenti Immobili di Prova</h2>
            <p className="text-sm text-gray-700 mb-4">Esempi di annunci immobiliari per mostrare l’interfaccia completa.</p>
            <ListaImmobili immobili={immobili} loading={false} />
          </div>
        )}
      </div>
    </div>
  );
}
