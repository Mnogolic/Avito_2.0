const API_URL = 'http://localhost:5000/api';

export async function register({ username, email, password }) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Ошибка регистрации' }));
    throw new Error(error.error || 'Ошибка регистрации');
  }
  return res.json();
}

export async function login({ username, password }) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Ошибка входа' }));
    throw new Error(error.error || 'Ошибка входа');
  }
  return res.json();
}

export async function logout() {
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getMe() {
  const res = await fetch(`${API_URL}/me`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Ошибка получения пользователя' }));
    throw new Error(error.error || 'Ошибка получения пользователя');
  }
  return res.json();
}

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Ошибка загрузки товаров' }));
    throw new Error(error.error || 'Ошибка загрузки товаров');
  }
  return res.json();
}

export async function addToCart(productId) {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Ошибка добавления в корзину' }));
    throw new Error(error.error || 'Ошибка добавления в корзину');
  }
}

export async function removeFromCart(productId) {
  const res = await fetch(`${API_URL}/cart/${productId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Ошибка удаления из корзины' }));
    throw new Error(error.error || 'Ошибка удаления из корзины');
  }
}
