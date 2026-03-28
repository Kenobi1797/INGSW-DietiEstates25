"use client";
import { useState } from "react";
import { createAgente, createSupporto } from "@/Services/CreaStaff";
import { CircleCheck } from 'lucide-react';

interface Props {
  readonly targetRole: "Agente" | "Supporto";
  readonly onCancel: () => void;
}

export default function AddStaff({ targetRole, onCancel }: Props) {
  const [formData, setFormData] = useState({ nome: "", cognome: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (targetRole === "Agente") {
        await createAgente(formData);
      } else {
        await createSupporto(formData);
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = targetRole === "Agente" ? "Agente Immobiliare" : "Account Supporto";

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="text-4xl mb-3 flex justify-center text-green-600"><CircleCheck size={48} /></div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{roleLabel} creato!</h2>
        <p className="text-sm text-gray-500 mb-6">
          L&apos;account è adesso attivo e pronto all&apos;uso.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setSuccess(false); setFormData({ nome: "", cognome: "", email: "", password: "" }); }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Crea un altro
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            Torna indietro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Nuovo {roleLabel}</h2>
          <p className="text-sm text-gray-500 mt-0.5">Inserisci i dati del nuovo collaboratore.</p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕ Annulla
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="staff-nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              id="staff-nome"
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Mario"
            />
          </div>
          <div>
            <label htmlFor="staff-cognome" className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
            <input
              id="staff-cognome"
              type="text"
              required
              value={formData.cognome}
              onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Rossi"
            />
          </div>
        </div>
        <div>
          <label htmlFor="staff-email" className="block text-sm font-medium text-gray-700 mb-1">Email aziendale</label>
          <input
            id="staff-email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="mario.rossi@agenzia.com"
          />
        </div>
        <div>
          <label htmlFor="staff-password" className="block text-sm font-medium text-gray-700 mb-1">Password temporanea</label>
          <input
            id="staff-password"
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Almeno 6 caratteri"
          />
          <p className="text-xs text-gray-400 mt-1">Il collaboratore potrà cambiarla dal proprio profilo.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? "Creazione in corso..." : `Crea ${roleLabel}`}
        </button>
      </form>
    </div>
  );
}