import type { Session } from '../types';
interface NavigationTabsProps {
  currentView: 'browse' | 'order' | 'report';
    onViewChange: (view: 'browse' | 'order' | 'report') => void;
    activeSession: Session | null;
    currentClientId: string;
	setCurrentView: (view: 'browse' | 'order' | 'report') => void;
}

export function NavigationTabs({ currentView, onViewChange, activeSession, currentClientId, setCurrentView }: NavigationTabsProps) {
  return (
    <div className="nav-tabs">
      <button
        className={`nav-tab ${currentView === 'browse' ? 'active' : ''}`}
        onClick={() => onViewChange('browse')}
      >
        🔍 Przeglądaj menu
      </button>
      <button
        className={`nav-tab ${currentView === 'order' ? 'active' : ''}`}
        onClick={() => onViewChange('order')}
      >
        🛒 Złóż zamówienie
          </button>
          {(activeSession && activeSession.createdByClientId === currentClientId) ? (
              <button
                  className={`nav-tab ${currentView === 'report' ? 'active' : ''}`}
                  onClick={() => setCurrentView('report')}
              >
                  📊 Raport zbiorczy
              </button>
          ) : <br />}
    </div>
  );
}
