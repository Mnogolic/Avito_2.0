import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { user, removeFromCart } = useAuth();

  if (!user) return <div className="container mt-5">Авторизуйтесь для просмотра корзины</div>;

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  return (
    <div className="container mt-4">
      <h1>Корзина</h1>
      {user.cart?.length === 0 ? (
        <div className="alert alert-info mt-3">
          Корзина пуста. <Link to="/">Вернуться к товарам</Link>
        </div>
      ) : (
        <div className="row mt-3">
          {user.cart?.map(product => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.title}</h5>
                  <p className="card-text">Цена: {product.price} ₽</p>
                  <button 
                    onClick={() => handleRemove(product.id)}
                    className="btn btn-danger mt-auto"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}