// src/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from './api'; // Используем наш axios-экземпляр

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const login = async (username, password) => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/login', { username, password });
      await checkAuth();
      return response.data;
    } catch (error) {
      console.error('Ошибка входа:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/register', { username, email, password });
      await login(username, password);
      return response.data;
    } catch (error) {
      console.error('Ошибка регистрации:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.post('/api/logout');
      setUser(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/api/me');
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const addToCart = async (productId) => {
    try {
      setIsLoading(true);
      await api.post('/api/cart', { productId });
      return await checkAuth();
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setIsLoading(true);
      await api.delete(`/api/cart/${productId}`);
      return await checkAuth();
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Первоначальная проверка авторизации
  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.log('Пользователь не авторизован -', error);
      } finally {
        setAuthChecked(true);
      }
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authChecked,
        login,
        register,
        logout,
        addToCart,
        removeFromCart
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};