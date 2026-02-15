interface AlertMessageProps {
  type: 'success' | 'error' | 'info';
  text: string;
}

export function AlertMessage({ type, text }: AlertMessageProps) {
  return (
    <div className={`alert alert-${type}`}>
      {text}
    </div>
  );
}
