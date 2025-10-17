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
import Favorites from './pages/Favorites';
import { authService } from './services/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import NotificationToast from './components/NotificationToast';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Carts';
import AdminPanel from './pages/AdminPanel';
import CreateActivityForm from './components/CreateActivityForm';
import CreateOfferForm from './components/CreateOfferForm';

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
    const initializeAuth = async () => {
      try {
        const user = authService.getCurrentUser();
        
        // Si hay usuario en localStorage, verificar token con el backend
        if (user) {
          const verifiedUser = await authService.verifyToken();
          if (verifiedUser) {
            setCurrentUser(verifiedUser);
          } else {
            // Token inválido, limpiar localStorage
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      const user = await authService.login(email, password);
      setCurrentUser(user);
      addNotification(`¡Bienvenido de nuevo, ${user.nombre}!`, 'success');
    } catch (error) {
      console.error('Error en login:', error);
      addNotification(error.message || 'Error al iniciar sesión', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setIsLoading(true);
      const user = await authService.register(userData);
      setCurrentUser(user);
      addNotification(`¡Cuenta creada con éxito, ${user.nombre}!`, 'success');
    } catch (error) {
      console.error('Error en registro:', error);
      addNotification(error.message || 'Error al crear cuenta', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    addNotification('Sesión cerrada correctamente', 'info');
  };

  // Protección de rutas por rol
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    
    if (requiredRole && currentUser.rol !== requiredRole) {
      addNotification('No tienes permisos para acceder a esta página', 'error');
      return <Navigate to="/" />;
    }
    
    return children;
  };

  // Protección de rutas para usuarios no autenticados
  const PublicRoute = ({ children }) => {
    if (currentUser) {
      return <Navigate to="/" />;
    }
    return children;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="ms-2">Cargando aplicación...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        
        {/* Componente de notificaciones */}
        <NotificationToast />
        
        <main className="flex-grow-1">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/activities" element={<Activities />} />
            
            {/* Rutas de autenticación */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginForm onLogin={handleLogin} />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterForm onRegister={handleRegister} />
                </PublicRoute>
              } 
            />
            
            {/* Rutas protegidas */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile user={currentUser} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de administración */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="administrador">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-activity" 
              element={
                <ProtectedRoute>
                  <CreateActivityForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-offer" 
              element={
                <ProtectedRoute>
                  <CreateOfferForm />
                </ProtectedRoute>
              } 
            />
            {/* Ruta por defecto para páginas no encontradas */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default AppWrapper;