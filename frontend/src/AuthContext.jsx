import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
  try {
    const response = await axios.post('http://localhost:5000/api/login', 
      { username, password }, 
      { withCredentials: true }
    );
    await checkAuth(); // Важно дождаться обновления данных пользователя
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Пробрасываем ошибку для обработки в компоненте
  }
};

  const register = async (username, email, password) => {
    const response = await axios.post('http://localhost:5000/api/register', 
      { username, email, password },
      { withCredentials: true }
    );
    await login(username, password); 
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { 
        withCredentials: true 
      });
      setUser(null); // Обязательно сбрасываем пользователя
    } catch (error) {
      console.error('Logout error:', error);
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
  
  // Удаление/добавление в корзину
const addToCart = async (productId) => {
  try {
    console.log('Добавляем товар в корзину:', productId); // [!code ++]
    await axios.post('http://localhost:5000/api/cart', 
      { productId },
      { withCredentials: true }
    );
    const { data } = await axios.get('http://localhost:5000/api/me', { // [!code ++]
      withCredentials: true
    });
    setUser(data); // Обновляем данные пользователя
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);
  }
};

const removeFromCart = async (productId) => {
  try {
    console.log('Удаляем товар из корзины:', productId); // [!code ++]
    await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
      withCredentials: true
    });
    const { data } = await axios.get('http://localhost:5000/api/me', { // [!code ++]
      withCredentials: true
    });
    setUser(data); // Обновляем данные пользователя
  } catch (error) {
    console.error('Ошибка удаления из корзины:', error);
  }
};

  useEffect(() => { 
    checkAuth(); 
  }, []);

  // Добавьте этот хук прямо в AuthContext.jsx перед return провайдера
useEffect(() => {
  console.log('Текущий пользователь (в контексте):', user); // [!code ++]
}, [user]);

  return (
  <AuthContext.Provider value={{ 
    user, 
    login, 
    register, 
    logout,
    addToCart,
    removeFromCart
  }}>
    {children}
  </AuthContext.Provider>
);
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  return context;
};