import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { user, removeFromCart, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div>
      <h2>Корзина</h2>
      <button onClick={() => navigate('/')}>Назад к товарам</button>
      {user.cart?.length === 0 ? (
        <div>Корзина пуста</div>
      ) : (
        <ul>
          {user.cart.map(product => (
            <li key={product.id}>
              {product.title} — {product.price}₽
              <button
                disabled={isLoading}
                onClick={() => removeFromCart(product.id)}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}