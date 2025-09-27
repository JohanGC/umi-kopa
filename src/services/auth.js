// Simulación de servicio de autenticación
export const authService = {
  // Obtener usuario actual desde localStorage
  getCurrentUser: () => {
    const userData = localStorage.getItem('ofertasApp_user');
    return userData ? JSON.parse(userData) : null;
  },

  // Iniciar sesión
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      // Simular delay de red
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('ofertasApp_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          const userData = { email: user.email, nombre: user.nombre };
          localStorage.setItem('ofertasApp_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Credenciales incorrectas'));
        }
      }, 1000);
    });
  },

  // Registrar nuevo usuario
  register: (nombre, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('ofertasApp_users') || '[]');
        
        // Verificar si el email ya existe
        if (users.some(u => u.email === email)) {
          reject(new Error('Este email ya está registrado'));
          return;
        }
        
        // Agregar nuevo usuario
        const newUser = { nombre, email, password };
        users.push(newUser);
        localStorage.setItem('ofertasApp_users', JSON.stringify(users));
        
        // Autologin
        const userData = { email, nombre };
        localStorage.setItem('ofertasApp_user', JSON.stringify(userData));
        resolve(userData);
      }, 1000);
    });
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('ofertasApp_user');
  }
};