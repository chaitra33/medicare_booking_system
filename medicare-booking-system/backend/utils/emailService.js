const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send appointment confirmation email
const sendAppointmentConfirmation = async (patientEmail, appointmentDetails) => {
  const { patientName, doctorName, date, time, specialization } = appointmentDetails;

  const mailOptions = {
    from: `"MediCare System" <${process.env.EMAIL_USER}>`,
    to: patientEmail,
    subject: 'Appointment Confirmed - MediCare',
    html: `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmation</title>
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    body { 
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header { 
      background: #2c5282; 
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { 
      font-size: 28px;
      margin-bottom: 5px;
    }
    .content { 
      padding: 30px;
    }
    .status { 
      display: inline-block;
      background: #22863a;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    h2 { 
      font-size: 22px;
      margin-bottom: 10px;
      color: #333;
    }
    .intro { 
      color: #666;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    .details { 
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .row { 
      display: table;
      width: 100%;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .row:last-child { 
      border-bottom: none;
    }
    .label { 
      display: table-cell;
      color: #666;
      font-weight: bold;
      font-size: 13px;
      text-transform: uppercase;
      width: 40%;
      padding-right: 20px;
    }
    .value { 
      display: table-cell;
      color: #333;
      font-weight: bold;
      font-size: 16px;
      text-align: right;
      width: 60%;
    }
    .reminders { 
      background: #fff8e1;
      border: 1px solid #ffd54f;
      border-radius: 6px;
      padding: 20px;
      margin: 30px 0;
    }
    .reminders h3 { 
      color: #5d4037;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .reminders ul { 
      list-style: none;
      color: #5d4037;
    }
    .reminders li { 
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    .reminders li::before {
      content: '•';
      position: absolute;
      left: 0;
      font-size: 18px;
    }
    .button { 
      text-align: center;
      margin-top: 30px;
    }
    .btn { 
      display: inline-block;
      background: #2c5282;
      color: white;
      padding: 12px 35px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .footer { 
      background: #f8f8f8;
      padding: 25px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 13px;
    }
    .footer p { 
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MediCare</h1>
      <p>Excellence in Healthcare</p>
    </div>
    
    <div class="content">
      <div class="status">CONFIRMED</div>
      
      <h2>Hello Rajkumar</h2>
      <p class="intro">Your appointment has been successfully scheduled. We look forward to seeing you.</p>
      
      <div class="details">
        <div class="row">
          <div class="label">Doctor</div>
          <div class="value">Dr. Sarah Johnson</div>
        </div>
        <div class="row">
          <div class="label">Specialization</div>
          <div class="value">Cardiology</div>
        </div>
        <div class="row">
          <div class="label">Date</div>
          <div class="value">December 15, 2025</div>
        </div>
        <div class="row">
          <div class="label">Time</div>
          <div class="value">10:00 AM</div>
        </div>
      </div>
      
      <div class="reminders">
        <h3>Important Reminders</h3>
        <ul>
          <li>Arrive 15 minutes early for check-in</li>
          <li>Bring your photo ID and insurance card</li>
          <li>Wear a face mask if you have symptoms</li>
          <li>Call 24 hours ahead to reschedule</li>
        </ul>
      </div>
      
      <div class="button">
        <a href="#" class="btn">View Full Details</a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>MediCare Health System</strong></p>
      <p>123 Health Avenue, Medical District, NY 10001</p>
      <p>Phone: (555) 123-4567 | Email: contact@medicare.com</p>
    </div>
  </div>
</body>
</html>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
      await transporter.sendMail(mailOptions);
      console.log('✅ Appointment confirmation email sent to:', patientEmail);
    } else {
      console.log('📧 Email simulation (configure EMAIL_USER in .env to send real emails)');
      console.log('   To:', patientEmail);
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

// Send appointment reminder email
const sendAppointmentReminder = async (patientEmail, appointmentDetails) => {
  const { patientName, doctorName, date, time } = appointmentDetails;

  const mailOptions = {
    from: `"MediCare System" <${process.env.EMAIL_USER}>`,
    to: patientEmail,
    subject: 'Reminder: Upcoming Appointment - MediCare',
    html: `
     
    div class="header">
            <h1>🔔 Appointment Reminder</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #4a5568;">Hello ${patientName},</p>
            <p style="color: #718096;">This is a friendly reminder about your appointment tomorrow.</p>
            
            <div class="time-box">
              <p>With <strong>Dr. ${doctorName}</strong></p>
              <h2>${time}</h2>
              <p>${date}</p>
            </div>
            
            <p style="color: #a0aec0; font-size: 14px;">If you need to reschedule, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
      await transporter.sendMail(mailOptions);
      console.log('✅ Reminder email sent to:', patientEmail);
    }
  } catch (error) {
    console.error('❌ Reminder email failed:', error.message);
  }
};

// Send cancellation notification
const sendCancellationEmail = async (patientEmail, appointmentDetails) => {
  const { patientName, doctorName, date, time, reason } = appointmentDetails;

  const mailOptions = {
    from: `"MediCare System" <${process.env.EMAIL_USER}>`,
    to: patientEmail,
    subject: 'Appointment Cancelled - MediCare',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .header { background: #e53e3e; padding: 30px; text-align: center; color: white; }
          .content { padding: 40px 30px; }
          .reason-box { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; color: #c53030; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Cancelled</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #2d3748;">Hello ${patientName},</p>
            <p style="color: #4a5568;">Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
            
            ${reason ? `
              <div class="reason-box">
                <strong>Reason:</strong> ${reason}
              </div>
            ` : ''}
            
            <p style="color: #718096;">You can book a new appointment at your convenience.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
      await transporter.sendMail(mailOptions);
      console.log('✅ Cancellation email sent to:', patientEmail);
    }
  } catch (error) {
    console.error('❌ Cancellation email failed:', error.message);
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendCancellationEmail
};
