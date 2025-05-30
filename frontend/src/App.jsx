import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProductList from './ProductList';
import CartPage from './CartPage';
import UML from './uml';
import Doc from './doc'

const ProtectedRoute = ({ children }) => {
  const { user, authChecked } = useAuth();
  if (!authChecked) return null;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          {/* Вот эти строчки нужно добавить: */}
          <Route path="/uml" element={<UML />} />
          <Route path="/doc" element={<Doc />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}