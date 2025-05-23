import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/login',
        { username, password },
        { withCredentials: true }
      );
      await checkAuth();
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/register',
        { username, email, password },
        { withCredentials: true }
      );
      await login(username, password);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/me', {
        withCredentials: true
      });
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId) => {
    setIsLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/cart',
        { productId },
        { withCredentials: true }
      );
      await checkAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setIsLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/cart/${productId}`,
        { withCredentials: true }
      );
      await checkAuth();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth().finally(() => setAuthChecked(true));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading, authChecked, login, register, logout, addToCart, removeFromCart
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}