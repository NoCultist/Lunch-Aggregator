import type { Dish } from '../types';

interface OrderConfirmationProps {
  dish: Dish;
  userName: string;
  loading: boolean;
  onConfirm: () => void;
}

export function OrderConfirmation({ dish, userName, loading, onConfirm }: OrderConfirmationProps) {
  return (
    <div style={{ marginTop: '24px', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
      <h3 style={{ marginBottom: '16px' }}>Potwierdź zamówienie</h3>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        <strong>{userName}</strong> zamawia: <strong>{dish.name}</strong> ({dish.price.toFixed(2)} zł)
      </p>
      <button
        className="btn btn-primary"
        onClick={onConfirm}
        disabled={loading}
        style={{ fontSize: '1.1rem', padding: '14px 28px' }}
      >
        {loading ? 'Zamawianie...' : '✓ Potwierdź zamówienie'}
      </button>
    </div>
  );
}
