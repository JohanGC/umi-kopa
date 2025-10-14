import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const ChangePasswordForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        addNotification('Todos los campos son requeridos', 'error');
        return;
      }

      if (formData.newPassword.length < 6) {
        addNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        addNotification('Las contraseñas nuevas no coinciden', 'error');
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        addNotification('La nueva contraseña debe ser diferente a la actual', 'error');
        return;
      }

      // Simular cambio de contraseña (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la llamada real a la API:
      // await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      
      addNotification('✅ Contraseña cambiada exitosamente', 'success');
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
      // Limpiar formulario
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      addNotification(error.message || '❌ Error al cambiar la contraseña', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 6) return { strength: 1, text: 'Muy débil' };
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    const texts = ['', 'Débil', 'Moderada', 'Fuerte', 'Muy fuerte'];
    return { strength, text: texts[strength] };
  };

  const newPasswordStrength = passwordStrength(formData.newPassword);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">🔐 Cambiar Contraseña</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">Contraseña Actual *</label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">Nueva Contraseña *</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                {formData.newPassword && (
                  <div className="mt-1">
                    <div className="progress" style={{height: '5px'}}>
                      <div 
                        className={`progress-bar ${
                          newPasswordStrength.strength === 1 ? 'bg-danger' :
                          newPasswordStrength.strength === 2 ? 'bg-warning' :
                          newPasswordStrength.strength === 3 ? 'bg-info' : 'bg-success'
                        }`}
                        style={{width: `${(newPasswordStrength.strength / 4) * 100}%`}}
                      ></div>
                    </div>
                    <small className={`${
                      newPasswordStrength.strength === 1 ? 'text-danger' :
                      newPasswordStrength.strength === 2 ? 'text-warning' :
                      newPasswordStrength.strength === 3 ? 'text-info' : 'text-success'
                    }`}>
                      Fortaleza: {newPasswordStrength.text}
                    </small>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la nueva contraseña"
                  required
                />
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <small className="text-danger">Las contraseñas no coinciden</small>
                )}
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <small className="text-success">✓ Las contraseñas coinciden</small>
                )}
              </div>

              <div className="alert alert-info small">
                <strong>💡 Recomendaciones de seguridad:</strong>
                <ul className="mb-0 mt-1">
                  <li>Mínimo 6 caracteres</li>
                  <li>Incluye mayúsculas y minúsculas</li>
                  <li>Agrega números y caracteres especiales</li>
                  <li>No uses contraseñas obvias</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-warning"
                disabled={isSubmitting || 
                  !formData.currentPassword || 
                  !formData.newPassword || 
                  !formData.confirmPassword ||
                  formData.newPassword !== formData.confirmPassword ||
                  formData.newPassword.length < 6
                }
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Cambiando...
                  </>
                ) : (
                  '🔐 Cambiar Contraseña'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;