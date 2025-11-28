import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`} id="header">
      <nav className="nav-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-icon">
            <div className="logo-prism">
              <div className="prism-shape"></div>
            </div>
          </div>
          <span className="logo-text">
            <span className="prism">MEDI</span>
            <span className="flux">CARE</span>
          </span>
        </Link>
        
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`} id="navMenu">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/doctors" className={`nav-link ${isActive('/doctors')}`} onClick={closeMenu}>
              Doctors
            </Link>
          </li>
          
          {isAuthenticated ? (
            <>
              {isPatient && (
                <>
                  <li>
                    <Link to="/appointments" className={`nav-link ${isActive('/appointments')}`} onClick={closeMenu}>
                      My Appointments
                    </Link>
                  </li>
                  <li>
                    <Link to="/medical-records" className={`nav-link ${isActive('/medical-records')}`} onClick={closeMenu}>
                      Records
                    </Link>
                  </li>
                </>
              )}
              
              {isDoctor && (
                <>
                  <li>
                    <Link to="/doctor/dashboard" className={`nav-link ${isActive('/doctor/dashboard')}`} onClick={closeMenu}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/doctor/appointments" className={`nav-link ${isActive('/doctor/appointments')}`} onClick={closeMenu}>
                      Schedule
                    </Link>
                  </li>
                </>
              )}
              
              {isAdmin && (
                <li>
                  <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`} onClick={closeMenu}>
                    Admin Panel
                  </Link>
                </li>
              )}

              <li>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontSize: '14px' }}>
                    {user?.firstName}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-secondary"
                    style={{ padding: '5px 15px', fontSize: '12px' }}
                  >
                    Logout
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none', color: 'white' }} onClick={closeMenu}>
                  Get Started
                </Link>
              </li>
            </>
          )}
        </ul>
        
        <div className={`menu-toggle ${isMobileMenuOpen ? 'active' : ''}`} id="menuToggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
