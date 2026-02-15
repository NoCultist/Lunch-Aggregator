import type { Session } from '../types';

interface SessionInfoProps {
  session: Session;
}

export function SessionInfo({ session }: SessionInfoProps) {
  return (
    <div style={{ marginBottom: '24px', padding: '20px', background: '#e7f3ff', borderRadius: '10px', border: '1px solid #b3d9ff' }}>
      <h3 style={{ marginBottom: '8px', color: '#004085' }}>
        📍 Restauracja: {session.restaurantName}
      </h3>
      <p style={{ color: '#004085', fontSize: '0.9rem', marginBottom: '8px' }}>
        Organizator: <strong>{session.createdBy}</strong> • 
        Rozpoczęto: {new Date(session.createdAt).toLocaleString('pl-PL')}
      </p>
      <p style={{ color: '#004085', fontSize: '0.9rem' }}>
        Uczestników: <strong>{session.participantCount}</strong> ({session.participants.join(', ')})
      </p>
    </div>
  );
}
