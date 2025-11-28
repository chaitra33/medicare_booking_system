const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get medical records for a patient
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.query;
    
    let query = `
      SELECT 
        mr.*,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        d.specialization,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN patients p ON mr.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by user role
    if (req.user.role === 'patient') {
      query += ' AND p.user_id = ?';
      params.push(req.user.userId);
    } else if (req.user.role === 'doctor') {
      query += ' AND d.user_id = ?';
      params.push(req.user.userId);
    } else if (patientId) {
      query += ' AND mr.patient_id = ?';
      params.push(patientId);
    }

    query += ' ORDER BY mr.record_date DESC, mr.created_at DESC';

    const [records] = await db.query(query, params);
    res.json(records);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new medical record (doctor only)
router.post('/', authenticateToken, authorizeRole('doctor'), async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, prescription, notes, recordDate } = req.body;

    // Get doctor ID from user ID
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.userId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    const doctorId = doctors[0].id;

    // Create medical record
    const [result] = await db.query(
      `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes, record_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, appointmentId, diagnosis, prescription, notes, recordDate || new Date().toISOString().split('T')[0]]
    );

    res.status(201).json({ 
      message: 'Medical record created successfully',
      recordId: result.insertId 
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medical record by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await db.query(
      `SELECT 
        mr.*,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        d.specialization,
        d.qualification,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        pu.date_of_birth as patient_dob,
        p.blood_group,
        p.allergies
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN patients p ON mr.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE mr.id = ?`,
      [id]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medical record (doctor only)
router.put('/:id', authenticateToken, authorizeRole('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescription, notes } = req.body;

    await db.query(
      'UPDATE medical_records SET diagnosis = ?, prescription = ?, notes = ? WHERE id = ?',
      [diagnosis, prescription, notes, id]
    );

    res.json({ message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete medical record (admin or doctor only)
router.delete('/:id', authenticateToken, authorizeRole('doctor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM medical_records WHERE id = ?', [id]);
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
