import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ maxWidth: 370, width: "100%" }}>
        <div className="text-center mb-3">
          <i className="bi bi-person-circle fs-1 text-primary mb-2" />
          <h2 className="fw-bold mb-0">Вход</h2>
          <div className="text-muted mb-3">Добро пожаловать!</div>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Логин</label>
            <input name="username" value={formData.username} onChange={handleChange} className="form-control" placeholder="Введите логин" required autoFocus />
          </div>
          <div className="mb-3">
            <label className="form-label">Пароль</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" placeholder="Введите пароль" required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? 'Входим...' : 'Войти'}
          </button>
        </form>
        <div className="text-center mt-3">
          <span className="text-muted">Нет аккаунта? </span>
          <Link to="/register">Регистрация</Link>
        </div>
      </div>
    </div>
  );
}