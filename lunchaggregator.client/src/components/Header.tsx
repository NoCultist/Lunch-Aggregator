import type { Session } from '../types';

interface HeaderProps {
  currentUserName: string;
  userHasJoined: boolean;
  activeSession: Session | null;
  onLogout: () => void;
}

export function Header({ currentUserName, userHasJoined, activeSession, onLogout }: HeaderProps) {
  return (
    <div className="header">
      <h1>🍽️ Lunch Aggregator</h1>
      <p>Wspólne zamówienie dla całego biura</p>
      {currentUserName && (
        <div style={{ fontSize: '0.9rem', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <span>
            Zalogowany jako: <strong>{currentUserName}</strong>
            {userHasJoined && activeSession && <span> ✓ Dołączono do sesji</span>}
          </span>
          <button 
            onClick={onLogout}
            style={{
              padding: '4px 12px',
              fontSize: '0.8rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Wyloguj
          </button>
        </div>
      )}
    </div>
  );
}
