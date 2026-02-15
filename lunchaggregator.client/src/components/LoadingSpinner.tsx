interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Ładowanie...' }: LoadingSpinnerProps) {
  return (
    <div className="loading">{message}</div>
  );
}
