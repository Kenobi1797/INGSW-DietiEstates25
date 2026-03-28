"use client";

/**
 * PrezzoInput — input numerico con formattazione italiana (es. 150.000)
 * Props:
 *  - value: number
 *  - onChange: (value: number) => void
 *  - placeholder?: string
 *  - required?: boolean
 *  - min?: number
 *  - className?: string
 *  - id? / name? per accessibilità
 */
interface PrezzoInputProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly min?: number;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
}

function formatPrezzo(n: number): string {
  if (!n && n !== 0) return '';
  return n.toLocaleString('it-IT');
}

function parsePrezzo(s: string): number {
  // Rimuove tutti i punti separatori delle migliaia; sostituisce la virgola decimale con punto
  const cleaned = s.replaceAll('.', '').replaceAll(',', '.');
  const val = Number.parseFloat(cleaned);
  return Number.isNaN(val) ? 0 : val;
}

export default function PrezzoInput({
  value,
  onChange,
  placeholder = 'Es. 150.000',
  required = false,
  min = 0,
  className = '',
  id,
  name,
}: PrezzoInputProps) {
  // Valore mostrato nell'input come stringa formattata
  const displayValue = value > 0 ? formatPrezzo(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Accetta solo cifre, punti e virgola
    const sanitized = raw.replace(/[^0-9.,]/g, '');
    const numeric = parsePrezzo(sanitized);
    if (numeric >= (min ?? 0)) onChange(numeric);
    else onChange(0);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      id={id}
      name={name}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      className={className}
    />
  );
}
