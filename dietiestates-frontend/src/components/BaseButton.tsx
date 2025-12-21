import React from 'react';
import Spinner from './Spinner';

interface BaseButtonProps {
  action?: () => void;
  className?: string;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset'; // aggiunto type
}

export default function BaseButton({
  action = () => {},
  className = '',
  children,
  loading = false,
  disabled = false,
  type = 'button', // valore di default
}: BaseButtonProps) {
  return (
    <button
      type={type} // ora usa il prop
      onClick={action}
      className={`default-button ${className}${loading ? ' loading' : ''}${disabled ? ' disabled' : ''}`}
      disabled={disabled}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
