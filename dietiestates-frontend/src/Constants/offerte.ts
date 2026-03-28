export type StatoOfferta = 'InAttesa' | 'Accettata' | 'Rifiutata' | 'Controproposta' | 'Ritirata';

export const STATO_CONFIG: Record<StatoOfferta, { label: string; classes: string; dot: string }> = {
  InAttesa: { label: 'In Attesa', classes: 'bg-yellow-50 border-yellow-300 text-yellow-800', dot: 'bg-yellow-400' },
  Accettata: { label: 'Accettata', classes: 'bg-green-50 border-green-300 text-green-800', dot: 'bg-green-500' },
  Rifiutata: { label: 'Rifiutata', classes: 'bg-red-50 border-red-300 text-red-700', dot: 'bg-red-500' },
  Controproposta: { label: 'Controproposta', classes: 'bg-blue-50 border-blue-300 text-blue-800', dot: 'bg-blue-500' },
  Ritirata: { label: 'Ritirata', classes: 'bg-gray-50 border-gray-200 text-gray-500', dot: 'bg-gray-400' },
};

export const STATO_FALLBACK = {
  label: 'Sconosciuto',
  classes: 'bg-gray-50 border-gray-200 text-gray-700',
  dot: 'bg-gray-400',
};

export const formatEuro = (amount: number | undefined): string =>
  amount === undefined ? '0' : amount.toLocaleString('it-IT');

export const formatDateIt = (dateIso: string): string =>
  new Date(dateIso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
