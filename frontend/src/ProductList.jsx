import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout, addToCart, removeFromCart } = useAuth();
  const navigate = useNavigate();

  const handleCartAction = async (product) => {
    try {
      setError(null);
      if (product.is_in_cart) {
        await removeFromCart(product.id);
      } else {
        await addToCart(product.id);
      }
      // Обновляем состояние products после изменения корзины
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, is_in_cart: !p.is_in_cart } : p
      );
      setProducts(updatedProducts);
    } catch (err) {
      console.error('Ошибка при работе с корзиной:', err);
      setError('Не удалось обновить корзину. Попробуйте снова.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      setError('Ошибка при выходе из системы');
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', { 
          withCredentials: true 
        });
        setProducts(response.data);
      } catch (err) {
        console.error("Ошибка загрузки товаров:", err);
        setError('Не удалось загрузить товары');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-center mt-5">Загрузка товаров...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Товары Avito</h1>
        {user && (
          <div className="d-flex align-items-center">
            <span className="me-3">Вы вошли как: <strong>{user.username}</strong></span>
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Выйти</button>
          </div>
        )}
      </div>

      <div className="row">
        {products.map(product => (
          <div key={product.id} className="col-md-4 mb-4 d-flex">
            <div className="card w-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text mt-auto">Цена: {product.price} ₽</p>
                {user && (
                  <button 
                    onClick={() => handleCartAction(product)}
                    className={`btn ${product.is_in_cart ? 'btn-success' : 'btn-primary'} mt-2`}
                    disabled={!user}
                  >
                    {product.is_in_cart ? 'В корзине' : 'В корзину'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {user?.cart?.length > 0 && (
        <div className="text-center mt-4">
          <Link to="/cart" className="btn btn-warning">
            Перейти в корзину ({user.cart.length})
          </Link>
        </div>
      )}
    </div>
  );
}