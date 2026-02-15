import type { Session } from '../types';

interface JoinSessionFormProps {
  session: Session;
  personName: string;
  loading: boolean;
  onPersonNameChange: (name: string) => void;
  onJoinSession: () => void;
}

export function JoinSessionForm({ 
  session, 
  personName, 
  loading, 
  onPersonNameChange, 
  onJoinSession 
}: JoinSessionFormProps) {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '24px', padding: '30px', background: '#e7f3ff', borderRadius: '12px', border: '2px solid #0066cc' }}>
        <h2 style={{ marginBottom: '16px', color: '#004085' }}>
          Dołącz do sesji zamawiania
        </h2>
        <p style={{ marginBottom: '20px', color: '#004085', fontSize: '1.05rem' }}>
          Sesja: <strong>{session.restaurantName}</strong><br />
          Organizator: <strong>{session.createdBy}</strong><br />
          Uczestników: <strong>{session.participantCount}</strong>
        </p>
        <div className="order-form" style={{ flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Wpisz swoje imię"
            value={personName}
            onChange={(e) => onPersonNameChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onJoinSession()}
            style={{ width: '100%' }}
          />
          <button
            className="btn btn-primary"
            onClick={onJoinSession}
            disabled={loading || !personName.trim()}
            style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
          >
            {loading ? 'Dołączanie...' : '✓ Dołącz do sesji'}
          </button>
        </div>
      </div>
    </div>
  );
}
