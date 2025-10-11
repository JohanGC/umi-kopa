import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const CreateActivityForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    descuento: '',
    categoria: 'taller',
    precioOriginal: '',
    maxParticipantes: '',
    fecha: '',
    hora: '',
    duracion: '',
    ubicacion: '',
    requisitos: ['']
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

  const handleRequisitoChange = (index, value) => {
    const nuevosRequisitos = [...formData.requisitos];
    nuevosRequisitos[index] = value;
    setFormData(prev => ({
      ...prev,
      requisitos: nuevosRequisitos
    }));
  };

  const addRequisito = () => {
    setFormData(prev => ({
      ...prev,
      requisitos: [...prev.requisitos, '']
    }));
  };

  const removeRequisito = (index) => {
    setFormData(prev => ({
      ...prev,
      requisitos: prev.requisitos.filter((_, i) => i !== index)
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

      if (new Date(formData.fecha) < new Date().setHours(0, 0, 0, 0)) {
        addNotification('La fecha debe ser hoy o en el futuro', 'error');
        return;
      }

      // Simular envío a la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification('✅ Actividad creada exitosamente. Esperando aprobación.', 'success');
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
      navigate('/my-activities');
      
    } catch (error) {
      addNotification('❌ Error al crear la actividad', 'error');
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
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">🎯 Crear Nueva Actividad</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="titulo" className="form-label">Título de la Actividad *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      placeholder="Ej: Taller de Cocina Italiana"
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
                      <option value="taller">Taller</option>
                      <option value="tour">Tour</option>
                      <option value="clase">Clase</option>
                      <option value="evento">Evento</option>
                      <option value="conferencia">Conferencia</option>
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
                  placeholder="Describe detalladamente tu actividad..."
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
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
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
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="fecha" className="form-label">Fecha *</label>
                    <input
                      type="date"
                      className="form-control"
                      id="fecha"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="hora" className="form-label">Hora *</label>
                    <input
                      type="time"
                      className="form-control"
                      id="hora"
                      name="hora"
                      value={formData.hora}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="duracion" className="form-label">Duración *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="duracion"
                      name="duracion"
                      value={formData.duracion}
                      onChange={handleChange}
                      placeholder="Ej: 2 horas, 1 día, etc."
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
                      placeholder="Dirección o lugar de la actividad"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Requisitos para Participar</label>
                {formData.requisitos.map((requisito, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      value={requisito}
                      onChange={(e) => handleRequisitoChange(index, e.target.value)}
                      placeholder={`Requisito ${index + 1}`}
                    />
                    {formData.requisitos.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeRequisito(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={addRequisito}
                >
                  + Agregar Requisito
                </button>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creando...
                  </>
                ) : (
                  '🎯 Crear Actividad'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityForm;