import { useState, useEffect, useRef } from 'react';
import './App.css';
import { api } from './api';
import type { Restaurant, Dish, OrderReport, Session, Order } from './types';
import { Header } from './components/Header';
import { AlertMessage } from './components/AlertMessage';
import { SessionBanner } from './components/SessionBanner';
import { NavigationTabs } from './components/NavigationTabs';
import { BrowseView } from './views/BrowseView';
import { OrderView } from './views/OrderView';
import { ReportView } from './views/ReportView';

type View = 'browse' | 'order' | 'report';

// LocalStorage keys
const STORAGE_KEYS = {
  USER_NAME: 'lunch_aggregator_user_name',
  HAS_JOINED: 'lunch_aggregator_has_joined',
  SESSION_ID: 'lunch_aggregator_session_id',
  CLIENT_ID: 'lunch_aggregator_client_id',
};

function App() {
  const [currentView, setCurrentView] = useState<View>('browse');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Dish[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [personName, setPersonName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [userHasJoined, setUserHasJoined] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentClientId, setCurrentClientId] = useState<string>(() => {
    let id = localStorage.getItem(STORAGE_KEYS.CLIENT_ID);
    if (!id) {
      id = (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function')
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(STORAGE_KEYS.CLIENT_ID, id);
    }
    return id;
  });
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [report, setReport] = useState<OrderReport | null>(null);
  const previousSessionIdRef = useRef<number | null>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUserName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    const savedHasJoined = localStorage.getItem(STORAGE_KEYS.HAS_JOINED) === 'true';
    const savedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    // client id is initialized synchronously when component mounts via useState initializer

    if (savedUserName) {
      setCurrentUserName(savedUserName);
    }

    loadRestaurants();
    // if the user previously joined a session, remember its id in the ref so
    // future polling can detect when it gets closed even if the page wasn't
    // the one that started/joined the session this session
    if (savedHasJoined && savedSessionId) {
      const parsed = parseInt(savedSessionId, 10);
      if (!isNaN(parsed)) previousSessionIdRef.current = parsed;
    }
    loadActiveSession(savedUserName, savedHasJoined, savedSessionId);

    // expose client id for api module to send with close request
    try {
      (window as any)._lunchClientId = currentClientId;
    } catch {
      // ignore if window not available
    }
  }, []);

  // keep global client id in sync when it changes
  useEffect(() => {
    try {
      (window as any)._lunchClientId = currentClientId;
    } catch {
      // ignore
    }
  }, [currentClientId]);

  // Auto-refresh active session every X seconds.
  // Include `activeSession` in deps so the interval closure sees the latest value
  // and can detect session closure immediately.
  useEffect(() => {
    const interval = setInterval(() => {
      const savedUserName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
      const savedHasJoined = localStorage.getItem(STORAGE_KEYS.HAS_JOINED) === 'true';
      const savedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      
      loadActiveSession(savedUserName, savedHasJoined, savedSessionId, true);
      
      if (currentView === 'report') {
        loadReport(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentView, activeSession]);

  useEffect(() => {
    if (currentView === 'report') {
      loadReport();
    }
  }, [currentView]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await api.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      showMessage('error', 'Nie udało się załadować restauracji');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      if (!silent) console.error('Failed to load orders:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

    const isSessionActive = async () => {
        let active = await api.getActiveSession();
        return active;
    }

  const loadActiveSession = async (
    savedUserName: string | null = null, 
    savedHasJoined: boolean = false, 
    savedSessionId: string | null = null,
    silent: boolean = false
  ) => {
      try {

          const session = await api.getActiveSession();
          const isSessionStillActive = session == null ? 'false' : 'true';
          localStorage.setItem(STORAGE_KEYS.HAS_JOINED, isSessionStillActive);
          localStorage.setItem(STORAGE_KEYS.SESSION_ID, '');
      // detect session close: if we previously had an active session (either in state or ref)
      // and now there's none -> session closed
      if (!session && (previousSessionIdRef.current !== null || activeSession !== null)) {
        // session was closed since last check — refresh UI and clear session-related state
        setActiveSession(null);
        setOrders([]);
        setUserHasJoined(false);
        setMenu([]);
        setSelectedRestaurant(null);
        setSelectedDish(null);
        setCurrentView('browse');
        localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
        localStorage.removeItem(STORAGE_KEYS.HAS_JOINED);
        showMessage('info', 'Sesja została zamknięta');
        previousSessionIdRef.current = null;
        return;
      }

      setActiveSession(session);
      // ensure we remember the id of the currently active session so we can detect when it's closed
      if (session) {
        previousSessionIdRef.current = session.id;
      }
      // Ensure menu for active session is loaded (fixes missing menu after refresh)
      if (session) {
        const needsLoad = !selectedRestaurant || selectedRestaurant.id !== session.restaurantId || menu.length === 0;
        if (needsLoad) {
          const restaurant = restaurants.find(r => r.id === session.restaurantId);
          if (restaurant) {
            // we have restaurant info — load via loadMenu to set selectedRestaurant
            await loadMenu(restaurant);
          } else {
            // fallback: load by id
            await loadMenuForSession(session.restaurantId);
          }
        previousSessionIdRef.current = session.id;
        }
      }
      
      if (session && savedUserName && savedSessionId === session.id.toString()) {
        if (savedHasJoined && session.participants.includes(savedUserName)) {
          setCurrentUserName(savedUserName);
          setUserHasJoined(true);
          // load user's orders when restoring joined state after refresh
          await loadOrders(true);
          if (!silent) {
            showMessage('info', `Witaj ponownie, ${savedUserName}!`);
          }
        } else {
          clearUserData();
        }
      } else if (session && savedSessionId && savedSessionId !== session.id.toString()) {
        clearUserData();
        if (!silent) {
          showMessage('info', 'Rozpoczęto nową sesję. Dołącz ponownie.');
        }
      } else if (!session && savedUserName) {
        clearUserData();
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const clearUserData = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    localStorage.removeItem(STORAGE_KEYS.HAS_JOINED);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    setCurrentUserName('');
    setUserHasJoined(false);
  };

  const saveUserData = (userName: string, hasJoined: boolean, sessionId: number) => {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
    localStorage.setItem(STORAGE_KEYS.HAS_JOINED, hasJoined.toString());
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId.toString());
  };

  const loadMenu = async (restaurant: Restaurant) => {
    try {
      setLoading(true);
      const data = await api.getRestaurantMenu(restaurant.id);
      setMenu(data);
      setSelectedRestaurant(restaurant);
      setSelectedDish(null);
    } catch (error) {
      showMessage('error', 'Nie udało się załadować menu');
    } finally {
      setLoading(false);
    }
  };

  // Load menu by restaurant id (used on initial load when restaurants list may not be set)
  const loadMenuForSession = async (restaurantId: number) => {
    try {
      setLoading(true);
      const data = await api.getRestaurantMenu(restaurantId);
      setMenu(data);
      const restaurant = restaurants.find(r => r.id === restaurantId) || null;
      setSelectedRestaurant(restaurant);
      setSelectedDish(null);
    } catch (error) {
      // don't spam user with errors during background refresh
      console.error('Failed to load menu for session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (restaurantId: number) => {
    if (!organizerName.trim()) {
      showMessage('error', 'Podaj swoje imię (organizator)');
      return;
    }

    try {
      setLoading(true);
      const session = await api.startSession({
        restaurantId,
        organizerName: organizerName.trim(),
        organizerClientId: currentClientId,
      });
      setActiveSession(session);
      // remember new session id for close-detection
      previousSessionIdRef.current = session.id;
      // If server generated a client id for the creator, persist and use it
      if (session.createdByClientId && session.createdByClientId !== currentClientId) {
        localStorage.setItem(STORAGE_KEYS.CLIENT_ID, session.createdByClientId);
        setCurrentClientId(session.createdByClientId);
      }
      setCurrentUserName(organizerName.trim());
      setUserHasJoined(true);
      saveUserData(organizerName.trim(), true, session.id);
      await loadOrders();
      showMessage('success', `Sesja rozpoczęta! Restauracja: ${session.restaurantName}`);
      setOrganizerName('');
      setCurrentView('order');
      
      // Load menu for the selected restaurant
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant) {
        await loadMenu(restaurant);
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Nie udało się rozpocząć sesji');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!activeSession) {
      showMessage('error', 'Brak aktywnej sesji');
      return;
    }

    if (!personName.trim()) {
      showMessage('error', 'Podaj swoje imię aby dołączyć');
      return;
    }

    try {
      setLoading(true);
      const session = await api.joinSession({
        sessionId: activeSession.id,
        personName: personName.trim(),
      });
      setActiveSession(session);
      // remember session id so we detect when host closes it
      previousSessionIdRef.current = session.id;
      setCurrentUserName(personName.trim());
      setUserHasJoined(true);
      saveUserData(personName.trim(), true, session.id);
      await loadOrders();
      showMessage('success', `Dołączyłeś do sesji: ${session.restaurantName}`);
      setPersonName('');
      
      // Load menu for the active session
      const restaurant = restaurants.find(r => r.id === session.restaurantId);
      if (restaurant) {
        await loadMenu(restaurant);
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Nie udało się dołączyć do sesji');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    //if (!confirm('Czy na pewno chcesz zamknąć sesję zamawiania?')) {
    //  return;
    //}

    try {
      setLoading(true);
      await api.closeSession(currentClientId || undefined);
      setActiveSession(null);
      setUserHasJoined(false);
      setSelectedDish(null);
      setOrders([]);
      clearUserData();
      showMessage('success', 'Sesja zamknięta pomyślnie');
    } catch (error) {
      showMessage('error', 'Nie udało się zamknąć sesji');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async () => {
    if (!selectedDish || !currentUserName) {
      showMessage('error', 'Wybierz danie');
      return;
    }

    if (!userHasJoined) {
      showMessage('error', 'Musisz najpierw dołączyć do sesji');
      return;
    }

    try {
      setLoading(true);
      await api.createOrder({
        personName: currentUserName,
        dishId: selectedDish.id,
      });
      await loadOrders();
      showMessage('success', `Zamówienie złożone! ${currentUserName} zamówił(a) ${selectedDish.name}`);
      setSelectedDish(null);
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Nie udało się złożyć zamówienia');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      setLoading(true);
      await api.deleteOrder(orderId);
      await loadOrders();
      showMessage('success', 'Zamówienie usunięte');
    } catch (error) {
      showMessage('error', 'Nie udało się usunąć zamówienia');
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.getOrderReport();
      setReport(data);
    } catch (error) {
      if (!silent) showMessage('error', 'Nie udało się załadować raportu');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleClearOrders = async () => {
    if (!confirm('Czy na pewno chcesz wyczyścić wszystkie zamówienia?')) {
      return;
    }

    try {
      setLoading(true);
      await api.clearOrders();
      showMessage('success', 'Wszystkie zamówienia zostały usunięte');
      await loadReport();
    } catch (error) {
      showMessage('error', 'Nie udało się wyczyścić zamówień');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = async (restaurant: Restaurant, shouldStartSession: boolean) => {
    if (shouldStartSession) {
      await handleStartSession(restaurant.id);
    } else {
      await loadMenu(restaurant);
    }
  };

    const handleLogout = async () => {
        try {
            if (activeSession?.createdByClientId && activeSession.createdByClientId === currentClientId) {
                // creator: close the whole session
                await handleCloseSession();
            } else if (!activeSession?.createdByClientId && activeSession?.createdBy === currentUserName) {
                // fallback: close by name if session has no client id stored
                await handleCloseSession();
            } else {
                // regular participant: call leave endpoint to remove user and their orders
                try {
                  await api.leaveSession(currentUserName || undefined, currentClientId || undefined);
                } catch (e) {
                  // ignore leave errors
                }
            }
        } catch (e) {
            // ignore close errors on logout, still clear user data
        }
        clearUserData();
        showMessage('info', 'Wylogowano pomyślnie');
    };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="app">
      <Header
        currentUserName={currentUserName}
        userHasJoined={userHasJoined}
        activeSession={activeSession}
        onLogout={handleLogout}
      />

      {message && <AlertMessage type={message.type} text={message.text} />}

      {activeSession && (
        <SessionBanner
          session={activeSession}
          currentUserName={currentUserName}
          currentClientId={currentClientId}
          onCloseSession={handleCloseSession}
        />
      )}

          <NavigationTabs currentView={currentView} onViewChange={setCurrentView} activeSession={activeSession} currentClientId={currentClientId} setCurrentView={setCurrentView} />

      {currentView === 'browse' && (
        <BrowseView
          restaurants={restaurants}
          selectedRestaurant={selectedRestaurant}
          menu={menu}
          activeSession={activeSession}
                  organizerName={organizerName}
				  currentUserName={currentUserName }
          loading={loading}
          onOrganizerNameChange={setOrganizerName}
          onRestaurantClick={handleRestaurantClick}
        />
      )}

      {currentView === 'order' && (
        <OrderView
          activeSession={activeSession}
          userHasJoined={userHasJoined}
          currentUserName={currentUserName}
          menu={menu}
          selectedDish={selectedDish}
          personName={personName}
          loading={loading}
          onPersonNameChange={setPersonName}
          onJoinSession={handleJoinSession}
          onSelectDish={setSelectedDish}
          onConfirmOrder={handleOrderSubmit}
          orders={orders.filter(o => o.personClientId === currentClientId)}
          onRefreshOrders={() => loadOrders()}
          onDeleteOrder={handleDeleteOrder}
        />
      )}

      {currentView === 'report' && (
        <ReportView
          report={report}
          loading={loading}
          onClearOrders={handleClearOrders}
        />
      )}
    </div>
  );
}

export default App;
