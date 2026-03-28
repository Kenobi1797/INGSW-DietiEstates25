import React from 'react';
import Spinner from './Spinner';

interface BaseButtonProps {
  readonly action?: () => void;
  readonly className?: string;
  readonly children: React.ReactNode;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly type?: 'button' | 'submit' | 'reset';
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
