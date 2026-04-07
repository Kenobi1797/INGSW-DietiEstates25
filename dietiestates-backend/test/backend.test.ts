import pool from '../src/config/db';
import axios from 'axios';
import bcrypt from 'bcrypt';
import {
  updateStatoOfferta,
  createOfferta,
  createManualOfferta,
  isImmobileInVendita,
  getImmobileVendutoState,
  hasAcceptedOffertaForImmobile,
  markImmobileAsVenduto,
  rejectPendingOfferteForImmobile,
  getOffertePerImmobile,
  getOffertePerUtente,
  getOffertePerAgente,
  getOffertePerAgenzia,
  getAllOfferte,
  getControffertePerCliente,
  getOffertaById,
} from '../src/dao/OffertaDAO';
import {
  assignUserToAgency,
  checkEmailExists,
  getUtenteByEmail,
  getUtenteById,
  getStaffUsers,
  changePassword,
  createCliente,
  createAgent,
  createSupport,
  getOrCreateManualCliente,
} from '../src/dao/UtenteDAO';
import { getNearbyPlaces } from '../src/utils/geoapify';

jest.mock('../src/config/db');
jest.mock('axios');
jest.mock('bcrypt');

const offertaRow = (overrides: Record<string, unknown> = {}) => ({
  idofferta: 1,
  idimmobile: 10,
  idutente: 5,
  prezzoofferto: '100000',
  stato: 'InAttesa',
  dataofferta: new Date('2025-04-01T10:00:00Z'),
  offertamanuale: false,
  idoffertaoriginale: null,
  titolo: 'Bilocale',
  indirizzo: 'Via Roma 1',
  ...overrides,
});

const utenteRow = (overrides: Record<string, unknown> = {}) => ({
  idutente: 7,
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario@example.com',
  passwordhash: 'hashedpwd',
  ruolo: 'Agente',
  idagenzia: 3,
  datacreazione: new Date('2025-01-15T10:00:00Z'),
  ...overrides,
});

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

  describe('OffertaDAO.altri metodi', () => {
    it('createManualOfferta crea una controfferta manuale con riferimento originale', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [offertaRow({ idofferta: 2, offertamanuale: true, idoffertaoriginale: 9, stato: 'Controproposta' })],
      });

      const result = await createManualOfferta(10, 5, 120000, 9);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO offerta'),
        [10, 5, 120000, true, 9]
      );
      expect(result.offertaManuale).toBe(true);
      expect(result.idOffertaOriginale).toBe(9);
    });

    it('isImmobileInVendita restituisce true/false in base alla tipologia', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ tipologia: 'Vendita' }] })
        .mockResolvedValueOnce({ rows: [{ tipologia: 'Affitto' }] });

      await expect(isImmobileInVendita(1)).resolves.toBe(true);
      await expect(isImmobileInVendita(2)).resolves.toBe(false);
    });

    it('getImmobileVendutoState gestisce immobile non trovato e trovato', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ venduto: 1 }] });

      await expect(getImmobileVendutoState(1)).resolves.toBeNull();
      await expect(getImmobileVendutoState(2)).resolves.toBe(true);
    });

    it('hasAcceptedOffertaForImmobile gestisce presenza e assenza di accettate', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(hasAcceptedOffertaForImmobile(10, 7)).resolves.toBe(true);
      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("stato = 'Accettata'"),
        [10, 7]
      );
      await expect(hasAcceptedOffertaForImmobile(10)).resolves.toBe(false);
    });

    it('markImmobileAsVenduto e rejectPendingOfferteForImmobile eseguono gli update', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await markImmobileAsVenduto(10);
      await rejectPendingOfferteForImmobile(10, 2);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('SET venduto = true'),
        [10]
      );
      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("SET stato = 'Rifiutata'"),
        [10, 2]
      );
    });

    it('get*Offerte mappa correttamente gli array di righe', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [offertaRow({ idofferta: 11 })] })
        .mockResolvedValueOnce({ rows: [offertaRow({ idofferta: 12 })] })
        .mockResolvedValueOnce({ rows: [offertaRow({ idofferta: 13 })] })
        .mockResolvedValueOnce({ rows: [offertaRow({ idofferta: 14 })] })
        .mockResolvedValueOnce({ rows: [offertaRow({ idofferta: 15 })] })
        .mockResolvedValueOnce({ rows: [offertaRow({ idofferta: 16, idoffertaoriginale: 11 })] });

      await expect(getOffertePerImmobile(10)).resolves.toHaveLength(1);
      await expect(getOffertePerUtente(5)).resolves.toHaveLength(1);
      await expect(getOffertePerAgente(7)).resolves.toHaveLength(1);
      await expect(getOffertePerAgenzia(3)).resolves.toHaveLength(1);
      await expect(getAllOfferte()).resolves.toHaveLength(1);
      await expect(getControffertePerCliente(5)).resolves.toHaveLength(1);
    });

    it('getOffertaById gestisce not found e found', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [offertaRow({ idofferta: 99, prezzoofferto: '155000' })] });

      await expect(getOffertaById(99)).resolves.toBeNull();
      await expect(getOffertaById(100)).resolves.toMatchObject({ idOfferta: 99, prezzoOfferto: 155000 });
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

  describe('UtenteDAO.altri metodi', () => {
    it('checkEmailExists restituisce true/false', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ idutente: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(checkEmailExists('a@a.it')).resolves.toBe(true);
      await expect(checkEmailExists('b@b.it')).resolves.toBe(false);
    });

    it('getUtenteByEmail e getUtenteById gestiscono found/not found', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [utenteRow({ idutente: 20 })] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [utenteRow({ idutente: 21 })] });

      await expect(getUtenteByEmail('x@y.it')).resolves.toBeNull();
      await expect(getUtenteByEmail('mario@example.com')).resolves.toMatchObject({ idUtente: 20 });
      await expect(getUtenteById(0)).resolves.toBeNull();
      await expect(getUtenteById(21)).resolves.toMatchObject({ idUtente: 21 });
    });

    it('getStaffUsers restituisce lista staff mappata', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [utenteRow({ ruolo: 'Supporto', idutente: 30 })] });
      const staff = await getStaffUsers();
      expect(staff).toHaveLength(1);
      expect(staff[0].ruolo).toBe('Supporto');
    });

    it('changePassword calcola hash e aggiorna DB', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await changePassword(7, 'NuovaPassword!1');

      expect(bcrypt.hash).toHaveBeenCalledWith('NuovaPassword!1', 10);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE Utente SET PasswordHash = $1 WHERE IdUtente = $2',
        ['new-hash', 7]
      );
    });

    it('createCliente/createAgent/createSupport mappano correttamente il risultato', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash123');
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [utenteRow({ ruolo: 'Cliente', idutente: 40, idagenzia: null })] })
        .mockResolvedValueOnce({ rows: [utenteRow({ ruolo: 'Agente', idutente: 41, idagenzia: 9 })] })
        .mockResolvedValueOnce({ rows: [utenteRow({ ruolo: 'Supporto', idutente: 42, idagenzia: null })] });

      const cliente = await createCliente({ nome: 'C', cognome: 'L', email: 'c@l.it', password: 'pwd' });
      const agente = await createAgent({ nome: 'A', cognome: 'G', email: 'a@g.it', password: 'pwd', idAgenzia: 9 });
      const supporto = await createSupport({ nome: 'S', cognome: 'U', email: 's@u.it', password: 'pwd', idAgenzia: null });

      expect(cliente.ruolo).toBe('Cliente');
      expect(agente.idAgenzia).toBe(9);
      expect(supporto.ruolo).toBe('Supporto');
    });

    it('getOrCreateManualCliente usa utente esistente o lo crea se assente', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('manual-hash');
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ idutente: 77 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ idutente: 88 }] });

      await expect(getOrCreateManualCliente()).resolves.toBe(77);
      await expect(getOrCreateManualCliente()).resolves.toBe(88);
      expect(bcrypt.hash).toHaveBeenCalledWith('ClienteManuale123!', 10);
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

    it('continua con le altre categorie se una chiamata Geoapify fallisce', async () => {
      const previousKey = process.env.GEOAPIFY_KEY;
      process.env.GEOAPIFY_KEY = 'testkey';
      const spyErr = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      (axios.get as jest.Mock)
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce({ data: { features: [{ properties: { name: 'Parco', distance: 200, categories: ['leisure.park'] } }] } })
        .mockResolvedValueOnce({ data: { features: [] } });

      const places = await getNearbyPlaces(45, 9, 300);
      expect(places).toHaveLength(1);
      expect(places[0].name).toBe('Parco');
      expect(spyErr).toHaveBeenCalled();

      spyErr.mockRestore();
      if (previousKey === undefined) delete process.env.GEOAPIFY_KEY;
      else process.env.GEOAPIFY_KEY = previousKey;
    });

    it('usa fallback per name vuoto e type categoria quando categories non esiste', async () => {
      const previousKey = process.env.GEOAPIFY_KEY;
      process.env.GEOAPIFY_KEY = 'testkey';

      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { features: [{ properties: { distance: 50 } }] } })
        .mockResolvedValueOnce({ data: { features: [] } })
        .mockResolvedValueOnce({ data: { features: [] } });

      const places = await getNearbyPlaces(45, 9, 300);
      expect(places).toHaveLength(1);
      expect(places[0].name).toBe('');
      expect(places[0].type).toBe('education.school');

      if (previousKey === undefined) delete process.env.GEOAPIFY_KEY;
      else process.env.GEOAPIFY_KEY = previousKey;
    });
  });
});
