import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsList from './pages/DoctorsList';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          
          <main style={{ flex: 1, paddingTop: '80px' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<DoctorsList />} />
              
              {/* Patient Routes */}
              <Route 
                path="/book-appointment/:doctorId" 
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <BookAppointment />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/appointments" 
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <MyAppointments />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/medical-records" 
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <div className="container" style={{ paddingTop: '2rem' }}>
                      <h1>Medical Records</h1>
                      <p>Coming soon...</p>
                    </div>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <div className="container" style={{ paddingTop: '2rem' }}>
                      <h1>Profile</h1>
                      <p>Coming soon...</p>
                    </div>
                  </PrivateRoute>
                } 
              />

              {/* Doctor Routes */}
              <Route 
                path="/doctor/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <div className="container" style={{ paddingTop: '2rem' }}>
                      <h1>Doctor Dashboard</h1>
                      <p>Coming soon...</p>
                    </div>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/doctor/appointments" 
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <div className="container" style={{ paddingTop: '2rem' }}>
                      <h1>Doctor Appointments</h1>
                      <p>Coming soon...</p>
                    </div>
                  </PrivateRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <div className="container" style={{ paddingTop: '2rem' }}>
                      <h1>Admin Dashboard</h1>
                      <p>Coming soon...</p>
                    </div>
                  </PrivateRoute>
                } 
              />

              {/* 404 Page */}
              <Route 
                path="*" 
                element={
                  <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>404</div>
                    <h1>Page Not Found</h1>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
                      The page you're looking for doesn't exist.
                    </p>
                    <a href="/">
                      <button className="btn btn-primary">Go Home</button>
                    </a>
                  </div>
                } 
              />
            </Routes>
          </main>

          <Footer />

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
