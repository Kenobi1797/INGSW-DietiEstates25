"use client";

import StaffCreationPage from "@/components/StaffCreationPage";

export default function CreaSupportoPage() {
  return (
    <StaffCreationPage
      targetRole="Supporto"
      title="Crea Supporto"
      description="Inserisci i dati del nuovo account supporto della tua agenzia."
      allowedRoles={["AmministratoreAgenzia"]}
    />
  );
}