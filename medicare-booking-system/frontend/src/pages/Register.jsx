import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    // Patient specific
    bloodGroup: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Doctor specific
    specialization: '',
    qualification: '',
    experienceYears: '',
    consultationFee: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

    const result = await register({ ...formData, role });

    if (result.success) {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  const inputStyle = {
    background: 'var(--primary-black)',
    border: '1px solid var(--metal-dark)',
    color: 'var(--text-primary)'
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card" style={{ background: 'var(--carbon-medium)', border: '1px solid var(--metal-dark)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Join MediCare for better healthcare
            </p>
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: '30px' }}>
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>I am a:</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="button"
                className="btn"
                style={{ 
                  flex: 1, 
                  background: role === 'patient' ? 'var(--accent-blue)' : 'var(--carbon-dark)',
                  color: role === 'patient' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--metal-dark)'
                }}
                onClick={() => setRole('patient')}
              >
                Patient
              </button>
              <button
                type="button"
                className="btn"
                style={{ 
                  flex: 1, 
                  background: role === 'doctor' ? 'var(--accent-purple)' : 'var(--carbon-dark)',
                  color: role === 'doctor' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--metal-dark)'
                }}
                onClick={() => setRole('doctor')}
              >
                Doctor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--metal-dark)', paddingBottom: '10px' }}>Basic Information</h3>
            
            <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Gender</label>
                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Address</label>
              <textarea
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                style={inputStyle}
              />
            </div>

            {/* Patient Specific Fields */}
            {role === 'patient' && (
              <>
                <h3 style={{ marginTop: '30px', marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--metal-dark)', paddingBottom: '10px' }}>
                  Medical Information
                </h3>
                
                <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Blood Group</label>
                    <select
                      name="bloodGroup"
                      className="form-control"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      className="form-control"
                      placeholder="e.g., Penicillin, Pollen"
                      value={formData.allergies}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      className="form-control"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Emergency Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      className="form-control"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Doctor Specific Fields */}
            {role === 'doctor' && (
              <>
                <h3 style={{ marginTop: '30px', marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--metal-dark)', paddingBottom: '10px' }}>
                  Professional Information
                </h3>
                
                <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Specialization *</label>
                    <input
                      type="text"
                      name="specialization"
                      className="form-control"
                      placeholder="e.g., Cardiologist"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Qualification *</label>
                    <input
                      type="text"
                      name="qualification"
                      className="form-control"
                      placeholder="e.g., MD, MBBS"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Experience (Years)</label>
                    <input
                      type="number"
                      name="experienceYears"
                      className="form-control"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      min="0"
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Consultation Fee (₹)</label>
                    <input
                      type="number"
                      name="consultationFee"
                      className="form-control"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    placeholder="Tell us about yourself and your expertise..."
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '30px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
