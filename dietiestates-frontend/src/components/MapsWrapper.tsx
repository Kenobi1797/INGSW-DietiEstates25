import dynamic from 'next/dynamic';

export const EstateMap = dynamic(() => import('./EstateMap'), {
  ssr: false,
  loading: () => <p>Caricamento mappa...</p>,
});

export const MapSearch = dynamic(() => import('./MapSearch'), {
  ssr: false,
  loading: () => <p>Caricamento mappa...</p>,
});