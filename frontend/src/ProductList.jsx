import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { addToCart, isLoading, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/products', { credentials: 'include' })
      .then(r => r.json())
      .then(setProducts);
  }, []);

  // оптимистичное добавление в корзину (на клиенте)
  const handleAddToCart = async (productId) => {
    setProducts(products =>
      products.map(p =>
        p.id === productId ? { ...p, is_in_cart: true } : p
      )
    );
    try {
      await addToCart(productId);
      // если сервер вернет ошибку, можно откатить (дополнительно)
      // но чаще всего корзина всё равно будет синхронизирована
    } catch (err) {
      // если ошибка — откатываем
      console.log(err)
      setProducts(products =>
        products.map(p =>
          p.id === productId ? { ...p, is_in_cart: false } : p
        )
      );
      alert('Ошибка при добавлении в корзину');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0 fw-bold">Список товаров</h1>
          {user && (
            <div className="text-muted" style={{ fontSize: '0.9em' }}>
              Вы вошли как: <b>{user.username}</b>
            </div>
          )}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => navigate('/cart')}>
            <i className="bi bi-cart3" /> Корзина
          </button>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right" /> Выйти
          </button>
        </div>
      </div>
      <div className="row g-4">
        {products.map(product => (
          <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text fw-semibold fs-5 mb-3">{product.price} <span className="text-muted">₽</span></p>
                <button
                  className={`btn ${product.is_in_cart ? 'btn-secondary' : 'btn-primary'} mt-auto`}
                  disabled={isLoading || product.is_in_cart}
                  onClick={() => handleAddToCart(product.id)}
                >
                  {product.is_in_cart ? 'В корзине' : 'Добавить в корзину'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}