"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ListaImmobili from "@/components/ListImmobili";
import { ImmobileS } from "@/Models/ImmobileS";

export default function ListaImmobiliPage() {
  const router = useRouter();
  const [immobili, setImmobili] = useState<ImmobileS[]>([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImmobili() {
      setLoading(true);
      setErrore(null);
      try {
        const token = typeof globalThis.window === "undefined" ? null : sessionStorage.getItem("token");
        const query = new URLSearchParams({
          orderBy: "DataCreazione",
          orderDir: "DESC",
          limit: "100",
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/search?${query.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(`Errore caricamento immobili: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new TypeError("Risposta non valida dal server");
        }

        setImmobili(data as ImmobileS[]);
      } catch (err) {
        setErrore(err instanceof Error ? err.message : "Errore nel caricamento immobili");
        setImmobili([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImmobili();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Lista Immobili</h1>
        <p className="text-gray-600 mb-6">Tutti gli immobili attualmente disponibili in piattaforma.</p>

        {errore && <div className="text-red-700 p-3 border border-red-200 rounded mb-4">{errore}</div>}
        <ListaImmobili
          immobili={immobili}
          loading={loading}
          renderExtra={(immobile) => ({
            onClick: () => router.push(`/immobili/${immobile.id}`),
          })}
        />
      </div>
    </div>
  );
}
