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
      {
        href: "/controfferte",
        label: "Controfferte",
        icon: "↩",
        className: "bg-blue-500 hover:bg-blue-700",
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
      {
        href: "/profilo",
        label: "Profilo",
        icon: "👤",
        className: "bg-gray-500 hover:bg-gray-700",
      },
    ];
  }

  if (ruolo === "Supporto") {
    return [
      ...common,
      {
        href: "/crea-staff",
        label: "Crea Agente",
        icon: "👥",
        className: "bg-red-500 hover:bg-red-700",
      },
      {
        href: "/storico-offerte",
        label: "Storico Offerte",
        icon: "📋",
        className: "bg-green-500 hover:bg-green-700",
      },
      {
        href: "/profilo",
        label: "Profilo",
        icon: "👤",
        className: "bg-gray-500 hover:bg-gray-700",
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
      {
        href: "/profilo",
        label: "Profilo",
        icon: "👤",
        className: "bg-gray-500 hover:bg-gray-700",
      },
    ];
  }

  // Cliente
  return [
    ...common,
    {
      href: "/profilo",
      label: "Profilo",
      icon: "👤",
      className: "bg-gray-500 hover:bg-gray-700",
    },
  ];
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Benvenuto, <span className="font-semibold text-red-600">{authuser.nome}</span>
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{authuser.ruolo}</span>
          </p>
        </div>

        {/* Statistiche */}
        <div className="mb-8">
          {statsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {cards.map((card) => (
                <div key={card.title} className={`p-4 rounded-xl border text-center ${card.colors}`}>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs mt-0.5 leading-tight">{card.title}</div>
                </div>
              ))}
            </div>
          )}
          {statsError && <p className="text-sm text-red-600 mt-3">{statsError}</p>}
        </div>

        {/* Azioni rapide */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Azioni Rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`${action.className} text-white font-semibold py-4 px-5 rounded-xl text-sm flex items-center gap-2.5 transition-colors shadow-sm`}
              >
                <span className="text-xl">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Statistiche aggiornate in base al ruolo e ai dati reali della piattaforma.
        </p>
      </div>
    </div>
  );
}
