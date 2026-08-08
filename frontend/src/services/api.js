const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
import { getApiToken } from './auth';

/* Attach the signed admin token to mutating calls when present. Reads stay
   public so the storefront works for everyone. */
const authHeaders = () => {
  const token = getApiToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function fetchInventory() {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/`);
    if (!res.ok) throw new Error('Failed to fetch inventory from Django API');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function createFootwear(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create footwear item');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function updateFootwear(skuId, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/${skuId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update footwear item');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function deleteFootwear(skuId) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/${skuId}/`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error('Failed to delete footwear item');
    return true;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function restockFootwear(skuId, quantity) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/${skuId}/restock/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error('Failed to restock footwear item');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/`);
    if (!res.ok) throw new Error('Failed to fetch orders from Django API');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function createOrder(orderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order in Django API');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function updateOrder(orderId, orderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to update order in Django API');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function deleteOrder(orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error('Failed to delete order in Django API');
    return true;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

