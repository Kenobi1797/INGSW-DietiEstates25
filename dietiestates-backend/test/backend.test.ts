import pool from '../src/config/db';
import axios from 'axios';
import { updateStatoOfferta, createOfferta } from '../src/dao/OffertaDAO';
import { assignUserToAgency } from '../src/dao/UtenteDAO';
import { getNearbyPlaces } from '../src/utils/geoapify';

jest.mock('../src/config/db');
jest.mock('axios');

describe('Backend unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Metodo 1: updateStatoOfferta(idOfferta, nuovoStato) - 2 parametri
  describe('OffertaDAO.updateStatoOfferta', () => {
    it('aggiorna lo stato dell\'offerta e restituisce il record aggiornato', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{
          idofferta: 42,
          idimmobile: 10,
          idutente: 5,
          prezzoofferto: '200000',
          stato: 'Accettata',
          dataofferta: new Date('2025-04-01T10:00:00Z'),
          offertamanuale: false,
          idoffertaoriginale: null,
        }],
      });

      const updated = await updateStatoOfferta(42, 'Accettata');

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE offerta SET stato = $1 WHERE idofferta = $2 RETURNING *',
        ['Accettata', 42]
      );
      expect(updated.stato).toBe('Accettata');
      expect(updated.idOfferta).toBe(42);
      expect(updated.prezzoOfferto).toBe(200000);
    });
  });

  // Metodo 2: assignUserToAgency(idUtente, idAgenzia) - 2 parametri
  describe('UtenteDAO.assignUserToAgency', () => {
    it('assegna un utente a un\'agenzia e restituisce l\'utente aggiornato', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{
          idutente: 7,
          nome: 'Mario',
          cognome: 'Rossi',
          email: 'mario@example.com',
          passwordhash: 'hashedpwd',
          ruolo: 'Agente',
          idagenzia: 3,
          datacreazione: new Date('2025-01-15T10:00:00Z'),
        }],
      });

      const updated = await assignUserToAgency(7, 3);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE Utente'),
        [3, 7]
      );
      expect(updated?.idUtente).toBe(7);
      expect(updated?.idAgenzia).toBe(3);
      expect(updated?.ruolo).toBe('Agente');
    });

    it('restituisce null se l\'utente non esiste o non è Agente/Supporto', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await assignUserToAgency(999, 3);

      expect(result).toBeNull();
    });
  });

  // Metodo 3: createOfferta(idImmobile, idUtente, prezzoOfferto) - 3 parametri
  describe('OffertaDAO.createOfferta', () => {
    it('crea un\'offerta con offertaManuale false e restituisce il DTO validato', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{
          idofferta: 100,
          idimmobile: 50,
          idutente: 20,
          prezzoofferto: '90000',
          stato: 'InAttesa',
          dataofferta: new Date('2025-03-01T10:00:00Z'),
          offertamanuale: false,
          idoffertaoriginale: null,
        }],
      });

      const offerta = await createOfferta(50, 20, 90000);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO offerta'),
        [50, 20, 90000, false, null]
      );
      expect(offerta.idOfferta).toBe(100);
      expect(offerta.prezzoOfferto).toBe(90000);
      expect(offerta.offertaManuale).toBe(false);
    });
  });

  // Metodo 4: getNearbyPlaces(lat, lon, radius) - 3 parametri
  describe('geoapify.getNearbyPlaces', () => {
    it('restituisce i luoghi vicini aggregati per categoria', async () => {
      const previousKey = process.env.GEOAPIFY_KEY;
      const previousApiKey = process.env.GEOAPIFY_API_KEY;
      process.env.GEOAPIFY_KEY = 'testkey';
      delete process.env.GEOAPIFY_API_KEY;

      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { features: [{ properties: { name: 'Scuola ABC', distance: 100, categories: ['education.school'] } }] } })
        .mockResolvedValueOnce({ data: { features: [] } })
        .mockResolvedValueOnce({ data: { features: [{ properties: { name: 'Fermata Bus', distance: 300, categories: ['public_transport.bus_stop'] } }] } });

      const places = await getNearbyPlaces(45, 9, 500);
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(places).toHaveLength(2);
      expect(places.map(p => p.name)).toEqual(['Scuola ABC', 'Fermata Bus']);

      if (previousKey === undefined) delete process.env.GEOAPIFY_KEY;
      else process.env.GEOAPIFY_KEY = previousKey;

      if (previousApiKey === undefined) delete process.env.GEOAPIFY_API_KEY;
      else process.env.GEOAPIFY_API_KEY = previousApiKey;
    });

    it('lancia un\'eccezione se la chiave API e mancante', async () => {
      const previousKey = process.env.GEOAPIFY_KEY;
      const previousApiKey = process.env.GEOAPIFY_API_KEY;
      delete process.env.GEOAPIFY_KEY;
      delete process.env.GEOAPIFY_API_KEY;
      await expect(getNearbyPlaces(45, 9)).rejects.toThrow('Chiave Geoapify mancante');

      if (previousKey === undefined) delete process.env.GEOAPIFY_KEY;
      else process.env.GEOAPIFY_KEY = previousKey;

      if (previousApiKey === undefined) delete process.env.GEOAPIFY_API_KEY;
      else process.env.GEOAPIFY_API_KEY = previousApiKey;
    });
  });
});
