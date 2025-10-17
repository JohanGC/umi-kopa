import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth'; // ✅ Importar el servicio
import { useNotification } from '../context/NotificationContext'; // ✅ Para notificaciones

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { addNotification } = useNotification(); // ✅ Hook para notificaciones

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    console.log('🔑 Intentando login...', { email, password }); // ← Agregar password al log
    
    // ✅ CORREGIDO: Pasar email y password a onLogin
    if (onLogin) {
      await onLogin(email, password); // ← Pasar las credenciales
      return; // Salir después de llamar a onLogin
    }
    
    // Si no hay onLogin, usar authService directamente
    const user = await authService.login(email, password);
    console.log('✅ Login exitoso:', user);
    addNotification(`Bienvenido, ${user.nombre}`, 'success');
    
    // Redirigir según el rol
    if (user.rol === 'administrador') {
      navigate('/admin');
    } else {
      navigate('/dashboard'); // ← OJO: ¿Tienes ruta /dashboard?
    }
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    const errorMessage = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
    setError(errorMessage);
    addNotification(errorMessage, 'error');
  } finally {
    setLoading(false);
  }
};

  const handleRegisterClick = () => {
    navigate('/register');
  };

  // ✅ Función para login rápido de prueba (puedes remover esto después)
  const handleQuickLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Iniciar Sesión</h2>
              
              {/* ✅ Mostrar errores */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {/* ✅ Botones de prueba rápido (opcional - remover en producción) */}
              <div className="mb-3">
                <small className="text-muted">Login rápido para pruebas:</small>
                <div className="btn-group w-100 mt-1">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleQuickLogin('admin@ejemplo.com', 'admin123')}
                    disabled={loading}
                  >
                    👑 Admin
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-info btn-sm"
                    onClick={() => handleQuickLogin('usuario@ejemplo.com', 'usuario123')}
                    disabled={loading}
                  >
                    👤 Usuario
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => handleQuickLogin('empresa@ejemplo.com', 'empresa123')}
                    disabled={loading}
                  >
                    🏢 Oferente
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3 form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="remember" 
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Recordarme
                  </label>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
                <div className="text-center">
                  <a href="#!" className="text-decoration-none">¿Olvidaste tu contraseña?</a>
                </div>
              </form>
              <hr className="my-4" />
              <div className="text-center">
                <p>¿No tienes cuenta? 
                  <button 
                    className="btn btn-link p-0" 
                    onClick={handleRegisterClick}
                    disabled={loading}
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;