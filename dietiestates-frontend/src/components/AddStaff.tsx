"use client";
import { useState } from "react";

interface Props {
  targetRole: "Agente" | "Supporto";
  onCancel: () => void;
}

export default function AddStaff({ targetRole, onCancel }: Props) {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Registrazione ${targetRole} in corso...`, formData);
  };

  return (
    <div>
      <h2 style={{ textTransform: 'uppercase', marginBottom: '8px' }}>
        Aggiungi {targetRole}
      </h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Inserisci i dati per creare il profilo di un nuovo collaboratore.
      </p>

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