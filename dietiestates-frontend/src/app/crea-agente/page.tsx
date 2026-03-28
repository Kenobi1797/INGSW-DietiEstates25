"use client";

import StaffCreationPage from "@/components/StaffCreationPage";

export default function CreaAgentePage() {
  return (
    <StaffCreationPage
      targetRole="Agente"
      title="Crea Agente"
      description="Inserisci i dati del nuovo agente immobiliare della tua agenzia."
      allowedRoles={["AmministratoreAgenzia", "Supporto"]}
    />
  );
}