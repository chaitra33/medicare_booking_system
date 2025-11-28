const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Total users by role
    const [userStats] = await db.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE is_active = true 
      GROUP BY role
    `);

    // Total appointments by status
    const [appointmentStats] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM appointments 
      GROUP BY status
    `);

    // Recent appointments (last 7 days)
    const [recentAppointments] = await db.query(`
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Total revenue (completed appointments)
    const [revenueStats] = await db.query(`
      SELECT SUM(d.consultation_fee) as total_revenue
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.status = 'completed'
    `);

    // Monthly appointment trend (last 6 months)
    const [monthlyTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(appointment_date, '%Y-%m') as month,
        COUNT(*) as count
      FROM appointments
      WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(appointment_date, '%Y-%m')
      ORDER BY month
    `);

    // Top doctors by appointments
    const [topDoctors] = await db.query(`
      SELECT 
        d.id,
        CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
        d.specialization,
        COUNT(a.id) as appointment_count
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY d.id
      ORDER BY appointment_count DESC
      LIMIT 5
    `);

    res.json({
      userStats: {
        patients: userStats.find(s => s.role === 'patient')?.count || 0,
        doctors: userStats.find(s => s.role === 'doctor')?.count || 0,
        admins: userStats.find(s => s.role === 'admin')?.count || 0
      },
      appointmentStats: {
        scheduled: appointmentStats.find(s => s.status === 'scheduled')?.count || 0,
        confirmed: appointmentStats.find(s => s.status === 'confirmed')?.count || 0,
        completed: appointmentStats.find(s => s.status === 'completed')?.count || 0,
        cancelled: appointmentStats.find(s => s.status === 'cancelled')?.count || 0
      },
      recentAppointments: recentAppointments[0].count,
      totalRevenue: revenueStats[0].total_revenue || 0,
      monthlyTrend,
      topDoctors
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { role, search } = req.query;
    
    let query = 'SELECT id, email, role, first_name, last_name, phone, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await db.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]);
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self
    if (id == req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all appointments (admin view)
router.get('/appointments', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let query = `
      SELECT 
        a.*,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND a.appointment_date = ?';
      params.push(date);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [appointments] = await db.query(query, params);
    res.json(appointments);
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
