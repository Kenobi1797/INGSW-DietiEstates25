"use client";

import React, { useState } from 'react';
import { Immobile } from '@/Models/Immobili';
import { EstateMap } from '@/components/MapsWrapper';
import RicercaIndirizzo from '@/components/SearchInd';
import { createImmobile } from '@/Services/immobileService';
import { useUser } from '@/Context/Context';
import { useRouter } from 'next/navigation';

export default function PaginaCaricamentoImmobile() {
  const { authuser } = useUser();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [foto, setFoto] = useState<File[]>([]);
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

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFoto(Array.from(e.target.files));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    let finalValue: string | number | boolean = type === 'checkbox' ? checked : value;

    if (type === 'number' || name === 'prezzo') {
      const numValue = Number(value);
      finalValue = numValue >= 0 ? numValue : 0;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authuser?.id) {
      setError('Utente non autenticato');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fotoUrls = foto.length > 0 ? foto.map((f) => URL.createObjectURL(f)) : [];

      await createImmobile(
        {
          ...formData,
          fotoUrls,
        },
        authuser.id
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
              <input
                type="text"
                name="titolo"
                placeholder="Titolo annuncio"
                value={formData.titolo}
                onChange={handleChange}
                required
              />

              <textarea
                name="descrizione"
                placeholder="Descrizione dell'immobile"
                value={formData.descrizione}
                onChange={handleChange}
                rows={4}
                required
              />

              <div className="grid-2">
                <input
                  type="number"
                  name="prezzo"
                  placeholder="Prezzo (€)"
                  min="0"
                  value={formData.prezzo || ''}
                  onChange={handleChange}
                  required
                />
                <select
                  name="tipologia"
                  value={formData.tipologia}
                  onChange={handleChange}
                  required
                >
                  <option value="Vendita">Vendita</option>
                  <option value="Affitto">Affitto</option>
                </select>
              </div>

              <select
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
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="grid-2">
                <input
                  type="number"
                  name="dimensioni"
                  placeholder="Mq"
                  min="0"
                  value={formData.dimensioni || ''}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="numeroStanze"
                  placeholder="N. stanze"
                  min="0"
                  value={formData.numeroStanze || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="grid-2">
                <input
                  type="number"
                  name="numeroBagni"
                  placeholder="N. bagni"
                  min="0"
                  value={formData.numeroBagni || ''}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="piano"
                  placeholder="Piano"
                  value={formData.piano || ''}
                  onChange={handleChange}
                />
              </div>

              <select name="riscaldamento" value={formData.riscaldamento} onChange={handleChange}>
                <option value="">Riscaldamento</option>
                <option value="Autonomo">Autonomo</option>
                <option value="Centralizzato">Centralizzato</option>
                <option value="Pompa di calore">Pompa di calore</option>
                <option value="Altro">Altro</option>
              </select>

              <div className="checkbox-grid">
                {[
                  'ascensore',
                  'balcone',
                  'terrazzo',
                  'giardino',
                  'postoAuto',
                  'climatizzazione',
                  'cantina',
                  'portineria'
                ].map((name) => (
                  <label key={name} className="check-item">
                    <input
                      type="checkbox"
                      name={name}
                      checked={(formData as any)[name] || false}
                      onChange={handleChange}
                    />
                    {name.replace(/([A-Z])/g, ' $1')}
                  </label>
                ))}
              </div>

              <div>
                <label className="label">Foto</label>
                <input type="file" multiple accept="image/*" onChange={handleFoto} />
                {foto.length > 0 && <small>{foto.length} file selezionati</small>}
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="map-block">
              <p>Seleziona l'indirizzo o utilizza la ricerca mappa</p>
              <RicercaIndirizzo
                soloIndirizziPrecisi={true}
                onIndirizzoSelezionato={(lat, lon, indirizzo) => {
                  setFormData((prev) => ({ ...prev, latitudine: lat, longitudine: lon, indirizzo }));
                }}
              />
              <EstateMap immobili={[]} center={[formData.latitudine, formData.longitudine]} />
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
