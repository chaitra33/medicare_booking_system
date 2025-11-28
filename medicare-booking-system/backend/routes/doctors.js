const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all doctors (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    
    let query = `
      SELECT 
        d.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.gender,
        u.profile_image
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.is_active = true
    `;
    const params = [];

    if (specialization) {
      query += ' AND d.specialization = ?';
      params.push(specialization);
    }

    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR d.specialization LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY d.rating DESC, d.experience_years DESC';

    const [doctors] = await db.query(query, params);
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [doctors] = await db.query(
      `SELECT 
        d.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.gender,
        u.address,
        u.profile_image
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?`,
      [id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get doctor's schedule
    const [schedules] = await db.query(
      'SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY FIELD(day_of_week, "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")',
      [id]
    );

    const doctor = doctors[0];
    doctor.schedules = schedules;

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all specializations
router.get('/specializations/list', async (req, res) => {
  try {
    const [specializations] = await db.query(
      'SELECT DISTINCT specialization FROM doctors ORDER BY specialization'
    );
    res.json(specializations.map(s => s.specialization));
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor schedule (doctor only)
router.post('/:id/schedule', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { schedules } = req.body; // Array of { dayOfWeek, startTime, endTime, isAvailable }

    // Verify doctor owns this profile
    const [doctors] = await db.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
    if (doctors.length === 0 || doctors[0].user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete existing schedules
    await db.query('DELETE FROM doctor_schedules WHERE doctor_id = ?', [id]);

    // Insert new schedules
    for (const schedule of schedules) {
      await db.query(
        `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available)
         VALUES (?, ?, ?, ?, ?)`,
        [id, schedule.dayOfWeek, schedule.startTime, schedule.endTime, schedule.isAvailable]
      );
    }

    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor statistics (for doctor dashboard)
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Total appointments
    const [totalAppts] = await db.query(
      'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ?',
      [id]
    );

    // Today's appointments
    const [todayAppts] = await db.query(
      'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()',
      [id]
    );

    // Upcoming appointments
    const [upcomingAppts] = await db.query(
      `SELECT COUNT(*) as total FROM appointments 
       WHERE doctor_id = ? AND appointment_date >= CURDATE() AND status IN ('scheduled', 'confirmed')`,
      [id]
    );

    // Completed appointments
    const [completedAppts] = await db.query(
      'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ? AND status = "completed"',
      [id]
    );

    res.json({
      totalAppointments: totalAppts[0].total,
      todayAppointments: todayAppts[0].total,
      upcomingAppointments: upcomingAppts[0].total,
      completedAppointments: completedAppts[0].total
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
