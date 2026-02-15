import type { Session, Dish, Order } from '../types';
import { EmptyState } from '../components/EmptyState';
import { JoinSessionForm } from '../components/JoinSessionForm';
import { DishCard } from '../components/DishCard';
import { OrderConfirmation } from '../components/OrderConfirmation';
import { UserOrdersList } from '../components/UserOrdersList';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface OrderViewProps {
  activeSession: Session | null;
  userHasJoined: boolean;
  currentUserName: string;
  menu: Dish[];
  selectedDish: Dish | null;
  personName: string;
  loading: boolean;
  onPersonNameChange: (name: string) => void;
  onJoinSession: () => void;
  onSelectDish: (dish: Dish) => void;
  onConfirmOrder: () => void;
  orders: Order[];
  onRefreshOrders: () => void;
  onDeleteOrder: (orderId: number) => void;
}

export function OrderView({
  activeSession,
  userHasJoined,
  currentUserName,
  menu,
  selectedDish,
  personName,
  loading,
  onPersonNameChange,
  onJoinSession,
  onSelectDish,
  onConfirmOrder
  ,
  orders,
  onRefreshOrders,
  onDeleteOrder
}: OrderViewProps) {
  if (!activeSession) {
    return (
      <div className="card">
        <EmptyState
          icon="🚫"
          title="Brak aktywnej sesji"
          message='Organizator musi najpierw rozpocząć sesję w zakładce "Przeglądaj menu"'
        />
      </div>
    );
  }

    if (!userHasJoined && !currentUserName.trim()) {
        return (
            <div className="card">
                <JoinSessionForm
                    session={activeSession}
                    personName={personName}
                    loading={loading}
                    onPersonNameChange={onPersonNameChange}
                    onJoinSession={onJoinSession}
                />
            </div>
        );
    }

  const sessionMenu = menu.filter(d => d.restaurantId === activeSession.restaurantId);

  return (
    <div className="card">
      <h2>Zamów danie - {activeSession.restaurantName} {activeSession.restaurantImageUrl}</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Witaj <strong>{currentUserName}</strong>! Wybierz danie z menu poniżej.
      </p>

      {loading && sessionMenu.length === 0 ? (
        <LoadingSpinner message="Ładowanie menu..." />
      ) : (
        <>
          <div className="dish-list">
            {sessionMenu.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                isSelected={selectedDish?.id === dish.id}
                onClick={() => onSelectDish(dish)}
              />
            ))}
          </div>

          {selectedDish && (
            <OrderConfirmation
              dish={selectedDish}
              userName={currentUserName}
              loading={loading}
              onConfirm={onConfirmOrder}
            />
          )}
        </>
          )}
          <div className="card">
              <h2>Twoje zamówienie</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                  Tutaj pojawi się podsumowanie Twojego zamówienia po jego złożeniu.
              </p>
              {/* User orders list */}
              {/* Lazy load the component to avoid extra bundles if necessary */}
              <div style={{ marginTop: 12 }}>
                <UserOrdersList orders={orders} userName={currentUserName} onRefresh={onRefreshOrders} onDeleteOrder={onDeleteOrder} />
              </div>
          </div>
    </div>
  );
}
