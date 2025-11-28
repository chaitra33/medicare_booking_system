# 🚀 Deployment Guide - MediCare

## Deployment Options

### Option 1: Deploy to Render (Recommended - Free Tier Available)

#### Backend Deployment

1. **Sign up at [Render.com](https://render.com)**

2. **Create New Web Service**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `backend` directory as root

3. **Configure Build Settings**

   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. **Add Environment Variables**

   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<your-mysql-host>
   DB_USER=<your-mysql-user>
   DB_PASSWORD=<your-mysql-password>
   DB_NAME=medicare_db
   JWT_SECRET=<generate-strong-random-string>
   FRONTEND_URL=<your-frontend-url>
   ```

5. **Deploy MySQL Database**

   - Use Render's PostgreSQL (requires schema migration) OR
   - Use [PlanetScale](https://planetscale.com/) for free MySQL
   - Get connection details and update environment variables

6. **Initialize Database**
   - After deployment, run init script via Render shell
   - Or manually create tables using SQL from `config/initDb.js`

#### Frontend Deployment

1. **Build Frontend Locally**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Render Static Site**

   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select `frontend` directory
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variable**
   ```
   VITE_API_URL=<your-backend-url>/api
   ```

---

### Option 2: Deploy to Netlify (Frontend) + Railway (Backend)

#### Frontend on Netlify

1. **Visit [Netlify.com](https://netlify.com)**

2. **New Site from Git**

   - Connect GitHub repository
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

3. **Environment Variables**

   ```
   VITE_API_URL=<your-backend-api-url>
   ```

4. **Deploy**

#### Backend on Railway

1. **Visit [Railway.app](https://railway.app)**

2. **New Project**

   - Deploy from GitHub repo
   - Select `backend` directory

3. **Add MySQL Database**

   - Click "+ New" → "Database" → "MySQL"
   - Copy connection details

4. **Environment Variables**

   - Railway auto-fills database variables
   - Add remaining:
     ```
     NODE_ENV=production
     JWT_SECRET=<random-string>
     FRONTEND_URL=<netlify-url>
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=<your-email>
     EMAIL_PASSWORD=<app-password>
     ```

5. **Deploy & Initialize Database**
   - Deploy backend
   - Run init script via Railway CLI

---

### Option 3: Vercel (Frontend) + Heroku (Backend)

#### Frontend on Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

Follow prompts and set environment variables in Vercel dashboard.

#### Backend on Heroku

1. **Install Heroku CLI**

   ```bash
   heroku login
   ```

2. **Create Heroku App**

   ```bash
   cd backend
   heroku create medicare-api
   ```

3. **Add MySQL Add-on**

   ```bash
   heroku addons:create jawsdb:kitefin
   ```

4. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=<your-secret>
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

---

## Database Deployment Options

### Option 1: PlanetScale (Free MySQL - Recommended)

1. Sign up at [planetscale.com](https://planetscale.com/)
2. Create new database
3. Get connection string
4. Run init script locally to populate

### Option 2: Railway MySQL

- Built-in with Railway backend deployment
- Automatic connection variables

### Option 3: AWS RDS

- Production-grade, scalable
- Requires AWS account
- More complex setup

---

## Post-Deployment Checklist

### Backend

- [ ] API health check works: `<backend-url>/api/health`
- [ ] CORS configured for frontend domain
- [ ] Database initialized with sample data
- [ ] Environment variables set correctly
- [ ] SSL/HTTPS enabled

### Frontend

- [ ] App loads without errors
- [ ] API calls working
- [ ] Login/Register functional
- [ ] Appointments can be booked
- [ ] All routes accessible

---

## Environment Variables Summary

### Backend (.env)

```env
NODE_ENV=production
PORT=10000
DB_HOST=<mysql-host>
DB_USER=<mysql-user>
DB_PASSWORD=<mysql-password>
DB_NAME=medicare_db
JWT_SECRET=<generate-strong-secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<app-password>
FRONTEND_URL=<deployed-frontend-url>
```

### Frontend (.env)

```env
VITE_API_URL=<deployed-backend-url>/api
```

---

## Testing Deployed Application

1. **Visit Frontend URL**
2. **Try Login** with demo credentials
3. **Browse Doctors**
4. **Book Appointment** (if logged in as patient)
5. **Check Email** for confirmation
6. **Test Admin Dashboard** (login as admin)

---

## Monitoring & Maintenance

### Logs

- **Render**: View logs in dashboard
- **Railway**: `railway logs`
- **Heroku**: `heroku logs --tail`

### Database Backups

- Set up automatic backups through your database provider
- Export data regularly

### Updates

```bash
git push origin main
```

Most platforms auto-deploy on push to main branch.

---

## Cost Estimates

### Free Tier (Perfect for Demo/Assessment)

- **Frontend**: Netlify/Vercel (Free)
- **Backend**: Render/Railway (Free tier)
- **Database**: PlanetScale (Free tier - 5GB)
- **Total**: $0/month ✅

### Production Ready

- **Frontend**: Netlify Pro ($19/mo)
- **Backend**: Render Starter ($7/mo)
- **Database**: PlanetScale Scaler ($29/mo)
- **Total**: ~$55/month

---

## Troubleshooting

### CORS Errors

- Add frontend URL to CORS whitelist in backend
- Update FRONTEND_URL environment variable

### Database Connection Failed

- Check database URL and credentials
- Verify database is running
- Check firewall/network settings

### Build Failures

- Clear node_modules and reinstall
- Check Node version compatibility
- Review build logs for specific errors

---

## Support

For deployment issues:

1. Check platform documentation
2. Review deployment logs
3. Verify environment variables
4. Contact support of respective platforms

---

**Note**: For the assessment submission, include your deployed URLs in the README.md file.
