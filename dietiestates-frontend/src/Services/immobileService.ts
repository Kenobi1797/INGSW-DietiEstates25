import { Immobile } from "@/Models/Immobili";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createImmobile(immobileData: Immobile, idAgente: number): Promise<Immobile> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Token mancante');

  const response = await fetch(`${API_URL}/immobili`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...immobileData,
      idAgente,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Errore nella creazione dell\'immobile');
  }

  return response.json();
}