# 🚀 Quick Start Guide - MediCare

## Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] MySQL installed and running
- [ ] Git installed

## Step-by-Step Setup (5 minutes)

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

- Open MySQL and create a root password (if not already set)
- Update `backend/.env` file with your MySQL password:
  ```
  DB_PASSWORD=your_mysql_password
  ```

### 3. Initialize Database

```bash
npm run init-db
```

You should see:

```
✅ Database created/verified
✅ Users table created
✅ Doctors table created
✅ Default admin user created
...
```

### 4. Start Backend Server

```bash
npm run dev
```

Server should start on http://localhost:5000

### 5. Install Frontend Dependencies (New Terminal)

```bash
cd frontend
npm install
```

### 6. Start Frontend Server

```bash
npm run dev
```

Frontend should start on http://localhost:3000

## 🎉 You're Done!

Open http://localhost:3000 in your browser

### Test Accounts:

- **Patient**: patient@example.com / patient123
- **Doctor**: dr.smith@medicare.com / doctor123
- **Admin**: admin@medicare.com / admin123

## Common Issues

### MySQL Connection Error

- Make sure MySQL is running
- Check DB_PASSWORD in backend/.env
- Verify DB_USER is 'root' or your MySQL username

### Port Already in Use

- Backend: Change PORT in backend/.env
- Frontend: Change port in frontend/vite.config.js

### Email Notifications Not Working

- Email notifications require Gmail app password
- App works fine without email configuration
- Notifications will show in console logs

## Need Help?

Create an issue on GitHub or contact the developer.
