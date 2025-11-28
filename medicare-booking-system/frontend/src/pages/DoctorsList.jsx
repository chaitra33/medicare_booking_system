import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import { toast } from 'react-toastify';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    search: ''
  });

  useEffect(() => {
    loadDoctors();
    loadSpecializations();
  }, [filters]);

  const loadDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll(filters);
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecializations = async () => {
    try {
      const response = await doctorsAPI.getSpecializations();
      setSpecializations(response.data);
    } catch (error) {
      console.error('Failed to load specializations');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-2xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1>Find Your Doctor 👨‍⚕️</h1>
        <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-tertiary)' }}>
          Browse our network of qualified healthcare professionals
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <div className="grid grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Doctors</label>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Search by name or specialization..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Specialization</label>
            <select
              name="specialization"
              className="form-control"
              value={filters.specialization}
              onChange={handleFilterChange}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔍</div>
          <h3>No doctors found</h3>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: '2rem' }}>
          {doctors.map(doctor => (
            <div key={doctor.id} className="card doctor-card" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              padding: '0',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              transition: 'all 0.3s ease'
            }}>
              {/* Card Header with Background */}
              <div style={{
                height: '100px',
                background: 'var(--primary-gradient)',
                position: 'relative',
                marginBottom: '60px'
              }}>
                {/* Doctor Avatar */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'white',
                  padding: '4px',
                  position: 'absolute',
                  bottom: '-60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-color)'
                  }}>
                    {doctor.profile_image ? (
                      <img 
                        src={doctor.profile_image} 
                        alt={`${doctor.first_name} ${doctor.last_name}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <>{doctor.first_name[0]}{doctor.last_name[0]}</>
                    )}
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div style={{ padding: '0 1.5rem 1.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                    {doctor.specialization}
                  </span>
                </div>

                <p style={{ 
                  color: 'var(--text-tertiary)', 
                  fontSize: '0.9rem', 
                  marginBottom: '1rem',
                  minHeight: '40px'
                }}>
                  {doctor.qualification}
                </p>

                {/* Stats Row */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.5rem',
                  padding: '1rem 0',
                  borderTop: '1px solid var(--bg-tertiary)',
                  borderBottom: '1px solid var(--bg-tertiary)',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Exp</div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{doctor.experience_years}+ Yrs</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--bg-tertiary)', borderRight: '1px solid var(--bg-tertiary)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Fees</div>
                    <div style={{ fontWeight: '600', color: 'var(--accent-green)' }}>₹{doctor.consultation_fee}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Rating</div>
                    <div style={{ fontWeight: '600', color: 'var(--accent-orange)' }}>⭐ {doctor.rating || '5.0'}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
                  <Link to={`/doctors/${doctor.id}`} style={{ width: '100%' }}>
                    <button className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem' }}>
                      Profile
                    </button>
                  </Link>
                  <Link to={`/book-appointment/${doctor.id}`} style={{ width: '100%' }}>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '0.5rem' }}>
                      Book
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Count */}
      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }}>
        Showing {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default DoctorsList;
