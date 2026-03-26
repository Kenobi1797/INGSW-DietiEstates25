"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/Context/Context";
import AddStaff from "@/components/AddStaff";

export default function CreaStaffPage() {
  const { authuser } = useUser();
  const [targetRole, setTargetRole] = useState<"Agente" | "Supporto" | null>(null);

  // Il Supporto può creare solo Agenti
  const canCreateSupporto = authuser?.ruolo === "AmministratoreAgenzia";

  useEffect(() => {
    // Se è Supporto, preseleziona Agente direttamente
    if (authuser?.ruolo === "Supporto") {
      setTargetRole("Agente");
    }
  }, [authuser]);

  if (!authuser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Devi essere loggato per accedere a questa sezione.</p>
      </div>
    );
  }

  if (authuser.ruolo !== "AmministratoreAgenzia" && authuser.ruolo !== "Supporto") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-sm shadow-sm">
          <p className="text-gray-600">Non hai i permessi per accedere a questa sezione.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-lg mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestione Staff</h1>
          <p className="text-gray-500 text-sm mt-1">
            {canCreateSupporto
              ? "Crea nuovi agenti immobiliari o account di supporto per la tua agenzia."
              : "Crea nuovi agenti immobiliari per la tua agenzia."}
          </p>
        </div>

        {targetRole ? (
          <AddStaff
            targetRole={targetRole}
            onCancel={() => setTargetRole(null)}
          />
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setTargetRole("Agente")}
              className="w-full bg-white border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 rounded-2xl p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🏠</span>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-red-600">Agente Immobiliare</p>
                  <p className="text-sm text-gray-500">Può caricare immobili, gestire offerte e inserire offerte manuali.</p>
                </div>
              </div>
            </button>

            {canCreateSupporto && (
              <button
                onClick={() => setTargetRole("Supporto")}
                className="w-full bg-white border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">👥</span>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-red-600">Account Supporto</p>
                    <p className="text-sm text-gray-500">Può creare agenti e monitorare l&apos;attività dell&apos;agenzia.</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}