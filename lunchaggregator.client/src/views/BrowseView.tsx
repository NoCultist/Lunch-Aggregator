import type { Restaurant, Dish, Session } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { DishCard } from '../components/DishCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface BrowseViewProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  menu: Dish[];
  activeSession: Session | null;
    organizerName: string;
    currentUserName: string;
  loading: boolean;
  onOrganizerNameChange: (name: string) => void;
  onRestaurantClick: (restaurant: Restaurant, startSession: boolean) => void;
}
export const isEmpty = function (text: string): boolean {
    return text === null || text.match(/^ *$/) !== null;
};
export function BrowseView({
  restaurants,
  selectedRestaurant,
  menu,
  activeSession,
    organizerName,
	currentUserName,
  loading,
  onOrganizerNameChange,
  onRestaurantClick
}: BrowseViewProps) {
  const canStartSession = !activeSession && organizerName.trim();

  return (
    <div className="card">
      <h2>Przeglądaj restauracje i ich menu</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Możesz swobodnie przeglądać wszystkie restauracje. Aby złożyć zamówienie, musisz dołączyć do aktywnej sesji.
      </p>

      {!activeSession && (
        <div style={{ marginBottom: '24px', padding: '20px', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffc107' }}>
          <h3 style={{ marginBottom: '12px', color: '#856404' }}>👤 Rozpocznij sesję (Organizator)</h3>
          <p style={{ marginBottom: '16px', color: '#856404' }}>
            Wybierz restaurację, z której będzie dzisiejsze zamówienie.
          </p>
                  <div className="order-form">
                      {isEmpty(currentUserName) ?
                          <input
                              type="text"
                              placeholder="Twoje imię (organizator)"
                              value={organizerName}
                              onChange={(e) => onOrganizerNameChange(e.target.value)}
                          />
                          :
                          <button className={'btn btn-primary'} onClick={(e)=>onOrganizerNameChange(currentUserName)}>
							  <span role="img" aria-label="start">🚀</span> Rozpocznij sesję
                          </button>
                  }
            
          </div>
        </div>
      )}

      {loading && !selectedRestaurant ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSelected={selectedRestaurant?.id === restaurant.id}
                onClick={() => onRestaurantClick(restaurant, canStartSession)}
                showStartSessionPrompt={canStartSession && selectedRestaurant?.id !== restaurant.id}
                disabled={!canStartSession && selectedRestaurant?.id !== restaurant.id}
              />
            ))}
          </div>

          {selectedRestaurant && menu.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h2>Menu - {selectedRestaurant.name}</h2>
              <div className="dish-list">
                {menu.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    isSelected={false}
                    onClick={() => {}}
                    readOnly={true}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
