const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Connect without database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('🔄 Initializing Medicare Database...\n');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('✅ Database created/verified');

    await connection.query(`USE ${process.env.DB_NAME}`);

    // Drop tables if they exist to ensure clean slate
    await connection.query('DROP TABLE IF EXISTS notifications');
    await connection.query('DROP TABLE IF EXISTS doctor_schedules');
    await connection.query('DROP TABLE IF EXISTS medical_records');
    await connection.query('DROP TABLE IF EXISTS appointments');
    await connection.query('DROP TABLE IF EXISTS patients');
    await connection.query('DROP TABLE IF EXISTS doctors');
    await connection.query('DROP TABLE IF EXISTS users');
    console.log('✅ Previous tables dropped');

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('patient', 'doctor', 'admin') NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        profile_image VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);
    console.log('✅ Users table created');

    // Create Doctors table (extended info for doctors)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        qualification VARCHAR(255),
        experience_years INT,
        consultation_fee DECIMAL(10, 2),
        availability_status ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
        rating DECIMAL(3, 2) DEFAULT 0.00,
        total_reviews INT DEFAULT 0,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_specialization (specialization)
      )
    `);
    console.log('✅ Doctors table created');

    // Create Patients table (extended info for patients)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        blood_group VARCHAR(10),
        allergies TEXT,
        chronic_conditions TEXT,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Patients table created');

    // Create Appointments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('scheduled', 'confirmed', 'completed', 'cancelled') DEFAULT 'scheduled',
        symptoms TEXT,
        notes TEXT,
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        INDEX idx_date (appointment_date),
        INDEX idx_status (status),
        INDEX idx_doctor_date (doctor_id, appointment_date),
        UNIQUE KEY unique_doctor_slot (doctor_id, appointment_date, appointment_time)
      )
    `);
    console.log('✅ Appointments table created');

    // Create Medical Records table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_id INT,
        diagnosis TEXT,
        prescription TEXT,
        notes TEXT,
        record_date DATE NOT NULL,
        attachments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
        INDEX idx_patient (patient_id),
        INDEX idx_date (record_date)
      )
    `);
    console.log('✅ Medical Records table created');

    // Create Doctor Schedule table (for available time slots)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctor_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        INDEX idx_doctor_day (doctor_id, day_of_week)
      )
    `);
    console.log('✅ Doctor Schedules table created');

    // Create Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('appointment', 'reminder', 'update', 'info') DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, is_read)
      )
    `);
    console.log('✅ Notifications table created');

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone)
      VALUES ('admin@medicare.com', ?, 'admin', 'System', 'Admin', '1234567890')
    `, [adminPassword]);
    console.log('✅ Default admin user created (email: admin@medicare.com, password: admin123)');

    // Insert sample doctors
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    
    const [doctorUser1] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.smith@medicare.com', ?, 'doctor', 'John', 'Smith', '9876543210', 'male', '/assets/images/doctor_smith.png')
    `, [doctorPassword]);

    if (doctorUser1.insertId) {
      const [doctor1] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Cardiologist', 'MD Cardiology', 15, 500.00, 'Experienced cardiologist with 15 years of practice.')
      `, [doctorUser1.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '09:00:00', '17:00:00')
        `, [doctor1.insertId, day]);
      }
    }

    const [doctorUser2] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.patel@medicare.com', ?, 'doctor', 'Priya', 'Patel', '9876543211', 'female', 'https://randomuser.me/api/portraits/women/68.jpg')
    `, [doctorPassword]);

    if (doctorUser2.insertId) {
      const [doctor2] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Dermatologist', 'MD Dermatology', 10, 400.00, 'Specialist in skin care and cosmetic treatments.')
      `, [doctorUser2.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '10:00:00', '18:00:00')
        `, [doctor2.insertId, day]);
      }
    }

    const [doctorUser3] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.kumar@medicare.com', ?, 'doctor', 'Raj', 'Kumar', '9876543212', 'male', 'https://randomuser.me/api/portraits/men/32.jpg')
    `, [doctorPassword]);

    if (doctorUser3.insertId) {
      const [doctor3] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Orthopedic', 'MS Orthopedics', 12, 600.00, 'Expert in bone and joint disorders.')
      `, [doctorUser3.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '08:00:00', '16:00:00')
        `, [doctor3.insertId, day]);
      }
    }

    // New Doctor 4: Pediatrician
    const [doctorUser4] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.johnson@medicare.com', ?, 'doctor', 'Sarah', 'Johnson', '9876543213', 'female', 'https://randomuser.me/api/portraits/women/44.jpg')
    `, [doctorPassword]);

    if (doctorUser4.insertId) {
      const [doctor4] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Pediatrician', 'MD Pediatrics', 8, 450.00, 'Caring pediatrician dedicated to child health and wellness.')
      `, [doctorUser4.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '09:00:00', '16:00:00')
        `, [doctor4.insertId, day]);
      }
    }

    // New Doctor 5: Neurologist
    const [doctorUser5] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.chen@medicare.com', ?, 'doctor', 'David', 'Chen', '9876543214', 'male', 'https://randomuser.me/api/portraits/men/85.jpg')
    `, [doctorPassword]);

    if (doctorUser5.insertId) {
      const [doctor5] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Neurologist', 'MD Neurology', 18, 700.00, 'Specialist in treating complex neurological conditions.')
      `, [doctorUser5.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '10:00:00', '15:00:00')
        `, [doctor5.insertId, day]);
      }
    }

    // New Doctor 6: General Surgeon
    const [doctorUser6] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.wilson@medicare.com', ?, 'doctor', 'Emily', 'Wilson', '9876543215', 'female', 'https://randomuser.me/api/portraits/women/90.jpg')
    `, [doctorPassword]);

    if (doctorUser6.insertId) {
      const [doctor6] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'General Surgeon', 'MS General Surgery', 14, 650.00, 'Skilled surgeon with expertise in minimally invasive procedures.')
      `, [doctorUser6.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '08:00:00', '16:00:00')
        `, [doctor6.insertId, day]);
      }
    }

    // Doctor 7: Cardiologist
    const [doctorUser7] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.brown@medicare.com', ?, 'doctor', 'Michael', 'Brown', '9876543216', 'male', 'https://randomuser.me/api/portraits/men/45.jpg')
    `, [doctorPassword]);

    if (doctorUser7.insertId) {
      const [doctor7] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Cardiologist', 'MD Cardiology', 20, 550.00, 'Senior cardiologist specializing in interventional cardiology.')
      `, [doctorUser7.insertId]);
      
      const days = ['monday', 'wednesday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '10:00:00', '14:00:00')
        `, [doctor7.insertId, day]);
      }
    }

    // Doctor 8: Dermatologist
    const [doctorUser8] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.white@medicare.com', ?, 'doctor', 'Lisa', 'White', '9876543217', 'female', 'https://randomuser.me/api/portraits/women/22.jpg')
    `, [doctorPassword]);

    if (doctorUser8.insertId) {
      const [doctor8] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Dermatologist', 'MD Dermatology', 8, 350.00, 'Expert in cosmetic dermatology and laser treatments.')
      `, [doctorUser8.insertId]);
      
      const days = ['tuesday', 'thursday', 'saturday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '09:00:00', '13:00:00')
        `, [doctor8.insertId, day]);
      }
    }

    // Doctor 9: Orthopedic
    const [doctorUser9] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.wilson.j@medicare.com', ?, 'doctor', 'James', 'Wilson', '9876543218', 'male', 'https://randomuser.me/api/portraits/men/67.jpg')
    `, [doctorPassword]);

    if (doctorUser9.insertId) {
      const [doctor9] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Orthopedic', 'MS Orthopedics', 16, 620.00, 'Specialist in sports medicine and joint replacement.')
      `, [doctorUser9.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '08:00:00', '16:00:00')
        `, [doctor9.insertId, day]);
      }
    }

    // Doctor 10: Pediatrician
    const [doctorUser10] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.garcia@medicare.com', ?, 'doctor', 'Maria', 'Garcia', '9876543219', 'female', 'https://randomuser.me/api/portraits/women/55.jpg')
    `, [doctorPassword]);

    if (doctorUser10.insertId) {
      const [doctor10] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Pediatrician', 'MD Pediatrics', 11, 480.00, 'Compassionate care for newborns and children.')
      `, [doctorUser10.insertId]);
      
      const days = ['monday', 'wednesday', 'friday', 'saturday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '09:00:00', '15:00:00')
        `, [doctor10.insertId, day]);
      }
    }

    // Doctor 11: Neurologist
    const [doctorUser11] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.taylor@medicare.com', ?, 'doctor', 'Robert', 'Taylor', '9876543220', 'male', 'https://randomuser.me/api/portraits/men/12.jpg')
    `, [doctorPassword]);

    if (doctorUser11.insertId) {
      const [doctor11] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Neurologist', 'MD Neurology', 22, 750.00, 'Expert in stroke management and epilepsy.')
      `, [doctorUser11.insertId]);
      
      const days = ['tuesday', 'thursday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '10:00:00', '16:00:00')
        `, [doctor11.insertId, day]);
      }
    }

    // Doctor 12: General Surgeon
    const [doctorUser12] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.martinez@medicare.com', ?, 'doctor', 'Jennifer', 'Martinez', '9876543221', 'female', 'https://randomuser.me/api/portraits/women/33.jpg')
    `, [doctorPassword]);

    if (doctorUser12.insertId) {
      const [doctor12] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'General Surgeon', 'MS General Surgery', 9, 580.00, 'Specializing in abdominal and soft tissue surgeries.')
      `, [doctorUser12.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '08:00:00', '17:00:00')
        `, [doctor12.insertId, day]);
      }
    }

    // Doctor 13: Cardiologist
    const [doctorUser13] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.anderson@medicare.com', ?, 'doctor', 'William', 'Anderson', '9876543222', 'male', 'https://randomuser.me/api/portraits/men/78.jpg')
    `, [doctorPassword]);

    if (doctorUser13.insertId) {
      const [doctor13] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Cardiologist', 'MD Cardiology', 13, 520.00, 'Expert in preventive cardiology and heart health.')
      `, [doctorUser13.insertId]);
      
      const days = ['monday', 'wednesday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '09:00:00', '15:00:00')
        `, [doctor13.insertId, day]);
      }
    }

    // Doctor 14: Dermatologist
    const [doctorUser14] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.etaylor@medicare.com', ?, 'doctor', 'Elizabeth', 'Taylor', '9876543223', 'female', 'https://randomuser.me/api/portraits/women/89.jpg')
    `, [doctorPassword]);

    if (doctorUser14.insertId) {
      const [doctor14] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Dermatologist', 'MD Dermatology', 7, 380.00, 'Specialist in acne treatment and skin rejuvenation.')
      `, [doctorUser14.insertId]);
      
      const days = ['tuesday', 'thursday', 'saturday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '10:00:00', '14:00:00')
        `, [doctor14.insertId, day]);
      }
    }

    // Doctor 15: Orthopedic
    const [doctorUser15] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, profile_image)
      VALUES ('dr.moore@medicare.com', ?, 'doctor', 'Thomas', 'Moore', '9876543224', 'male', 'https://randomuser.me/api/portraits/men/56.jpg')
    `, [doctorPassword]);

    if (doctorUser15.insertId) {
      const [doctor15] = await connection.query(`
        INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
        VALUES (?, 'Orthopedic', 'MS Orthopedics', 19, 680.00, 'Specialist in spine surgery and rehabilitation.')
      `, [doctorUser15.insertId]);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of days) {
        await connection.query(`
          INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '08:00:00', '16:00:00')
        `, [doctor15.insertId, day]);
      }
    }

    console.log('✅ Sample doctors created (password: doctor123)');

    // Insert sample patient
    const patientPassword = await bcrypt.hash('patient123', 10);
    const [patientUser] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role, first_name, last_name, phone, gender, date_of_birth)
      VALUES ('patient@example.com', ?, 'patient', 'Jane', 'Doe', '9999999999', 'female', '1990-05-15')
    `, [patientPassword]);

    if (patientUser.insertId) {
      await connection.query(`
        INSERT INTO patients (user_id, blood_group, allergies, emergency_contact_name, emergency_contact_phone)
        VALUES (?, 'O+', 'None', 'John Doe', '8888888888')
      `, [patientUser.insertId]);
    }

    console.log('✅ Sample patient created (email: patient@example.com, password: patient123)');

    console.log('\n🎉 Database initialization completed successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('   Admin: admin@medicare.com / admin123');
    console.log('   Doctor: dr.smith@medicare.com / doctor123');
    console.log('   Patient: patient@example.com / patient123\n');

    await connection.end();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization
initDatabase();
