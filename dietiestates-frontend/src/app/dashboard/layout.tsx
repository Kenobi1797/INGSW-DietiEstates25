"use client";

import { useUser } from "@/Context/Context"; // Importa il tuo hook specifico
import { getMenuForRole } from "@/Constants/NavbarLinks";
import AgencyBar from "@/components/AgencyBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authuser } = useUser();

  const agencyLinks = getMenuForRole(authuser?.ruolo || null);

  return (
    <div className="min-h-screen flex flex-col">
      <AgencyBar items={agencyLinks} />

      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}