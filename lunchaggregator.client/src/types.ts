export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  imageUrl: string;
}

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  restaurantId: number;
  restaurantName: string;
}

export interface CreateSessionRequest {
  restaurantId: number;
  organizerName: string;
  organizerClientId?: string;
}

export interface JoinSessionRequest {
  sessionId: number;
  personName: string;
}

export interface Session {
  id: number;
  restaurantId: number;
  restaurantName: string;
  restaurantCuisine: string;
  restaurantImageUrl: string;
  isActive: boolean;
  createdBy: string;
  createdByClientId?: string;
  createdAt: string;
  participants: string[];
  participantCount: number;
}

export interface CreateOrderRequest {
  personName: string;
  dishId: number;
  personClientId?: string;
}

export interface Order {
  id: number;
  personName: string;
  dishName: string;
  dishPrice: number;
  restaurantName: string;
  orderedAt: string;
  personClientId?: string;
}

export interface OrderReport {
  session: Session | null;
  orders: Order[];
  totalAmount: number;
  totalOrders: number;
}
