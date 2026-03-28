

interface SpinnerProps {
  readonly className?: string;
}

export default function Spinner({ className = '' }: SpinnerProps) {

  return <div className={`spinner ${className}`} />;
  
}
