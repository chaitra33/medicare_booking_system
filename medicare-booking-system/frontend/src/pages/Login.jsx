import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.firstName}!`);
      
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/doctors');
      }
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  const quickLogin = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="card" style={{ background: 'var(--carbon-medium)', border: '1px solid var(--metal-dark)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Sign in to your MediCare account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ background: 'var(--primary-black)', border: '1px solid var(--metal-dark)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ background: 'var(--primary-black)', border: '1px solid var(--metal-dark)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--metal-dark)' }}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>Sign Up</Link>
            </p>

            <div style={{ background: 'var(--carbon-dark)', padding: '20px', borderRadius: '10px', border: '1px solid var(--metal-dark)' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '15px', color: 'var(--text-primary)' }}>
                Quick Login (Demo)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: 'rgba(153, 69, 255, 0.1)', color: 'var(--accent-purple)', width: '100%', border: '1px solid var(--accent-purple)' }}
                  onClick={() => quickLogin('admin@medicare.com', 'admin123')}
                >
                  Admin
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--accent-green)', width: '100%', border: '1px solid var(--accent-green)' }}
                  onClick={() => quickLogin('dr.smith@medicare.com', 'doctor123')}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: 'rgba(0, 168, 255, 0.1)', color: 'var(--accent-blue)', width: '100%', border: '1px solid var(--accent-blue)' }}
                  onClick={() => quickLogin('patient@example.com', 'patient123')}
                >
                  Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
