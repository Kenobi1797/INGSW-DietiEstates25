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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-agent`, {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-support`, {
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