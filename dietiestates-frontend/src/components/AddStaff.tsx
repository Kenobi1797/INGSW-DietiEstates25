"use client";
import { useState } from "react";
import { useUser } from "@/Context/Context";
import { createAgente, createSupporto } from "@/Services/CreaStaff";
interface Props {
  targetRole: "Agente" | "Supporto";
  onCancel: () => void;
}

export default function AddStaff({ targetRole, onCancel }: Props) {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    password: ""
  });
  const { authuser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (targetRole === "Agente") {
        if (!authuser?.idAgenzia) return setError("ID agenzia mancante");
        await createAgente(formData, authuser.idAgenzia);
      } else {
        await createSupporto(formData);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ textTransform: 'uppercase', marginBottom: '8px' }}>
        Aggiungi {targetRole}
      </h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Inserisci i dati per creare il profilo di un nuovo collaboratore.
      </p>
       
       {error && <p style={{ color: 'red' }}>{error}</p>}
       {success && <p style={{ color: 'green' }}>{targetRole} creato con successo!</p>}
      <form className="form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nome"
          required
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
        />

        <input 
          type="text" 
          placeholder="Cognome"
          required
          value={formData.cognome}
          onChange={(e) => setFormData({...formData, cognome: e.target.value})}
        />
        
        <input 
          type="email" 
          placeholder="Email aziendale"
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input 
          type="password" 
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />

        <button type="submit" className="btn-primary">
          Registra {targetRole}
        </button>
        
        <button 
          type="button" 
          onClick={onCancel} 
          style={{ 
            backgroundColor: 'transparent', 
            border: 'none', 
            color: '#ef4444', 
            cursor: 'pointer',
            fontWeight: '600',
            textDecoration: 'underline'
          }}
        >
          Annulla e chiudi
        </button>
      </form>
    </div>
  );
}