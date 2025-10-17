import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/auth';

const CreateOfferForm = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    precioOriginal: '',
    descuento: '',
    maxParticipantes: '',
    fechaInicio: '',
    fechaFin: '',
    condiciones: '',
    imagen: '',
    tipoOferta: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const categories = [
    { value: 'temporada', label: 'Temporada' },
    { value: 'nocturna', label: 'Nocturna' },
    { value: 'fin-de-semana', label: 'Fin de Semana' },
    { value: 'flash', label: 'Oferta Flash' },
    { value: 'exclusiva', label: 'Exclusiva' },
    { value: 'early-bird', label: 'Early Bird' }
  ];

  const offerTypes = [
    { value: 'general', label: 'General' },
    { value: 'exclusiva', label: 'Exclusiva para miembros' },
    { value: 'flash', label: 'Oferta Flash' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    if (!formData.fechaInicio) newErrors.fechaInicio = 'La fecha de inicio es requerida';
    if (!formData.fechaFin) newErrors.fechaFin = 'La fecha de fin es requerida';
    
    // Validar que fechaFin sea mayor que fechaInicio
    if (formData.fechaInicio && formData.fechaFin) {
      const startDate = new Date(formData.fechaInicio);
      const endDate = new Date(formData.fechaFin);
      if (endDate <= startDate) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

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
      addNotification('Debes iniciar sesión para crear ofertas', 'error');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const offerData = {
        ...formData,
        precioDescuento: calculateDiscountedPrice(),
        empresa: currentUser.empresa || currentUser.nombre,
        creador: currentUser.email,
        estado: 'pendiente',
        participantes: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const success = await createOffer(offerData);
      
      if (success) {
        addNotification('Oferta creada exitosamente. Está pendiente de aprobación.', 'success');
        navigate('/offers');
      } else {
        addNotification('Error al crear la oferta', 'error');
      }
    } catch (error) {
      console.error('Error creando oferta:', error);
      addNotification('Error al crear la oferta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createOffer = async (offerData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔐 Token disponible:', !!token);
      console.log('📤 Enviando oferta a API:', offerData);
      
      const response = await fetch('http://localhost:5000/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(offerData)
      });

      console.log('📥 Respuesta de API:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Oferta creada en MongoDB:', result);
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Error de API:', errorData);
        throw new Error(errorData.message || 'Error al crear oferta');
      }
      
    } catch (error) {
      console.error('❌ Error con API, usando localStorage:', error);
      // Fallback a localStorage
      return createOfferInLocalStorage(offerData);
    }
  };

  const createOfferInLocalStorage = (offerData) => {
    try {
      const offers = JSON.parse(localStorage.getItem('ofertasApp_offers') || '[]');
      const newOffer = {
        ...offerData,
        _id: Date.now().toString(),
        id: Date.now()
      };
      
      offers.push(newOffer);
      localStorage.setItem('ofertasApp_offers', JSON.stringify(offers));
      return true;
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
      return false;
    }
  };

  const handleCancel = () => {
    navigate('/offers');
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-warning text-dark">
              <h3 className="card-title mb-0">Crear Nueva Oferta</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Título */}
                  <div className="col-md-12 mb-3">
                    <label htmlFor="titulo" className="form-label">Título de la Oferta *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      placeholder="Ej: Oferta Especial de Verano"
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
                      placeholder="Describe los detalles de la oferta, beneficios, etc."
                    />
                    {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
                  </div>

                  {/* Categoría y Tipo */}
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
                    <label htmlFor="tipoOferta" className="form-label">Tipo de Oferta</label>
                    <select
                      className="form-select"
                      id="tipoOferta"
                      name="tipoOferta"
                      value={formData.tipoOferta}
                      onChange={handleChange}
                    >
                      {offerTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Precio y Descuento */}
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

                  {/* Participantes */}
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
                      placeholder="50"
                    />
                    {errors.maxParticipantes && <div className="invalid-feedback">{errors.maxParticipantes}</div>}
                  </div>

                  {/* Fechas */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="fechaInicio" className="form-label">Fecha de Inicio *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.fechaInicio ? 'is-invalid' : ''}`}
                      id="fechaInicio"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.fechaInicio && <div className="invalid-feedback">{errors.fechaInicio}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="fechaFin" className="form-label">Fecha de Fin *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.fechaFin ? 'is-invalid' : ''}`}
                      id="fechaFin"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleChange}
                      min={formData.fechaInicio || new Date().toISOString().split('T')[0]}
                    />
                    {errors.fechaFin && <div className="invalid-feedback">{errors.fechaFin}</div>}
                  </div>

                  {/* Condiciones e Imagen */}
                  <div className="col-md-12 mb-3">
                    <label htmlFor="condiciones" className="form-label">Condiciones de la Oferta</label>
                    <textarea
                      className="form-control"
                      id="condiciones"
                      name="condiciones"
                      rows="2"
                      value={formData.condiciones}
                      onChange={handleChange}
                      placeholder="Términos y condiciones, restricciones, etc."
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
                      placeholder="https://ejemplo.com/imagen-oferta.jpg"
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
                    className="btn btn-warning"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creando...
                      </>
                    ) : (
                      'Crear Oferta'
                    )}
                  </button>
                </div>

                <div className="mt-3">
                  <small className="text-muted">
                    * Campos obligatorios. Las ofertas creadas requieren aprobación del administrador.
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

export default CreateOfferForm;