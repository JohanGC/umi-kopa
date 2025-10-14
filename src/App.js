import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Home from './pages/Home';
import Offers from './pages/Offers';
import Activities from './pages/Activities';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites'; // ← Agregar esta importación
import { authService } from './services/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import NotificationToast from './components/NotificationToast';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Carts';
import AdminPanel from './pages/AdminPanel';

function AppWrapper() {
  return (
    <NotificationProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </NotificationProvider>
  );
}

function App() {
  const { addNotification } = useNotification();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      const user = await authService.login(email, password);
      setCurrentUser(user);
      alert('¡Bienvenido de nuevo!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (nombre, email, password) => {
    try {
      setIsLoading(true);
      const user = await authService.register(nombre, email, password);
      setCurrentUser(user);
      alert('¡Cuenta creada con éxito!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    alert('Sesión cerrada');
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        
        <main className="flex-grow-1">
          <Routes>
            <Route path="/cart" element={<Cart />} />
            <Route path="/" element={<Home />} />
            <Route path="/offers" element={<Offers />} />
            <Route 
              path="/admin" 
              element={currentUser?.rol === 'administrador' ? <AdminPanel /> : <Navigate to="/" />} 
            />
            <Route path="/activities" element={<Activities />} />
            <Route 
              path="/profile" 
              element={currentUser ? <Profile user={currentUser} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/favorites" 
              element={currentUser ? <Favorites /> : <Navigate to="/login" />} // ← Agregar esta ruta
            />
            <Route 
              path="/login" 
              element={currentUser ? <Navigate to="/" /> : <LoginForm onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={currentUser ? <Navigate to="/" /> : <RegisterForm onRegister={handleRegister} />} 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default AppWrapper;