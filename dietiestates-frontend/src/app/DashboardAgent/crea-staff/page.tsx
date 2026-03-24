"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/Context/Context";
import AddStaff from "@/components/AddStaff";

export default function CreaStaffPage() {
  const { authuser } = useUser();

  const [targetRole, setTargetRole] = useState<"Agente" | "Supporto" | null>(null);

  useEffect(() => {
    if (authuser?.ruolo === "Supporto") {
      setTargetRole("Agente");
    }
  }, [authuser]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      
      {targetRole ? (
        <AddStaff 
          targetRole={targetRole} 
          onCancel={() => setTargetRole(null)} 
        />
      ) : (
        <div className="form">
          <h1 style={{ textTransform: 'uppercase', marginBottom: '20px' }}>
            Crea Staff
          </h1>
          
          <button 
            onClick={() => setTargetRole("Agente")}
            className="btn-primary"
            style={{ padding: '30px', marginBottom: '10px' }}
          >
            CREA AGENTE IMMOBILIARE
          </button>
        {authuser?.ruolo === "AmministratoreAgenzia" && (
          <button 
            onClick={() => setTargetRole("Supporto")}
            className="form button"
            style={{ padding: '30px' }}
          >
            CREA SUPPORTO
          </button>
        )}
        </div>
        
      )}
      
    </div>
  );
}