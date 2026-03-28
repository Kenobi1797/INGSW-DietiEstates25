"use client";

import { useUser } from "@/Context/Context";
import AddStaff from "@/components/AddStaff";

type AllowedRole = "AmministratoreAgenzia" | "Supporto";
type TargetRole = "Agente" | "Supporto";

interface StaffCreationPageProps {
  readonly targetRole: TargetRole;
  readonly title: string;
  readonly description: string;
  readonly allowedRoles: readonly AllowedRole[];
}

export default function StaffCreationPage({
  targetRole,
  title,
  description,
  allowedRoles,
}: StaffCreationPageProps) {
  const { authuser } = useUser();

  if (!authuser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Devi essere loggato per accedere a questa sezione.</p>
      </div>
    );
  }

  if (!allowedRoles.includes(authuser.ruolo as AllowedRole)) {
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
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>

        <AddStaff targetRole={targetRole} onCancel={() => window.history.back()} />
      </div>
    </div>
  );
}