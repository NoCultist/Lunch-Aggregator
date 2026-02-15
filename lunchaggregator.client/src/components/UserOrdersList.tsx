import type { Order } from '../types';

interface UserOrdersListProps {
  orders: Order[];
  userName: string;
  onRefresh: () => void;
  onDeleteOrder: (orderId: number) => void;
}

export function UserOrdersList({ orders, userName, onRefresh, onDeleteOrder }: UserOrdersListProps) {
  // Prefer client id when available, but fall back to name matching for backward compatibility
  const userOrders = orders.filter(order => {
    if (order.personClientId) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return order.personClientId === (localStorage.getItem('lunch_aggregator_client_id') || undefined);
    }
    return order.personName === userName;
  });
  const totalAmount = userOrders.reduce((sum, order) => sum + order.dishPrice, 0);

  if (userOrders.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '30px', padding: '20px', background: '#f0f8ff', borderRadius: '10px', border: '1px solid #b3d9ff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: '#004085', margin: 0 }}>
          📝 Twoje zamówienia ({userOrders.length})
        </h3>
        <button 
          onClick={onRefresh}
          style={{
            padding: '6px 12px',
            fontSize: '0.85rem',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Odśwież
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {userOrders.map((order, index) => (
          <div 
            key={order.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: 'white',
              borderRadius: '6px',
              border: '1px solid #d0e8ff'
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{ color: '#666', fontSize: '0.85rem' }}>#{index + 1}</span>
              <span style={{ marginLeft: '12px', fontWeight: 500, color: '#333' }}>
                {order.dishName}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 'bold', color: '#0066cc', fontSize: '1.05rem' }}>
                {order.dishPrice.toFixed(2)} zł
              </span>
              <button
                onClick={() => onDeleteOrder(order.id)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title="Usuń zamówienie"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: 'white', 
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '2px solid #0066cc'
      }}>
        <span style={{ fontWeight: 600, color: '#004085' }}>Do zapłaty:</span>
        <span style={{ fontWeight: 'bold', color: '#0066cc', fontSize: '1.3rem' }}>
          {totalAmount.toFixed(2)} zł
        </span>
      </div>

      <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
        💡 Możesz usunąć swoje zamówienia klikając 🗑️. Organizator widzi wszystkie w raporcie.
      </p>
    </div>
  );
}
