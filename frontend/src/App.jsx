import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import CartPage from './CartPage';


function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, addToCart, removeFromCart } = useAuth();

  const navigate = useNavigate();
  

  const handleCartAction = async (product) => {
    if (product.is_in_cart) {
      await removeFromCart(product.id);
    } else {
      await addToCart(product.id);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Перенаправляем после выхода
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/products', { withCredentials: true })
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-5">Загрузка товаров...</div>;

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
                <button 
                  onClick={() => handleCartAction(product)}
                  className={`btn ${product.is_in_cart ? 'btn-success' : 'btn-primary'} mt-2`}
                >
                  {product.is_in_cart ? 'В корзине' : 'В корзину'}
                </button>
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

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  console.log('ProtectedRoute user:', user); // [!code ++]
  
  if (!user) {
    console.log('Перенаправление на /login'); // [!code ++]
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Главная страница с товарами */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } 
          />

          {/* Страница корзины */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } 
          />

          {/* Страницы входа и регистрации */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Перенаправление всех остальных маршрутов на главную */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;