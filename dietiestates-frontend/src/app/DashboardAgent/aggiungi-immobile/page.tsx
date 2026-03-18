import React, { useState } from 'react';

export default function PaginaCaricamentoImmobile() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    prezzo: 0,
    tipologia: '', 
    classeEnergetica: '',
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    let finalValue: any = type === 'checkbox' ? checked : value;

    if (type === 'number' || name === 'prezzo') {
      const numValue = Number(value);
      if (name !== 'piano' && numValue < 0) {
        finalValue = 0;
      } else {
        finalValue = numValue;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  return (
    <main>
      <h1>Aggiungi Nuovo Immobile</h1>
      <p>Step {currentStep} di 3</p>

      {currentStep === 1 && (
        <form onSubmit={handleNext}>
          <h2>Informazioni di Base</h2>
          <input type="text" name="titolo" placeholder="Titolo Annuncio" value={formData.titolo} onChange={handleChange} required />
          
          <select name="tipologia" value={formData.tipologia} onChange={handleChange} required>
            <option value="" disabled hidden>Contratto</option>
            <option value="Vendita">Vendita</option>
            <option value="Affitto">Affitto</option>
          </select>

          <input type="number" name="prezzo" placeholder="Prezzo (€)" min="0" value={formData.prezzo || ''} onChange={handleChange} required />
          
          <select name="classeEnergetica" value={formData.classeEnergetica} onChange={handleChange} required>
            <option value="" disabled hidden>Classe Energetica</option>
            {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map(classe => (
              <option key={classe} value={classe}>{classe}</option>
            ))}
          </select>

          <textarea name="descrizione" placeholder="Descrizione..." value={formData.descrizione} onChange={handleChange} required />
          <button type="submit">Avanti</button>
        </form>
      )}

      {currentStep === 2 && (
        <section>
          <h2>Caratteristiche Tecniche</h2>
          <input type="number" name="dimensioni" placeholder="Dimensioni (mq)" min="0" value={formData.dimensioni || ''} onChange={handleChange} />
          <input type="number" name="numeroStanze" placeholder="Numero Stanze" min="0" value={formData.numeroStanze || ''} onChange={handleChange} />
          <input type="number" name="numeroBagni" placeholder="Numero Bagni" min="0" value={formData.numeroBagni || ''} onChange={handleChange} />
          <input type="number" name="piano" placeholder="Piano" value={formData.piano || ''} onChange={handleChange} />

          <select name="riscaldamento" value={formData.riscaldamento} onChange={handleChange}>
            <option value="" disabled hidden>Riscaldamento</option>
            <option value="Autonomo">Autonomo</option>
            <option value="Centralizzato">Centralizzato</option>
            <option value="Pompa di calore">Pompa di calore</option>
            <option value="Altro">Altro</option>
          </select>

          <div>
            <label><input type="checkbox" name="ascensore" checked={formData.ascensore} onChange={handleChange} /> Ascensore</label>
            <label><input type="checkbox" name="balcone" checked={formData.balcone} onChange={handleChange} /> Balcone</label>
            <label><input type="checkbox" name="terrazzo" checked={formData.terrazzo} onChange={handleChange} /> Terrazzo</label>
            <label><input type="checkbox" name="giardino" checked={formData.giardino} onChange={handleChange} /> Giardino</label>
            <label><input type="checkbox" name="postoAuto" checked={formData.postoAuto} onChange={handleChange} /> Posto Auto</label>
            <label><input type="checkbox" name="climatizzazione" checked={formData.climatizzazione} onChange={handleChange} /> Climatizzazione</label>
          </div>

          <button onClick={() => setCurrentStep(1)}>Indietro</button>
          <button onClick={() => setCurrentStep(3)}>Continua alla posizione</button>
        </section>
      )}

      {currentStep === 3 && (
        <div>
          <h2>Posizione e Foto</h2>
          <button onClick={() => setCurrentStep(2)}>Indietro</button>
          <button onClick={() => console.log("Dati finali:", formData)}>Invia al Backend</button>
        </div>
      )}
    </main>
  );
}