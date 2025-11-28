import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-icon">
              <div className="logo-prism">
                <div className="prism-shape"></div>
              </div>
            </div>
            <span className="logo-text">
              <span className="prism">MEDI</span>
              <span className="flux">CARE</span>
            </span>
          </div>
          <p className="footer-description">
            Refracting complex healthcare challenges into brilliant solutions through the convergence of medical expertise and technology.
          </p>
          <div className="footer-social">
            <a href="#" className="social-icon">f</a>
            <a href="#" className="social-icon">t</a>
            <a href="#" className="social-icon">in</a>
            <a href="#" className="social-icon">ig</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Services</h4>
          <div className="footer-links">
            <Link to="/doctors">Find a Doctor</Link>
            <Link to="/appointments">Book Appointment</Link>
            <Link to="/medical-records">Medical Records</Link>
            <Link to="/emergency">Emergency Care</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Company</h4>
          <div className="footer-links">
            <Link to="/about">About Us</Link>
            <Link to="/team">Our Team</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/press">Press Kit</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Resources</h4>
          <div className="footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Support</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="copyright">
          &copy; 2025 MediCare System. All rights reserved.
        </div>
        <div className="footer-credits">
          Designed for <a href="#">Healthcare Excellence</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
