"use client";

import React, { useState } from 'react';
import { Immobile } from '@/Models/Immobili';
import { EstateMap } from '@/components/MapsWrapper';
import RicercaIndirizzo from '@/components/SearchInd';
import { createImmobile } from '@/Services/immobileService';
import { useUser } from '@/Context/Context';
import { useRouter } from 'next/navigation';
import PrezzoInput from '@/components/PrezzoInput';
import { Home, Building2, Trees, Sofa, Camera } from 'lucide-react';

type FeatureOptionName = 'ascensore' | 'climatizzazione' | 'cantina' | 'portineria' | 'balcone' | 'terrazzo' | 'giardino' | 'postoAuto';

interface FeatureOption {
  name: FeatureOptionName;
  label: string;
}

const INTERNAL_FEATURES: FeatureOption[] = [
  { name: 'ascensore', label: 'Ascensore' },
  { name: 'climatizzazione', label: 'Climatizzazione' },
  { name: 'cantina', label: 'Cantina/Solaio' },
  { name: 'portineria', label: 'Portineria' },
];

const EXTERNAL_FEATURES: FeatureOption[] = [
  { name: 'balcone', label: 'Balcone' },
  { name: 'terrazzo', label: 'Terrazzo' },
  { name: 'giardino', label: 'Giardino' },
  { name: 'postoAuto', label: 'Posto auto/garage' },
];

export default function PaginaCaricamentoImmobile() {
  const { authuser } = useUser();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Immobile>({
    titolo: '',
    descrizione: '',
    prezzo: 0,
    tipologia: 'Vendita',
    classeEnergetica: 'A',
    dimensioni: 0,
    numeroStanze: 0,
    numeroBagni: 0,
    piano: 0,
    riscaldamento: '',
    ascensore: false,
    balcone: false,
    terrazzo: false,
    giardino: false,
    postoAuto: false,
    climatizzazione: false,
    cantina: false,
    portineria: false,
    indirizzo: '',
    latitudine: 0,
    longitudine: 0,
    fotoUrls: [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    let finalValue: string | number | boolean = type === 'checkbox' ? checked : value;

    if (type === 'number' || name === 'prezzo') {
      if (value === '' || value === '-') {
        // lascia il campo editabile
        setFormData((prev) => ({ ...prev, [name]: value as unknown as number }));
        return;
      }
      const numValue = Number(value);
      // Per il piano permettiamo valori negativi (piani interrati); per gli altri campi solo >= 0
      if (name === 'piano') {
        finalValue = Number.isNaN(numValue) ? 0 : numValue;
      } else {
        finalValue = Math.max(numValue, 0);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuovi = Array.from(e.target.files ?? []);
    setFotoFiles((prev) => {
      const nomiEsistenti = new Set(prev.map((f) => f.name + f.size));
      const daAggiungere = nuovi.filter((f) => !nomiEsistenti.has(f.name + f.size));
      return [...prev, ...daAggiungere];
    });
    e.target.value = '';
  };

  const removeFoto = (idx: number) => {
    setFotoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enter su un campo dei passi precedenti non deve attivare la submit
    if (currentStep < 3) return;

    if (!authuser?.idUtente) {
      setError('Utente non autenticato');
      return;
    }

    if (!formData.indirizzo || formData.latitudine === 0 || formData.longitudine === 0) {
      setError('Seleziona un indirizzo dalla mappa prima di procedere.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let fotoUrls: string[] = [];
      if (fotoFiles.length > 0) {
        const token = sessionStorage.getItem('token');
        const fd = new FormData();
        fotoFiles.forEach(f => fd.append('foto', f));
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/immobili/upload-foto`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token ?? ''}` },
          body: fd,
        });
        if (!uploadRes.ok) throw new Error('Errore nel caricamento delle foto');
        const uploadData = await uploadRes.json();
        fotoUrls = uploadData.urls ?? [];
      }

      await createImmobile(
        {
          ...formData,
          fotoUrls,
        },
        authuser.idUtente
      );

      alert('Immobile creato con successo!');
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Errore generico nella creazione immobile');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Dettagli generali', 'Caratteristiche', 'Posizione'];

  const renderFeatureCheckboxes = (options: FeatureOption[]) => (
    <div className="checkbox-grid">
      {options.map(({ name, label }) => (
        <label key={name} className="check-item">
          <input
            type="checkbox"
            name={name}
            checked={(formData as unknown as Record<string, boolean>)[name] ?? false}
            onChange={handleChange}
          />
          {label}
        </label>
      ))}
    </div>
  );

  return (
    <main className="immobile-page">
      <section className="immobile-card">
        <h1>Condividi il tuo immobile</h1>

        <div className="stepper">
          {stepTitles.map((label, idx) => (
            <div key={label} className={`step ${currentStep === idx + 1 ? 'active' : ''}`}>
              <div className="step-number">{idx + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <>
              <div className="form-field">
                <label className="field-label" htmlFor="titolo">Titolo annuncio</label>
                <input
                  id="titolo"
                  type="text"
                  name="titolo"
                  placeholder="Es. Trilocale luminoso vicino al centro"
                  value={formData.titolo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label" htmlFor="descrizione">Descrizione</label>
                <textarea
                  id="descrizione"
                  name="descrizione"
                  placeholder="Descrivi punti di forza, stato dell'immobile e servizi nelle vicinanze"
                  value={formData.descrizione}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="grid-2">
                <div className="form-field">
                  <label className="field-label" htmlFor="prezzo">Prezzo</label>
                  <PrezzoInput
                    value={formData.prezzo}
                    onChange={(val) => setFormData(prev => ({ ...prev, prezzo: val }))}
                    placeholder="Prezzo (€)"
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="tipologia">Tipologia annuncio</label>
                  <select
                    id="tipologia"
                    name="tipologia"
                    value={formData.tipologia}
                    onChange={handleChange}
                    required
                  >
                    <option value="Vendita">Vendita</option>
                    <option value="Affitto">Affitto</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label" htmlFor="classeEnergetica">Classe energetica</label>
                <select
                  id="classeEnergetica"
                  name="classeEnergetica"
                  value={formData.classeEnergetica}
                  onChange={handleChange}
                  required
                >
                  {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map((classe) => (
                    <option key={classe} value={classe}>
                      {classe}
                    </option>
                  ))}
                </select>
                <p className="field-help">
                  Indica la classe dell&apos;APE: A+/A = consumi piu bassi, G = consumi piu alti.
                </p>
                <div className="energy-legend" aria-hidden="true">
                  {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map((classe) => (
                    <span key={`legend-${classe}`} className={`energy-chip energy-${classe.replace('+', 'plus').toLowerCase()}`}>
                      {classe}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="caratteristiche-section">
              {/* Dimensioni e Stanze */}
              <div className="caratteristiche-group">
                <h3 className="group-title"><Home size={16} className="inline mr-1" />Dimensioni e Stanze</h3>
                <div className="grid-3">
                  <div className="form-field compact">
                    <label className="field-label" htmlFor="dimensioni">Superficie (mq)</label>
                    <input
                      id="dimensioni"
                      type="number"
                      name="dimensioni"
                      placeholder="Es. 95"
                      min="1"
                      value={formData.dimensioni || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field compact">
                    <label className="field-label" htmlFor="numeroStanze">Numero stanze</label>
                    <input
                      id="numeroStanze"
                      type="number"
                      name="numeroStanze"
                      placeholder="Es. 3"
                      min="1"
                      value={formData.numeroStanze || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field compact">
                    <label className="field-label" htmlFor="numeroBagni">Numero bagni</label>
                    <input
                      id="numeroBagni"
                      type="number"
                      name="numeroBagni"
                      placeholder="Es. 2"
                      min="1"
                      value={formData.numeroBagni || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Posizione nell'edificio */}
              <div className="caratteristiche-group">
                <h3 className="group-title"><Building2 size={16} className="inline mr-1" />Posizione</h3>
                <div className="grid-2">
                  <div className="form-field compact">
                    <label className="field-label" htmlFor="piano">Piano</label>
                    <input
                      id="piano"
                      type="number"
                      name="piano"
                      placeholder="0 = terra, -1 = interrato"
                      value={formData.piano ?? ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field compact">
                    <label className="field-label" htmlFor="riscaldamento">Riscaldamento</label>
                    <select id="riscaldamento" name="riscaldamento" value={formData.riscaldamento || ''} onChange={handleChange}>
                      <option value="">Seleziona riscaldamento</option>
                      <option value="Autonomo">Autonomo</option>
                      <option value="Centralizzato">Centralizzato</option>
                      <option value="Pompa di calore">Pompa di calore</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dotazioni interne */}
              <div className="caratteristiche-group">
                <h3 className="group-title"><Sofa size={16} className="inline mr-1" />Dotazioni Interne</h3>
                {renderFeatureCheckboxes(INTERNAL_FEATURES)}
              </div>

              {/* Spazi esterni */}
              <div className="caratteristiche-group">
                <h3 className="group-title"><Trees size={16} className="inline mr-1" />Spazi Esterni</h3>
                {renderFeatureCheckboxes(EXTERNAL_FEATURES)}
              </div>

              {/* Foto dell&apos;immobile */}
              <div className="caratteristiche-group">
                <h3 className="group-title"><Camera size={16} className="inline mr-1" />Foto dell&apos;immobile</h3>
                <label
                  htmlFor="foto-upload"
                  className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-white"
                >
                  <Camera size={28} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Clicca per selezionare le foto</span>
                  <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — max 5 MB — seleziona più file tenendo Ctrl/Cmd</span>
                  <input
                    id="foto-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
                {fotoFiles.length > 0 && (
                  <ul className="mt-3 space-y-2 immobile-photo-list">
                    {fotoFiles.map((f, i) => (
                      <li key={f.name + f.size} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2 immobile-photo-item">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(f)}
                          alt={f.name}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                        <span className="flex-1 min-w-0 text-sm text-gray-700 truncate immobile-photo-name">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFoto(i)}
                          className="text-red-400 hover:text-red-600 text-xs font-bold flex-shrink-0"
                          aria-label="Rimuovi foto"
                        >✕</button>
                      </li>
                    ))}
                  </ul>
                )}
                <small className="text-gray-400 block mt-2">Il sistema rileva automaticamente i servizi nelle vicinanze tramite Geoapify.</small>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="map-block">
              <p>Cerca via, numero civico e città dell&apos;immobile (es. Via Roma 12, Napoli).</p>
              <RicercaIndirizzo
                soloIndirizziPrecisi={true}
                onIndirizzoSelezionato={(lat, lon, indirizzo) => {
                  setFormData((prev) => ({ ...prev, latitudine: lat, longitudine: lon, indirizzo }));
                }}
              />
              {formData.indirizzo && (
                <p className="field-help" style={{ color: '#166534', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '8px 12px' }}>
                  📍 {formData.indirizzo}
                </p>
              )}
              <EstateMap lat={formData.latitudine} lon={formData.longitudine} />
            </div>
          )}

          <div className="actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setError(''); setCurrentStep((prev) => prev - 1); }}
              >
                Indietro
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => { setError(''); setCurrentStep((prev) => prev + 1); }}
              >
                Continua
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Caricamento...' : 'Crea Immobile'}
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
