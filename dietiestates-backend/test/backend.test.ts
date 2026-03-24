import pool from '../src/config/db';
import axios from 'axios';
import { searchImmobili } from '../src/dao/ImmobileDAO';
import { updateAgenziaDB } from '../src/dao/AgenziaDAO';
import { createOfferta } from '../src/dao/OffertaDAO';
import { getNearbyPlaces } from '../src/utils/geoapify';

jest.mock('../src/config/db');
jest.mock('axios');

describe('Backend unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ImmobileDAO.searchImmobili', () => {
    it('builds query with filters and distance, returns serviziVicinati calculation', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{
          idimmobile: 1,
          scuolevicine: false,
          parchivicini: true,
          trasportipubblicivicini: false,
          prezzo: '150000',
          dimensioni: '80',
          latitudine: '45.0',
          longitudine: '9.0',
          dataCreazione: new Date(),
        }],
      });

      const filter = {
        tipologia: 'Appartamento',
        prezzoMin: '100000',
        prezzoMax: '200000',
        numeroStanze: '2',
        citta: 'Milano',
        latitudine: '45.0',
        longitudine: '9.0',
        raggioKm: '5',
        orderBy: 'Prezzo',
        orderDir: 'ASC',
        limit: 10,
        offset: 0,
      };

      const result = await searchImmobili(filter);

      expect(pool.query).toHaveBeenCalled();
      const queryString = (pool.query as jest.Mock).mock.calls[0][0] as string;
      const queryValues = (pool.query as jest.Mock).mock.calls[0][1] as any[];

      expect(queryString).toContain('WHERE');
      expect(queryString).toContain('Tipologia = $1');
      expect(queryString).toContain('Prezzo >= $2');
      expect(queryString).toContain('distanza');
      expect(queryString).toContain('ORDER BY Prezzo ASC');
      expect(queryValues).toEqual([
        'Appartamento',
        100000,
        200000,
        2,
        '%Milano%',
        45,
        9,
        5,
        10,
        0,
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].serviziVicinati).toBe(true);
      expect(result[0].prezzo).toBe('150000');
      expect(result[0].dimensioni).toBe('80');
    });
  });

  describe('AgenziaDAO.updateAgenziaDB', () => {
    it('updates allowed fields and returns record', async () => {
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

    it('throws if no valid fields provided', async () => {
      await expect(updateAgenziaDB(5, { idAmministratore: 99 } as any)).rejects.toThrow('Nessun campo valido da aggiornare');
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('OffertaDAO.createOfferta', () => {
    it('creates offerta through insertOfferta with offertaManuale false', async () => {
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
      expect(offerta.offertaManuale).toBe(false);
    });
  });

  describe('geoapify.getNearbyPlaces', () => {
    it('returns aggregated places for categories', async () => {
      process.env.GEOAPIFY_KEY = 'testkey';

      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { features: [{ properties: { name: 'Scuola ABC', distance: 100, categories: ['education.school'] } }] } })
        .mockResolvedValueOnce({ data: { features: [] } })
        .mockResolvedValueOnce({ data: { features: [{ properties: { name: 'Fermata Bus', distance: 300, categories: ['public_transport.bus_stop'] } }] } });

      const places = await getNearbyPlaces(45.0, 9.0, 500);
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(places).toHaveLength(2);
      expect(places.map(p => p.name)).toEqual(['Scuola ABC', 'Fermata Bus']);
    });

    it('throws when api key missing', async () => {
      delete process.env.GEOAPIFY_KEY;
      await expect(getNearbyPlaces(45.0, 9.0)).rejects.toThrow('Chiave Geoapify mancante');
    });
  });
});
