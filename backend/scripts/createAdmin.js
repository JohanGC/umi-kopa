const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ofertasapp');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un administrador
    const existingAdmin = await User.findOne({ rol: 'administrador' });
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario administrador:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.nombre}`);
      return;
    }

    // Crear usuario administrador
    const adminUser = new User({
      nombre: 'Administrador Principal',
      email: 'johan@ofertasapp.com',
      password: 'Admin123', // Se encriptará automáticamente
      rol: 'administrador',
      telefono: '+57 300 000 0000',
      empresa: 'OfertasApp',
      direccion: 'Sistema Administrativo',
      verificada: true
    });

    await adminUser.save();
    
    console.log('🎉 Usuario administrador creado exitosamente!');
    console.log('='.repeat(50));
    console.log('🔑 Credenciales de acceso:');
    console.log(`   Email: admin@ofertasapp.com`);
    console.log(`   Password: Admin123456`);
    console.log('='.repeat(50));
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login!');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
};

// Ejecutar el script
createAdminUser();