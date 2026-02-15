import type { Restaurant, Dish, CreateOrderRequest, Order, OrderReport, Session, CreateSessionRequest, JoinSessionRequest } from './types';

const API_BASE = 'http://localhost:5000/api';

export const api = {
  // Sessions
  async getActiveSession(): Promise<Session | null> {
        const response = await fetch(`${API_BASE}/session/active`);

        if (!response.ok) {
            throw new Error(`Failed to fetch active session: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        const text = await response.text();

        if (!text) {
            return null;
        }

        return JSON.parse(text);
  },

  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE}/orders/report`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    const report = await response.json();
    return report.orders || [];
  },

  async deleteOrder(orderId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete order');
  },

  async startSession(request: CreateSessionRequest): Promise<Session> {
    const clientId = localStorage.getItem('lunch_aggregator_client_id');
    const response = await fetch(`${API_BASE}/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, organizerClientId: clientId }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to start session');
    }
    return response.json();
  },

  async joinSession(request: JoinSessionRequest): Promise<Session> {
    const response = await fetch(`${API_BASE}/session/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to join session');
    }
    return response.json();
  },

  async closeSession(clientId?: string): Promise<void> {
    const body = clientId ? { clientId } : {};
    const response = await fetch(`${API_BASE}/session/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to close session');
  },

  async clearAllSessions(): Promise<void> {
    const response = await fetch(`${API_BASE}/session/clear`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear sessions');
  },

  async leaveSession(personName?: string, clientId?: string): Promise<void> {
    const response = await fetch(`${API_BASE}/session/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personName, personClientId: clientId }),
    });
    if (!response.ok) throw new Error('Failed to leave session');
  },

  // Restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await fetch(`${API_BASE}/restaurants`);
    if (!response.ok) throw new Error('Failed to fetch restaurants');
    return response.json();
  },

  async getRestaurantMenu(restaurantId: number): Promise<Dish[]> {
    const response = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu`);
    if (!response.ok) throw new Error('Failed to fetch menu');
    return response.json();
  },

  // Orders
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const clientId = localStorage.getItem('lunch_aggregator_client_id');
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, personClientId: clientId }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create order');
    }
    return response.json();
  },

  async getOrderReport(): Promise<OrderReport> {
    const response = await fetch(`${API_BASE}/orders/report`);
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  },

  async clearOrders(): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/clear`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear orders');
  },
};
