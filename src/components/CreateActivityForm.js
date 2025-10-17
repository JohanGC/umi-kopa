import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/auth';

const CreateActivityForm = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    precioOriginal: '',
    descuento: '',
    maxParticipantes: '',
    fecha: '',
    hora: '',
    duracion: '',
    ubicacion: '',
    requisitos: '',
    imagen: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const categories = [
    { value: 'taller', label: 'Taller' },
    { value: 'tour', label: 'Tour' },
    { value: 'clase', label: 'Clase' },
    { value: 'evento', label: 'Evento Especial' },
    { value: 'conferencia', label: 'Conferencia' },
    { value: 'workshop', label: 'Workshop' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.categoria) newErrors.categoria = 'La categoría es requerida';
    if (!formData.precioOriginal || formData.precioOriginal < 0) newErrors.precioOriginal = 'Precio válido requerido';
    if (!formData.descuento || formData.descuento < 0 || formData.descuento > 100) newErrors.descuento = 'Descuento debe ser entre 0-100%';
    if (!formData.maxParticipantes || formData.maxParticipantes < 1) newErrors.maxParticipantes = 'Número de participantes válido requerido';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.ubicacion.trim()) newErrors.ubicacion = 'La ubicación es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDiscountedPrice = () => {
    const precioOriginal = parseFloat(formData.precioOriginal) || 0;
    const descuento = parseFloat(formData.descuento) || 0;
    return precioOriginal * (1 - descuento / 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification('Por favor corrige los errores del formulario', 'error');
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      addNotification('Debes iniciar sesión para crear actividades', 'error');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const activityData = {
        ...formData,
        precioDescuento: calculateDiscountedPrice(),
        empresa: currentUser.empresa || currentUser.nombre,
        creador: currentUser.email,
        estado: 'pendiente', // Las nuevas actividades requieren aprobación
        participantes: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // Aquí llamarías a tu API para crear la actividad
      const success = await createActivity(activityData);
      
      if (success) {
        addNotification('Actividad creada exitosamente. Está pendiente de aprobación.', 'success');
        navigate('/activities');
      } else {
        addNotification('Error al crear la actividad', 'error');
      }
    } catch (error) {
      console.error('Error creando actividad:', error);
      addNotification('Error al crear la actividad', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear actividad (conectar con tu API)
  const createActivity = async (activityData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔐 Token disponible:', !!token);
      console.log('📤 Enviando actividad a API:', activityData);
      
      const response = await fetch('http://localhost:5000/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      });

      console.log('📥 Respuesta de API:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Actividad creada en MongoDB:', result);
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Error de API:', errorData);
        throw new Error(errorData.message || 'Error al crear actividad');
      }
      
    } catch (error) {
      console.error('❌ Error con API, usando localStorage:', error);
      // Fallback a localStorage
      return createActivityInLocalStorage(activityData);
    }
  };

  const createActivityInLocalStorage = (activityData) => {
    try {
      const activities = JSON.parse(localStorage.getItem('ofertasApp_activities') || '[]');
      const newActivity = {
        ...activityData,
        _id: Date.now().toString(),
        id: Date.now()
      };
      
      activities.push(newActivity);
      localStorage.setItem('ofertasApp_activities', JSON.stringify(activities));
      return true;
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
      return false;
    }
  };

  const handleCancel = () => {
    navigate('/activities');
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Crear Nueva Actividad</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Título */}
                  <div className="col-md-12 mb-3">
                    <label htmlFor="titulo" className="form-label">Título de la Actividad *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      placeholder="Ej: Taller de Cocina Italiana"
                    />
                    {errors.titulo && <div className="invalid-feedback">{errors.titulo}</div>}
                  </div>

                  {/* Descripción */}
                  <div className="col-md-12 mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción *</label>
                    <textarea
                      className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                      id="descripcion"
                      name="descripcion"
                      rows="3"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Describe detalladamente la actividad..."
                    />
                    {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
                  </div>

                  {/* Categoría y Precio */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="categoria" className="form-label">Categoría *</label>
                    <select
                      className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {errors.categoria && <div className="invalid-feedback">{errors.categoria}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="precioOriginal" className="form-label">Precio Original ($) *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.precioOriginal ? 'is-invalid' : ''}`}
                      id="precioOriginal"
                      name="precioOriginal"
                      value={formData.precioOriginal}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                    {errors.precioOriginal && <div className="invalid-feedback">{errors.precioOriginal}</div>}
                  </div>

                  {/* Descuento y Participantes */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="descuento" className="form-label">Descuento (%) *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.descuento ? 'is-invalid' : ''}`}
                      id="descuento"
                      name="descuento"
                      value={formData.descuento}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                    {errors.descuento && <div className="invalid-feedback">{errors.descuento}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="maxParticipantes" className="form-label">Máximo de Participantes *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.maxParticipantes ? 'is-invalid' : ''}`}
                      id="maxParticipantes"
                      name="maxParticipantes"
                      value={formData.maxParticipantes}
                      onChange={handleChange}
                      min="1"
                      placeholder="10"
                    />
                    {errors.maxParticipantes && <div className="invalid-feedback">{errors.maxParticipantes}</div>}
                  </div>

                  {/* Fecha y Hora */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="fecha" className="form-label">Fecha *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
                      id="fecha"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.fecha && <div className="invalid-feedback">{errors.fecha}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="hora" className="form-label">Hora</label>
                    <input
                      type="time"
                      className="form-control"
                      id="hora"
                      name="hora"
                      value={formData.hora}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Duración y Ubicación */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="duracion" className="form-label">Duración (horas)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="duracion"
                      name="duracion"
                      value={formData.duracion}
                      onChange={handleChange}
                      min="0.5"
                      step="0.5"
                      placeholder="2.0"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="ubicacion" className="form-label">Ubicación *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.ubicacion ? 'is-invalid' : ''}`}
                      id="ubicacion"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      placeholder="Dirección o lugar específico"
                    />
                    {errors.ubicacion && <div className="invalid-feedback">{errors.ubicacion}</div>}
                  </div>

                  {/* Requisitos e Imagen */}
                  <div className="col-md-12 mb-3">
                    <label htmlFor="requisitos" className="form-label">Requisitos o Materiales Necesarios</label>
                    <textarea
                      className="form-control"
                      id="requisitos"
                      name="requisitos"
                      rows="2"
                      value={formData.requisitos}
                      onChange={handleChange}
                      placeholder="Ej: Traer laptop, conocimientos básicos..."
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label htmlFor="imagen" className="form-label">URL de Imagen (opcional)</label>
                    <input
                      type="url"
                      className="form-control"
                      id="imagen"
                      name="imagen"
                      value={formData.imagen}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>

                {/* Resumen de Precio */}
                {formData.precioOriginal && formData.descuento && (
                  <div className="alert alert-info">
                    <strong>Resumen de Precios:</strong><br />
                    Precio Original: ${parseFloat(formData.precioOriginal).toFixed(2)}<br />
                    Descuento: {formData.descuento}%<br />
                    <strong>Precio con Descuento: ${calculateDiscountedPrice().toFixed(2)}</strong>
                  </div>
                )}

                {/* Botones */}
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creando...
                      </>
                    ) : (
                      'Crear Actividad'
                    )}
                  </button>
                </div>

                <div className="mt-3">
                  <small className="text-muted">
                    * Campos obligatorios. Las actividades creadas requieren aprobación del administrador.
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityForm;