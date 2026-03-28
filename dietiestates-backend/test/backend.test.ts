import pool from '../src/config/db';
import axios from 'axios';
import { updateStatoOfferta, createOfferta } from '../src/dao/OffertaDAO';
import { updateAgenziaDB } from '../src/dao/AgenziaDAO';
import { getNearbyPlaces } from '../src/utils/geoapify';

jest.mock('../src/config/db');
jest.mock('axios');

describe('Backend unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Metodo 1: updateStatoOfferta(idOfferta, nuovoStato) — 2 parametri
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

  // Metodo 2: updateAgenziaDB(idAgenzia, fields) — 2 parametri
  describe('AgenziaDAO.updateAgenziaDB', () => {
    it('aggiorna i campi consentiti e restituisce il record', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ idagenzia: 5, nome: 'Nuova', idamministratore: 11, attiva: false }],
      });

      const updated = await updateAgenziaDB(5, { nome: 'Nuova', attiva: false });

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE Agenzia SET "nome" = $1, "attiva" = $2 WHERE IdAgenzia = $3 RETURNING *',
        ['Nuova', false, 5]
      );
      expect(updated.nome).toBe('Nuova');
      expect(updated.attiva).toBe(false);
    });

    it('lancia un\'eccezione se non vengono forniti campi validi', async () => {
      await expect(updateAgenziaDB(5, { idAmministratore: 99 } as any)).rejects.toThrow('Nessun campo valido da aggiornare');
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  // Metodo 3: createOfferta(idImmobile, idUtente, prezzoOfferto) — 3 parametri
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

  // Metodo 4: getNearbyPlaces(lat, lon, radius) — 3 parametri
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

    it('lancia un\'eccezione se la chiave API è mancante', async () => {
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
