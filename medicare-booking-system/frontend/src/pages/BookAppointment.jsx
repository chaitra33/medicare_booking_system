import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    symptoms: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isPatient) {
      toast.error('Please login as a patient to book an appointment');
      navigate('/login');
      return;
    }

    loadDoctor();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [doctorId, isAuthenticated, isPatient, navigate]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadDoctor = async () => {
    try {
      const response = await doctorsAPI.getById(doctorId);
      setDoctor(response.data);
    } catch (error) {
      toast.error('Failed to load doctor details');
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const response = await appointmentsAPI.getAvailableSlots(doctorId, selectedDate);
      setAvailableSlots(response.data.availableSlots || []);
      setSelectedTime(''); // Reset selected time when date changes
    } catch (error) {
      toast.error('Failed to load available slots');
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    setBookingLoading(true);

    try {
      await appointmentsAPI.create({
        doctorId: parseInt(doctorId),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime + ':00',
        symptoms: formData.symptoms,
        notes: formData.notes
      });

      toast.success('Appointment booked successfully! Check your email for confirmation.');
      navigate('/appointments');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book appointment';
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  // Get minimum and maximum dates
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-2xl)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--spacing-2xl)' }}>📅 Book Appointment</h1>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {/* Doctor Info Card */}
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              margin: '0 auto var(--spacing-lg)',
              overflow: 'hidden',
              border: '2px solid var(--accent-purple)',
              background: 'var(--carbon-dark)'
            }}>
              {doctor.profile_image ? (
                <img 
                  src={doctor.profile_image} 
                  alt={`Dr. ${doctor.first_name}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: '800'
                }}>
                  {doctor.first_name[0]}{doctor.last_name[0]}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Dr. {doctor.first_name} {doctor.last_name}</h3>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <span className="badge badge-primary" style={{ display: 'inline-block' }}>
                  {doctor.specialization}
                </span>
              </div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-lg)' }}>
                {doctor.qualification}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                  Experience
                </div>
                <div style={{ fontWeight: '600' }}>
                  {doctor.experience_years || 0} years
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                  Consultation Fee
                </div>
                <div style={{ fontWeight: '700', fontSize: 'var(--font-size-xl)', color: 'var(--accent-green)' }}>
                  ₹{doctor.consultation_fee || 'N/A'}
                </div>
              </div>
            </div>

            {doctor.bio && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                {doctor.bio}
              </p>
            )}
          </div>

          {/* Booking Form */}
          <div className="card">
            <form onSubmit={handleSubmit}>
              {/* Date Selection */}
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={minDate}
                  max={maxDate}
                  required
                />
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>
                  You can book up to 30 days in advance
                </p>
              </div>

              {/* Time Slots */}
              <div className="form-group">
                <label className="form-label">Available Time Slots</label>
                
                {availableSlots.length === 0 ? (
                  <div style={{
                    padding: 'var(--spacing-xl)',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📅</div>
                    <p style={{ color: 'var(--text-tertiary)' }}>
                      No available slots for this date
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                      Try selecting a different date
                    </p>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: 'var(--spacing-sm)'
                  }}>
                    {availableSlots.map(slot => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className="btn"
                        style={{
                          background: slot.time === selectedTime 
                            ? 'var(--primary-gradient)' 
                            : slot.available 
                              ? 'var(--carbon-light)' 
                              : 'var(--bg-tertiary)',
                          color: slot.time === selectedTime 
                            ? 'white' 
                            : slot.available 
                              ? 'var(--text-primary)' 
                              : 'var(--text-tertiary)',
                          border: `1px solid ${slot.time === selectedTime ? 'transparent' : 'var(--border-color)'}`,
                          padding: 'var(--spacing-sm)',
                          fontSize: 'var(--font-size-sm)',
                          cursor: slot.available ? 'pointer' : 'not-allowed',
                          opacity: slot.available ? 1 : 0.5,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Symptoms */}
              <div className="form-group">
                <label className="form-label">Symptoms / Reason for Visit</label>
                <textarea
                  name="symptoms"
                  className="form-control"
                  placeholder="Describe your symptoms or reason for consultation..."
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  className="form-control"
                  placeholder="Any additional information for the doctor..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                />
              </div>

              {/* Summary */}
              {selectedTime && (
                <div className="alert alert-info">
                  <div>
                    <strong>📋 Appointment Summary</strong>
                  </div>
                  <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                    <div>Doctor: Dr. {doctor.first_name} {doctor.last_name}</div>
                    <div>Date: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div>Time: {selectedTime}</div>
                    <div>Fee: ₹{doctor.consultation_fee}</div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: 'var(--spacing-lg)' }}
                disabled={!selectedTime || bookingLoading}
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
