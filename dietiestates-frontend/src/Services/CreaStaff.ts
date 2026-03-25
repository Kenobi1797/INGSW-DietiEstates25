function getToken(): string {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("Utente non autenticato");
  return token;
}

interface CreateStaffData {
  nome: string;
  cognome: string;
  email: string;
  password: string;
}

export async function createAgente(formData: CreateStaffData, idAgenzia: number) {
  const res = await fetch('/api/utenti/agente', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ ...formData, idAgenzia })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore durante la creazione dell'agente");
  return data;
}

export async function createSupporto(formData: CreateStaffData) {
  const res = await fetch('/api/utenti/supporto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore durante la creazione del supporto");
  return data;
}