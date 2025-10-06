import axios from 'axios';

const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY;

interface Place {
  name: string;
  distance: number; // metri
  type: string;
}

export async function getNearbyPlaces(lat: number, lon: number, radius: number = 1000): Promise<Place[]> {
  if (!GEOAPIFY_KEY) throw new Error('Chiave Geoapify mancante');

  // Filtra per scuole, parchi, fermate trasporto pubblico
  const categories = ['education.school', 'leisure.park', 'transport.public_transport'];

  const places: Place[] = [];

  for (const category of categories) {
    const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&apiKey=${GEOAPIFY_KEY}`;

    try {
      const res = await axios.get(url);
      const features = res.data.features;

      features.forEach((f: any) => {
        places.push({
          name: f.properties.name || '',
          distance: f.properties.distance,
          type: category
        });
      });
    } catch (err) {
      console.error(`Errore chiamando Geoapify per categoria ${category}:`, err);
    }
  }

  return places;
}
