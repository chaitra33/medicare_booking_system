import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import { toast } from 'react-toastify';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentsAPI.updateStatus(id, 'cancelled', 'Cancelled by patient');
      toast.success('Appointment cancelled successfully');
      loadAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'badge-primary',
      confirmed: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-primary';
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['scheduled', 'confirmed'].includes(apt.status);
    if (filter === 'past') return ['completed', 'cancelled'].includes(apt.status);
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-2xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>My Appointments 📅</h1>
        <Link to="/doctors">
          <button className="btn btn-primary">
            + Book New Appointment
          </button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        marginBottom: 'var(--spacing-2xl)',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'all', label: 'All' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ].map(tab => (
          <button
            key={tab.value}
            className={`btn ${filter === tab.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📅</div>
          <h3>No appointments found</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xl)' }}>
            {filter === 'all' 
              ? 'You haven\'t booked any appointments yet'
              : `No ${filter} appointments`
            }
          </p>
          <Link to="/doctors">
            <button className="btn btn-primary">
              Find a Doctor
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {filteredAppointments.map(apt => (
            <div key={apt.id} className="card" style={{ 
              borderLeft: `4px solid ${
                apt.status === 'completed' ? 'var(--accent-green)' :
                apt.status === 'cancelled' ? 'var(--accent-red)' :
                'var(--primary-color)'
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                {/* Left Side - Doctor Info */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'var(--primary-gradient)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: '800'
                    }}>
                      {apt.doctor_name[0]}
                    </div>
                    <div>
                      <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                        Dr. {apt.doctor_name}
                      </h3>
                      <span className="badge badge-primary">
                        {apt.specialization}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 'var(--spacing-md)',
                    marginTop: 'var(--spacing-lg)'
                  }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                        Date
                      </div>
                      <div style={{ fontWeight: '600' }}>
                        📅 {new Date(apt.appointment_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                        Time
                      </div>
                      <div style={{ fontWeight: '600' }}>
                        🕐 {apt.appointment_time.slice(0, 5)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                        Fee
                      </div>
                      <div style={{ fontWeight: '600', color: 'var(--accent-green)' }}>
                        ₹{apt.consultation_fee}
                      </div>
                    </div>
                  </div>

                  {apt.symptoms && (
                    <div style={{ 
                      marginTop: 'var(--spacing-md)', 
                      padding: 'var(--spacing-md)', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: 'var(--radius-md)' 
                    }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                        Symptoms
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)' }}>
                        {apt.symptoms}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Status & Actions */}
                <div style={{ textAlign: 'right' }}>
                  <span className={'badge ' + getStatusBadge(apt.status)} style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {apt.status.toUpperCase()}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                    {apt.status === 'scheduled' || apt.status === 'confirmed' ? (
                      <>
                        <button className="btn btn-secondary btn-sm">
                          📝 Reschedule
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          ❌ Cancel
                        </button>
                      </>
                    ) : apt.status === 'completed' ? (
                      <Link to={`/medical-records?appointment=${apt.id}`}>
                        <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                          📋 View Record
                        </button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div style={{ 
        marginTop: 'var(--spacing-2xl)', 
        textAlign: 'center', 
        color: 'var(--text-tertiary)',
        fontSize: 'var(--font-size-sm)'
      }}>
        Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default MyAppointments;
