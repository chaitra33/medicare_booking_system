const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, dateOfBirth, gender, address } = req.body;

    // Validation
    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be patient or doctor' });
    }

    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle optional fields - convert empty strings to null
    const safePhone = phone || null;
    const safeDob = dateOfBirth || null;
    const safeGender = gender || null;
    const safeAddress = address || null;

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, date_of_birth, gender, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, role, firstName, lastName, safePhone, safeDob, safeGender, safeAddress]
    );

    const userId = result.insertId;

    // Create role-specific entry
    if (role === 'patient') {
      const { bloodGroup, allergies, chronicConditions, emergencyContactName, emergencyContactPhone } = req.body;
      await db.query(
        `INSERT INTO patients (user_id, blood_group, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, bloodGroup, allergies, chronicConditions, emergencyContactName, emergencyContactPhone]
      );
    } else if (role === 'doctor') {
      const { specialization, qualification, experienceYears, consultationFee, bio } = req.body;
      await db.query(
        `INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, specialization, qualification, experienceYears, consultationFee, bio]
      );
    }

    res.status(201).json({ 
      message: 'Registration successful',
      userId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact admin.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === 'patient') {
      const [patients] = await db.query('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      roleData = patients[0];
    } else if (user.role === 'doctor') {
      const [doctors] = await db.query('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
      roleData = doctors[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        roleId: roleData?.id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      profileImage: user.profile_image,
      roleId: roleData?.id,
      roleData
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, role, first_name, last_name, phone, date_of_birth, gender, address, profile_image FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Get role-specific data
    let roleData = null;
    if (user.role === 'patient') {
      const [patients] = await db.query('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      roleData = patients[0];
    } else if (user.role === 'doctor') {
      const [doctors] = await db.query('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
      roleData = doctors[0];
    }

    res.json({
      ...user,
      roleData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, gender, address } = req.body;

    await db.query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?
       WHERE id = ?`,
      [firstName, lastName, phone, dateOfBirth, gender, address, req.user.userId]
    );

    // Update role-specific data
    if (req.user.role === 'patient') {
      const { bloodGroup, allergies, chronicConditions, emergencyContactName, emergencyContactPhone } = req.body;
      await db.query(
        `UPDATE patients SET blood_group = ?, allergies = ?, chronic_conditions = ?, 
         emergency_contact_name = ?, emergency_contact_phone = ?
         WHERE user_id = ?`,
        [bloodGroup, allergies, chronicConditions, emergencyContactName, emergencyContactPhone, req.user.userId]
      );
    } else if (req.user.role === 'doctor') {
      const { specialization, qualification, experienceYears, consultationFee, bio } = req.body;
      await db.query(
        `UPDATE doctors SET specialization = ?, qualification = ?, experience_years = ?, 
         consultation_fee = ?, bio = ?
         WHERE user_id = ?`,
        [specialization, qualification, experienceYears, consultationFee, bio, req.user.userId]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
