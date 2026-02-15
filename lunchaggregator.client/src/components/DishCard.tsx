import type { Dish } from '../types';

interface DishCardProps {
  dish: Dish;
  isSelected: boolean;
  onClick: () => void;
  readOnly?: boolean;
}

export function DishCard({ dish, isSelected, onClick, readOnly = false }: DishCardProps) {
  return (
    <div
      className={`dish-card ${isSelected ? 'selected' : ''}`}
      onClick={readOnly ? undefined : onClick}
      style={{ cursor: readOnly ? 'default' : 'pointer' }}
    >
      <div className="dish-info">
        <h4>{dish.name}</h4>
        <p>{dish.description}</p>
      </div>
      <div className="dish-price">{dish.price.toFixed(2)} zł</div>
    </div>
  );
}
