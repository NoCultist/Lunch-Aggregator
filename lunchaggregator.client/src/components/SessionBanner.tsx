import type { Session } from '../types';

interface SessionBannerProps {
  session: Session;
  currentUserName: string;
  currentClientId?: string;
  onCloseSession: () => void;
}

export function SessionBanner({ session, currentUserName, currentClientId, onCloseSession }: SessionBannerProps) {
  const isOrganizer = (session.createdByClientId && currentClientId) ? session.createdByClientId === currentClientId : session.createdBy === currentUserName;

  return (
    <div style={{ marginBottom: '20px', padding: '16px', background: '#d4edda', borderRadius: '10px', border: '2px solid #28a745' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ marginBottom: '4px', color: '#155724', fontSize: '1.1rem' }}>
            📍 Aktywna sesja: {session.restaurantName} {session.restaurantImageUrl}
          </h3>
          <p style={{ color: '#155724', fontSize: '0.85rem', margin: 0 }}>
            Organizator: {session.createdBy} • Uczestników: {session.participantCount}
          </p>
          <p style={{ color: '#155724', fontSize: '0.75rem', margin: '4px 0 0 0', opacity: 0.8 }}>
            🔄 Aktualizuje się automatycznie
          </p>
        </div>
        {isOrganizer && (
          <button className="btn btn-danger" onClick={onCloseSession}>
            Zamknij sesję
          </button>
        )}
      </div>
    </div>
  );
}
