// @/components/Search/FiltriAvanzati.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { classeEner } from '@/Types/ClasseEnergetica';

const TIPI_ENERGIA: classeEner[] = ["A+", "A", "B", "C", "D", "E", "F", "G"];

export interface AvanzatiFilterState {
  prezzoMin: string;
  prezzoMax: string;
  stanzeMin: string;
  stanzeMax: string;
  bagni: string;
  classeEnergetica: classeEner | "";
}

interface FiltriAvanzatiProps {
  readonly currentFiltri: AvanzatiFilterState;
  readonly onFiltriChange: (filtri: AvanzatiFilterState) => void;
  readonly onClose: () => void;
}

export default function FiltriAvanzati({ currentFiltri, onFiltriChange, onClose }: FiltriAvanzatiProps) {
  const [localFiltri, setLocalFiltri] = useState<AvanzatiFilterState>(currentFiltri);

  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setLocalFiltri(currentFiltri);
  }, [currentFiltri]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleChange = (field: keyof AvanzatiFilterState, value: string) => {
    setLocalFiltri(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    const emptyState: AvanzatiFilterState = {
      prezzoMin: '', prezzoMax: '', stanzeMin: '', stanzeMax: '', bagni: '', classeEnergetica: ''
    };
    setLocalFiltri(emptyState);
  };

  return (
      
      <div className="filtri-modal-container" ref={popupRef}>
        <div className="filtri-popup-content">
        
        <div className="filtri-header">
          <h4>Filtri Avanzati</h4>
          <button onClick={onClose} className="btn-close" aria-label="Chiudi">✕</button>
        </div>

        <div className="filtro-group">
          <label htmlFor="filtri-prezzoMin">Budget (€)</label>
          <div className="dual-input">
            <input 
              id="filtri-prezzoMin"
              type="number" placeholder="Min" 
              value={localFiltri.prezzoMin}
              onChange={(e) => handleChange('prezzoMin', e.target.value)}
            />
            <input 
              id="filtri-prezzoMax"
              type="number" placeholder="Max" 
              value={localFiltri.prezzoMax}
              onChange={(e) => handleChange('prezzoMax', e.target.value)}
            />
          </div>
        </div>

        <div className="filtro-group">
          <label htmlFor="filtri-stanzeMin">Numero di Stanze</label>
          <div className="dual-input">
            <input 
              id="filtri-stanzeMin"
              type="number" placeholder="Min" 
              value={localFiltri.stanzeMin}
              onChange={(e) => handleChange('stanzeMin', e.target.value)}
            />
            <input 
              id="filtri-stanzeMax"
              type="number" placeholder="Max" 
              value={localFiltri.stanzeMax}
              onChange={(e) => handleChange('stanzeMax', e.target.value)}
            />
          </div>
        </div>

        <div className="filtro-row">
          <div className="filtro-group">
            <label htmlFor="filtri-bagni">Bagni</label>
            <input 
              id="filtri-bagni"
              type="number" 
              placeholder="Es. 2"
              value={localFiltri.bagni}
              onChange={(e) => handleChange('bagni', e.target.value)}
            />
          </div>

          <div className="filtro-group">
            <label htmlFor="filtri-classeEnergetica">Classe Energetica</label>
            <select 
              id="filtri-classeEnergetica"
              value={localFiltri.classeEnergetica}
              onChange={(e) => handleChange('classeEnergetica', e.target.value as classeEner)}
            >
              <option value="">Tutte</option>
              {TIPI_ENERGIA.map((classe) => (
                <option key={classe} value={classe}>
                  {classe}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filtri-footer">
          <button className="btn-reset" onClick={handleReset}>
            Resetta
          </button>
          <button className="btn-apply" onClick={() => onFiltriChange(localFiltri)}>
            Applica
          </button>
        </div>
        </div>
      </div>
  );
}