import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const CreateOfferForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    descuento: '',
    categoria: 'temporada',
    precioOriginal: '',
    maxParticipantes: '',
    fechaInicio: '',
    fechaFin: '',
    ubicacion: '',
    condiciones: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConditionChange = (index, value) => {
    const nuevasCondiciones = [...formData.condiciones];
    nuevasCondiciones[index] = value;
    setFormData(prev => ({
      ...prev,
      condiciones: nuevasCondiciones
    }));
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      condiciones: [...prev.condiciones, '']
    }));
  };

  const removeCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      condiciones: prev.condiciones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (parseInt(formData.descuento) <= 0 || parseInt(formData.descuento) >= 100) {
        addNotification('El descuento debe estar entre 1% y 99%', 'error');
        return;
      }

      if (new Date(formData.fechaInicio) >= new Date(formData.fechaFin)) {
        addNotification('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
        return;
      }

      // Simular envío a la API (reemplazar con llamada real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification('✅ Oferta creada exitosamente. Esperando aprobación.', 'success');
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
      // Redirigir a mis ofertas
      navigate('/my-offers');
      
    } catch (error) {
      addNotification('❌ Error al crear la oferta', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateFinalPrice = () => {
    const precio = parseFloat(formData.precioOriginal) || 0;
    const descuento = parseFloat(formData.descuento) || 0;
    return precio * (1 - descuento / 100);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">🏷️ Crear Nueva Oferta</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="titulo" className="form-label">Título de la Oferta *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      placeholder="Ej: Oferta de Verano 2024"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="categoria" className="form-label">Categoría *</label>
                    <select
                      className="form-select"
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="temporada">Temporada</option>
                      <option value="nocturna">Nocturna</option>
                      <option value="fin-de-semana">Fin de Semana</option>
                      <option value="flash">Oferta Flash</option>
                      <option value="especial">Especial</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción *</label>
                <textarea
                  className="form-control"
                  id="descripcion"
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describe detalladamente tu oferta..."
                  required
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="precioOriginal" className="form-label">Precio Original ($) *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="precioOriginal"
                      name="precioOriginal"
                      value={formData.precioOriginal}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="descuento" className="form-label">Descuento (%) *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="descuento"
                      name="descuento"
                      value={formData.descuento}
                      onChange={handleChange}
                      min="1"
                      max="99"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Precio Final</label>
                    <div className="form-control bg-light">
                      <strong className="text-success">${calculateFinalPrice().toFixed(2)}</strong>
                      <small className="text-muted ms-2">
                        (Ahorro: ${(formData.precioOriginal - calculateFinalPrice()).toFixed(2)})
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="maxParticipantes" className="form-label">Máximo Participantes *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxParticipantes"
                      name="maxParticipantes"
                      value={formData.maxParticipantes}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="ubicacion" className="form-label">Ubicación *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="ubicacion"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      placeholder="Dirección o lugar de la oferta"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="fechaInicio" className="form-label">Fecha Inicio *</label>
                    <input
                      type="date"
                      className="form-control"
                      id="fechaInicio"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="fechaFin" className="form-label">Fecha Fin *</label>
                    <input
                      type="date"
                      className="form-control"
                      id="fechaFin"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleChange}
                      min={formData.fechaInicio}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Condiciones de la Oferta</label>
                {formData.condiciones.map((condition, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      value={condition}
                      onChange={(e) => handleConditionChange(index, e.target.value)}
                      placeholder={`Condición ${index + 1}`}
                    />
                    {formData.condiciones.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeCondition(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={addCondition}
                >
                  + Agregar Condición
                </button>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creando...
                  </>
                ) : (
                  '🚀 Crear Oferta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOfferForm;