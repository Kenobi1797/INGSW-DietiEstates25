"use client";

import { useUser } from "@/Context/Context";
import Link from "next/link";
import { useEffect, useState } from "react";

type Ruolo = "Cliente" | "Agente" | "Supporto" | "AmministratoreAgenzia";

interface DashboardStats {
  immobiliDisponibili: number;
  offerteTotali: number;
  offerteInAttesa: number;
  offerteAccettate: number;
  offerteRifiutate: number;
  controproposte: number;
}

interface OffertaLite {
  stato?: string;
}

interface ActionItem {
  href: string;
  label: string;
  icon: string;
  className: string;
}

const EMPTY_STATS: DashboardStats = {
  immobiliDisponibili: 0,
  offerteTotali: 0,
  offerteInAttesa: 0,
  offerteAccettate: 0,
  offerteRifiutate: 0,
  controproposte: 0,
};

function countByStatus(offerte: OffertaLite[], stato: string) {
  return offerte.filter((offerta) => offerta.stato === stato).length;
}

function getActionsByRole(ruolo: Ruolo): ActionItem[] {
  const common: ActionItem[] = [
    {
      href: "/immobili",
      label: "Lista Immobili",
      icon: "🏘️",
      className: "bg-blue-500 hover:bg-blue-700",
    },
    {
      href: "/search",
      label: "Ricerca Immobili",
      icon: "🔍",
      className: "bg-sky-500 hover:bg-sky-700",
    },
  ];

  if (ruolo === "Cliente") {
    return [
      ...common,
      {
        href: "/storico-offerte",
        label: "Storico Offerte",
        icon: "📋",
        className: "bg-green-500 hover:bg-green-700",
      },
    ];
  }

  if (ruolo === "Agente") {
    return [
      ...common,
      {
        href: "/aggiungi-immobile",
        label: "Aggiungi Immobile",
        icon: "🏠",
        className: "bg-indigo-500 hover:bg-indigo-700",
      },
      {
        href: "/valuta-offerte",
        label: "Valuta Offerte",
        icon: "✅",
        className: "bg-green-500 hover:bg-green-700",
      },
      {
        href: "/inserisci-offerta",
        label: "Inserisci Offerta",
        icon: "💰",
        className: "bg-orange-500 hover:bg-orange-700",
      },
    ];
  }

  if (ruolo === "AmministratoreAgenzia") {
    return [
      ...common,
      {
        href: "/aggiungi-immobile",
        label: "Aggiungi Immobile",
        icon: "🏠",
        className: "bg-indigo-500 hover:bg-indigo-700",
      },
      {
        href: "/valuta-offerte",
        label: "Valuta Offerte",
        icon: "✅",
        className: "bg-green-500 hover:bg-green-700",
      },
      {
        href: "/inserisci-offerta",
        label: "Inserisci Offerta",
        icon: "💰",
        className: "bg-orange-500 hover:bg-orange-700",
      },
      {
        href: "/crea-staff",
        label: "Crea Staff",
        icon: "👥",
        className: "bg-red-500 hover:bg-red-700",
      },
    ];
  }

  return common;
}

export default function DashboardAgent() {
  const { authuser } = useUser();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [statsError, setStatsError] = useState<string>("");
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!authuser) return;

      try {
        setStatsLoading(true);
        setStatsError("");

        const token = localStorage.getItem('token');

        const immobiliRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/search?limit=200`);
        if (!immobiliRes.ok) {
          throw new Error('Impossibile caricare gli immobili disponibili');
        }
        const immobiliData = await immobiliRes.json();
        const immobiliDisponibili = Array.isArray(immobiliData) ? immobiliData.length : 0;

        if ((authuser.ruolo === "Agente" || authuser.ruolo === "AmministratoreAgenzia") && token) {
          const offerteRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/agente`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!offerteRes.ok) {
            throw new Error('Impossibile caricare le offerte dell\'agente');
          }

          const offerteData = await offerteRes.json();
          const offerteList: OffertaLite[] = Array.isArray(offerteData) ? offerteData : [];

          setStats({
            immobiliDisponibili,
            offerteTotali: offerteList.length,
            offerteInAttesa: countByStatus(offerteList, 'InAttesa'),
            offerteAccettate: countByStatus(offerteList, 'Accettata'),
            offerteRifiutate: countByStatus(offerteList, 'Rifiutata'),
            controproposte: countByStatus(offerteList, 'Controproposta'),
          });

          return;
        }

        if (authuser.ruolo === "Cliente" && token) {
          const offerteRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/utente`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!offerteRes.ok) {
            throw new Error('Impossibile caricare lo storico offerte del cliente');
          }

          const offerteData = await offerteRes.json();
          const offerteList: OffertaLite[] = Array.isArray(offerteData) ? offerteData : [];

          setStats({
            immobiliDisponibili,
            offerteTotali: offerteList.length,
            offerteInAttesa: countByStatus(offerteList, 'InAttesa'),
            offerteAccettate: countByStatus(offerteList, 'Accettata'),
            offerteRifiutate: countByStatus(offerteList, 'Rifiutata'),
            controproposte: countByStatus(offerteList, 'Controproposta'),
          });

          return;
        }

        // Supporto: focus su monitoraggio immobili disponibili
        setStats({
          ...EMPTY_STATS,
          immobiliDisponibili,
        });

      } catch (err) {
        setStats(EMPTY_STATS);
        setStatsError(err instanceof Error ? err.message : 'Errore nel caricamento statistiche');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [authuser]);

  if (!authuser) {
    return <p>Devi essere loggato per accedere alla dashboard.</p>;
  }

  const actions = getActionsByRole(authuser.ruolo as Ruolo);

  const cards = authuser.ruolo === "Supporto"
    ? [
        {
          title: 'Immobili Disponibili',
          value: stats.immobiliDisponibili,
          colors: 'bg-blue-100 text-blue-600 border-blue-200',
        },
      ]
    : [
        {
          title: 'Immobili Disponibili',
          value: stats.immobiliDisponibili,
          colors: 'bg-blue-100 text-blue-600 border-blue-200',
        },
        {
          title: 'Offerte Totali',
          value: stats.offerteTotali,
          colors: 'bg-slate-100 text-slate-700 border-slate-200',
        },
        {
          title: 'Offerte In Attesa',
          value: stats.offerteInAttesa,
          colors: 'bg-amber-100 text-amber-700 border-amber-200',
        },
        {
          title: 'Offerte Accettate',
          value: stats.offerteAccettate,
          colors: 'bg-green-100 text-green-700 border-green-200',
        },
        {
          title: 'Offerte Rifiutate',
          value: stats.offerteRifiutate,
          colors: 'bg-rose-100 text-rose-700 border-rose-200',
        },
        {
          title: 'Controproposte',
          value: stats.controproposte,
          colors: 'bg-purple-100 text-purple-700 border-purple-200',
        },
      ];

  return (
    <div className="centerGrid">
      <div className="box">
        <h1>Dashboard {authuser.ruolo}</h1>
        <p>Benvenuto, {authuser.nome} {authuser.cognome}!</p>

        <div className="mt-6 mb-8">
          {statsLoading ? (
            <p className="text-sm text-gray-500">Caricamento statistiche...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div key={card.title} className={`p-4 rounded-lg border text-center ${card.colors}`}>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-sm">{card.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {statsError && <p className="text-sm text-red-600 mb-4">{statsError}</p>}

        <h2 className="text-xl font-semibold mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.className} text-white font-bold py-4 px-6 rounded text-center transition-colors`}
            >
              <span className="mr-2">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Statistiche aggiornate in base al ruolo corrente e ai dati reali disponibili nella piattaforma.
        </p>
      </div>
    </div>
  );
}
