const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const medicalRecordRoutes = require('./routes/medicalRecords');
const adminRoutes = require('./routes/admin');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MediCare API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║          🏥  MediCare API Server Running  🏥          ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server:     http://localhost:${PORT}`);
  console.log(`🔗 API Base:   http://localhost:${PORT}/api`);
  console.log(`💚 Health:     http://localhost:${PORT}/api/health`);
  console.log(`📝 Env:        ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📋 Available Routes:');
  console.log('   POST   /api/auth/register       - Register new user');
  console.log('   POST   /api/auth/login          - User login');
  console.log('   GET    /api/auth/me             - Get current user');
  console.log('   GET    /api/doctors             - Get all doctors');
  console.log('   GET    /api/appointments        - Get appointments');
  console.log('   POST   /api/appointments        - Book appointment');
  console.log('   GET    /api/medical-records     - Get medical records');
  console.log('   GET    /api/admin/stats         - Admin dashboard');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

module.exports = app;
