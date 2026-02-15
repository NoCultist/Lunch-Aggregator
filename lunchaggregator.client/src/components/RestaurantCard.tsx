import type { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
  showStartSessionPrompt?: boolean;
  disabled?: boolean;
}

export function RestaurantCard({ 
  restaurant, 
  isSelected, 
  onClick, 
  showStartSessionPrompt = false,
  disabled = false 
}: RestaurantCardProps) {
  return (
    <div
      className={`restaurant-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ 
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <div className="restaurant-icon">{restaurant.imageUrl}</div>
      <h3>{restaurant.name}</h3>
      <p>{restaurant.cuisine}</p>
      {showStartSessionPrompt && (
        <div style={{ marginTop: '8px', padding: '6px', background: '#28a745', color: 'white', borderRadius: '5px', fontSize: '0.85rem' }}>
          Kliknij aby rozpocząć sesję
        </div>
      )}
    </div>
  );
}
