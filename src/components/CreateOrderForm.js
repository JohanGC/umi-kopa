// components/CreateOrderForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateOrderForm = () => {
  const [formData, setFormData] = useState({
    descripcion: '',
    precioOfertado: '',
    categoria: 'otros',
    notasAdicionales: '',
    ubicacionRecogida: '',
    ubicacionEntrega: '',
    fechaLimite: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Debes iniciar sesión para crear un mandado');
      setLoading(false);
      return;
    }

    if (!formData.descripcion.trim()) {
      setError('La descripción del mandado es requerida');
      setLoading(false);
      return;
    }

    if (!formData.precioOfertado || formData.precioOfertado < 1000) {
      setError('El precio ofertado debe ser mínimo $1.000');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          telefono: user.telefono,
          precioOfertado: parseInt(formData.precioOfertado)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creando mandado');
      }

      await response.json();
      
      // Redirigir a la lista de mandados o mostrar confirmación
      navigate('/orders');
      
    } catch (error) {
      console.error('Error creando mandado:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">🛵 Crear Nuevo Mandado</h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Información del usuario */}
              <div className="card mb-4">
                <div className="card-body bg-light">
                  <h6>👤 Información del Solicitante</h6>
                  <p className="mb-1"><strong>Nombre:</strong> {user.nombre}</p>
                  <p className="mb-0"><strong>Teléfono:</strong> {user.telefono || 'No registrado'}</p>
                  {!user.telefono && (
                    <small className="text-warning">
                      Actualiza tu teléfono en tu perfil para recibir llamadas
                    </small>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="categoria" className="form-label">Categoría del Mandado</label>
                  <select
                    className="form-select"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="comida">🍕 Comida a Domicilio</option>
                    <option value="mercado">🛒 Mercado/Compras</option>
                    <option value="farmacia">💊 Farmacia</option>
                    <option value="paqueteria">📦 Paquetería</option>
                    <option value="documentos">📄 Documentos</option>
                    <option value="otros">🎯 Otros Servicios</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="descripcion" className="form-label">
                    📝 Descripción del Mandado *
                  </label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe detalladamente lo que necesitas que haga el mandadito. Ej: 'Recoger un paquete en la Cra 15 #45-60 y llevarlo a la Cra 20 #35-25'"
                    required
                    maxLength="500"
                  ></textarea>
                  <div className="form-text">
                    {formData.descripcion.length}/500 caracteres
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="precioOfertado" className="form-label">
                        💰 Precio Ofertado (COP) *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          id="precioOfertado"
                          name="precioOfertado"
                          value={formData.precioOfertado}
                          onChange={handleChange}
                          placeholder="5000"
                          min="1000"
                          step="500"
                          required
                        />
                      </div>
                      <div className="form-text">Mínimo $1.000</div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="fechaLimite" className="form-label">
                        ⏰ Fecha Límite (Opcional)
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="fechaLimite"
                        name="fechaLimite"
                        value={formData.fechaLimite}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="ubicacionRecogida" className="form-label">
                        📍 Lugar de Recogida (Opcional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="ubicacionRecogida"
                        name="ubicacionRecogida"
                        value={formData.ubicacionRecogida}
                        onChange={handleChange}
                        placeholder="Dirección donde debe recoger el mandadito"
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="ubicacionEntrega" className="form-label">
                        🏠 Lugar de Entrega (Opcional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="ubicacionEntrega"
                        name="ubicacionEntrega"
                        value={formData.ubicacionEntrega}
                        onChange={handleChange}
                        placeholder="Dirección donde debe entregar el mandadito"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="notasAdicionales" className="form-label">
                    📋 Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    className="form-control"
                    id="notasAdicionales"
                    name="notasAdicionales"
                    rows="2"
                    value={formData.notasAdicionales}
                    onChange={handleChange}
                    placeholder="Instrucciones especiales, horarios, etc."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Publicando Mandado...
                    </>
                  ) : (
                    '🚀 Publicar Mandado'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderForm;