export async function fetchOfferteByImmobile<T>(idImmobile: string): Promise<T[]> {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Sessione non valida.');
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offerte/immobile/${idImmobile}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error('Errore nel caricamento offerte');
  }

  const data: unknown = await res.json();
  return Array.isArray(data) ? (data as T[]) : [];
}
