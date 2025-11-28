const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { sendAppointmentConfirmation, sendCancellationEmail } = require('../utils/emailService');

// Get all appointments (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, date, doctorId, patientId } = req.query;
    let query = `
      SELECT 
        a.*,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        pu.email as patient_email,
        pu.phone as patient_phone,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        du.email as doctor_email,
        d.specialization,
        d.consultation_fee
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
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
    }

    // Additional filters
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (date) {
      query += ' AND a.appointment_date = ?';
      params.push(date);
    }
    if (doctorId) {
      query += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }
    if (patientId) {
      query += ' AND a.patient_id = ?';
      params.push(patientId);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [appointments] = await db.query(query, params);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available time slots for a doctor on a specific date
router.get('/available-slots/:doctorId/:date', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    // Get day of week from date
    const appointmentDate = new Date(date);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[appointmentDate.getDay()];

    // Get doctor's schedule for this day
    const [schedules] = await db.query(
      `SELECT start_time, end_time FROM doctor_schedules 
       WHERE doctor_id = ? AND day_of_week = ? AND is_available = true`,
      [doctorId, dayOfWeek]
    );

    if (schedules.length === 0) {
      return res.json({ availableSlots: [] });
    }

    const schedule = schedules[0];
    
    // Get already booked appointments for this doctor on this date
    const [bookedAppointments] = await db.query(
      `SELECT appointment_time FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND status IN ('scheduled', 'confirmed')`,
      [doctorId, date]
    );

    const bookedTimes = bookedAppointments.map(apt => apt.appointment_time);

    // Generate time slots (30-minute intervals)
    const slots = [];
    const startTime = new Date(`2000-01-01 ${schedule.start_time}`);
    const endTime = new Date(`2000-01-01 ${schedule.end_time}`);

    while (startTime < endTime) {
      const timeString = startTime.toTimeString().slice(0, 5);
      const isBooked = bookedTimes.some(bookedTime => bookedTime === timeString + ':00');
      
      slots.push({
        time: timeString,
        available: !isBooked
      });

      startTime.setMinutes(startTime.getMinutes() + 30);
    }

    res.json({ availableSlots: slots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book new appointment
router.post('/', authenticateToken, authorizeRole('patient'), async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, symptoms, notes } = req.body;

    // Validation
    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Get patient ID from user ID
    const [patients] = await db.query('SELECT id FROM patients WHERE user_id = ?', [req.user.userId]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    const patientId = patients[0].id;

    // Check if slot is available
    const [existingAppointment] = await db.query(
      `SELECT * FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
       AND status IN ('scheduled', 'confirmed')`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existingAppointment.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const [result] = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, symptoms, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [patientId, doctorId, appointmentDate, appointmentTime, symptoms, notes]
    );

    // Get appointment details for email
    const [appointmentDetails] = await db.query(
      `SELECT 
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        pu.email as patient_email,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        d.specialization,
        a.appointment_date,
        a.appointment_time
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE a.id = ?`,
      [result.insertId]
    );

    // Send confirmation email
    if (appointmentDetails.length > 0) {
      const details = appointmentDetails[0];
      await sendAppointmentConfirmation(details.patient_email, {
        patientName: details.patient_name,
        doctorName: details.doctor_name,
        specialization: details.specialization,
        date: new Date(details.appointment_date).toLocaleDateString(),
        time: details.appointment_time
      });
    }

    res.status(201).json({ 
      message: 'Appointment booked successfully',
      appointmentId: result.insertId 
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    if (!['scheduled', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get appointment details
    const [appointments] = await db.query(
      `SELECT 
        a.*,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        pu.email as patient_email,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE a.id = ?`,
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update status
    await db.query(
      'UPDATE appointments SET status = ?, cancellation_reason = ? WHERE id = ?',
      [status, cancellationReason, id]
    );

    // Send cancellation email if cancelled
    if (status === 'cancelled') {
      const appointment = appointments[0];
      await sendCancellationEmail(appointment.patient_email, {
        patientName: appointment.patient_name,
        doctorName: appointment.doctor_name,
        date: new Date(appointment.appointment_date).toLocaleDateString(),
        time: appointment.appointment_time,
        reason: cancellationReason
      });
    }

    res.json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [appointments] = await db.query(
      `SELECT 
        a.*,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        pu.email as patient_email,
        pu.phone as patient_phone,
        pu.date_of_birth as patient_dob,
        p.blood_group,
        p.allergies,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        du.email as doctor_email,
        d.specialization,
        d.qualification,
        d.consultation_fee
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE a.id = ?`,
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointments[0]);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
