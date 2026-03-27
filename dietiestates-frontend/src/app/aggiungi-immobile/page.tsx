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
    latitudine: 41.9028,
    longitudine: 12.4964,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authuser?.idUtente) {
      setError('Utente non autenticato');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let fotoUrls: string[] = [];
      if (fotoFiles.length > 0) {
        const token = localStorage.getItem('token');
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
                  required
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
                  Indica la classe dell'APE: A+/A = consumi piu bassi, G = consumi piu alti.
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
                <div className="checkbox-grid">
                  {[
                    { name: 'ascensore', label: 'Ascensore' },
                    { name: 'climatizzazione', label: 'Climatizzazione' },
                    { name: 'cantina', label: 'Cantina/Solaio' },
                    { name: 'portineria', label: 'Portineria' },
                  ].map(({ name, label }) => (
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
              </div>

              {/* Spazi esterni */}
              <div className="caratteristiche-group">
                <h3 className="group-title"><Trees size={16} className="inline mr-1" />Spazi Esterni</h3>
                <div className="checkbox-grid">
                  {[
                    { name: 'balcone', label: 'Balcone' },
                    { name: 'terrazzo', label: 'Terrazzo' },
                    { name: 'giardino', label: 'Giardino' },
                    { name: 'postoAuto', label: 'Posto auto/garage' },
                  ].map(({ name, label }) => (
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
              </div>

              {/* Foto dell&apos;immobile: caricamento file */}
              <div className="caratteristiche-group">
                <h3 className="group-title"><Camera size={16} className="inline mr-1" />Foto dell&apos;immobile</h3>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setFotoFiles(Array.from(e.target.files ?? []))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                />
                {fotoFiles.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">{fotoFiles.length} foto selezionata/e</p>
                )}
                <small className="text-gray-400">Formati accettati: JPEG, PNG, WebP. Max 5 MB per foto. Il sistema rileva automaticamente i servizi nelle vicinanze tramite Geoapify.</small>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="map-block">
              <p>Seleziona l&apos;indirizzo preciso dell&apos;immobile (via, civico, citta)</p>
              <RicercaIndirizzo
                soloIndirizziPrecisi={true}
                onIndirizzoSelezionato={(lat, lon, indirizzo) => {
                  setFormData((prev) => ({ ...prev, latitudine: lat, longitudine: lon, indirizzo }));
                }}
              />
              <p className="field-help">
                Coordinate selezionate: {formData.latitudine.toFixed(5)}, {formData.longitudine.toFixed(5)}
              </p>
              <EstateMap lat={formData.latitudine} lon={formData.longitudine} />
            </div>
          )}

          <div className="actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Indietro
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setCurrentStep((prev) => prev + 1)}
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
