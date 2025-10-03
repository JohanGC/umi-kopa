import React from 'react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice 
  } = useCart();
  
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      addNotification('El carrito está vacío', 'warning');
      return;
    }
    
    addNotification('¡Compra realizada con éxito!', 'success');
    clearCart();
    navigate('/');
  };

  const handleContinueShopping = () => {
    navigate('/offers');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card shadow">
              <div className="card-body p-5">
                <h2 className="display-1 mb-4">🛒</h2>
                <h3 className="card-title mb-4">Tu carrito está vacío</h3>
                <p className="card-text mb-4">
                  Explora nuestras ofertas y actividades para agregar items a tu carrito.
                </p>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleContinueShopping}
                >
                  Ver Ofertas Disponibles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8">
          <h2 className="mb-4">🛒 Mi Carrito</h2>
          
          {cartItems.map(item => (
            <div key={`${item.type}-${item.id}`} className="card mb-3">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <span className="display-6">{item.image}</span>
                  </div>
                  
                  <div className="col-md-4">
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text text-muted small">{item.description}</p>
                    <span className="badge bg-success">{item.descuento}</span>
                    <span className={`badge ms-2 ${item.type === 'activity' ? 'bg-info' : 'bg-primary'}`}>
                      {item.type === 'activity' ? 'Actividad' : 'Oferta'}
                    </span>
                  </div>
                  
                  <div className="col-md-3">
                    <div className="input-group">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        className="form-control text-center"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, item.type, parseInt(e.target.value))}
                        min="1"
                      />
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-2 text-center">
                    <h5 className="text-primary">
                      ${(100 - parseInt(item.descuento)) * item.quantity}
                    </h5>
                  </div>
                  
                  <div className="col-md-1 text-center">
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(item.id, item.type)}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="d-flex justify-content-between mt-4">
            <button 
              className="btn btn-outline-secondary"
              onClick={clearCart}
            >
              🗑️ Vaciar Carrito
            </button>
            
            <button 
              className="btn btn-outline-primary"
              onClick={handleContinueShopping}
            >
              ← Seguir Comprando
            </button>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h4 className="card-title mb-4">Resumen de Compra</h4>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <span>${getTotalPrice()}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Envío:</span>
                <span className="text-success">Gratis</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <strong className="text-primary">${getTotalPrice()}</strong>
              </div>
              
              <button 
                className="btn btn-success w-100 btn-lg"
                onClick={handleCheckout}
              >
                🎉 Finalizar Compra
              </button>
              
              <div className="mt-3 text-center">
                <small className="text-muted">
                  💳 Pago seguro • 🔒 Datos protegidos
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;