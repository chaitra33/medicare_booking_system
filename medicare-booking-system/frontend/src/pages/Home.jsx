import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Carousel Data
  const services = [
    {
      id: 1,
      title: 'Cardiology',
      description: 'Comprehensive heart care with advanced diagnostic and treatment options for cardiovascular conditions.',
      image: '/assets/images/cardiology.png',
      tech: ['ECG', 'Heart Surgery']
    },
    {
      id: 2,
      title: 'Neurology',
      description: 'Expert care for disorders of the nervous system, including brain, spinal cord, and nerves.',
      image: '/assets/images/neurology.png',
      tech: ['MRI', 'EEG', 'Neurosurgery']
    },
    {
      id: 3,
      title: 'Orthopedics',
      description: 'Specialized treatment for musculoskeletal issues, joint replacements, and sports injuries.',
      image: '/assets/images/orthopedics.png',
      tech: ['X-Ray', 'Physiotherapy']
    },
    {
      id: 4,
      title: 'Pediatrics',
      description: 'Dedicated healthcare for infants, children, and adolescents with a focus on preventive care.',
      image: '/assets/images/pediatrics.png',
      tech: ['Vaccination', 'Child Care']
    },
    {
      id: 5,
      title: 'Dermatology',
      description: 'Advanced skin care treatments for medical and cosmetic conditions using latest technology.',
      image: '/assets/images/dermatology.png',
      tech: ['Laser Therapy', 'Skin Biopsy']
    },
    {
      id: 6,
      title: 'General Surgery',
      description: 'Minimally invasive and traditional surgical procedures for a wide range of conditions.',
      image: '/assets/images/surgery.png',
      tech: ['Laparoscopy', 'Endoscopy', 'Trauma Surgery']
    }
  ];

  // Skills/Specialties Data
  const specialties = [
    { name: 'Emergency Care', level: 98, category: 'urgent', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg> },
    { name: '24/7 Support', level: 100, category: 'support', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
    { name: 'Online Booking', level: 95, category: 'digital', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { name: 'Telemedicine', level: 90, category: 'digital', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg> },
    { name: 'Lab Tests', level: 92, category: 'diagnostic', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 2v7.31"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path></svg> },
    { name: 'Pharmacy', level: 88, category: 'support', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg> },
    { name: 'Vaccination', level: 94, category: 'preventive', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> },
    { name: 'Health Checkups', level: 96, category: 'preventive', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> },
    { name: 'Ambulance', level: 99, category: 'urgent', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> },
    { name: 'ICU Services', level: 97, category: 'urgent', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg> },
    { name: 'Radiology', level: 93, category: 'diagnostic', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> },
    { name: 'Nutrition', level: 85, category: 'preventive', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m17 17-1.4-1.4"></path><path d="m17 7-1.4 1.4"></path><path d="m7 17 1.4-1.4"></path><path d="m7 7 1.4 1.4"></path></svg> }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Carousel Auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [services.length]);

  // Particles Effect
  const particlesRef = useRef(null);
  useEffect(() => {
    if (particlesRef.current) {
      const container = particlesRef.current;
      container.innerHTML = '';
      const particleCount = 15;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (18 + Math.random() * 8) + 's';
        container.appendChild(particle);
      }
    }
  }, []);

  // Stats Animation
  const statsRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          statNumbers.forEach(number => {
            if (!number.classList.contains('animated')) {
              number.classList.add('animated');
              const target = parseInt(number.dataset.target);
              let current = 0;
              const duration = 2000;
              const step = target / (duration / 16);
              
              const counter = setInterval(() => {
                current += step;
                if (current >= target) {
                  number.textContent = target;
                  clearInterval(counter);
                } else {
                  number.textContent = Math.floor(current);
                }
              }, 16);
            }
          });
        }
      });
    }, { threshold: 0.5 });

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getCarouselItemStyle = (index) => {
    const totalItems = services.length;
    let offset = index - activeIndex;
    
    if (offset > totalItems / 2) offset -= totalItems;
    else if (offset < -totalItems / 2) offset += totalItems;
    
    const absOffset = Math.abs(offset);
    const sign = offset < 0 ? -1 : 1;
    const isMobile = window.innerWidth <= 768;
    
    let style = {
      transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
      position: 'absolute',
      left: '50%',
      top: '50%',
      transformOrigin: 'center center',
    };

    if (absOffset === 0) {
      style.transform = 'translate(-50%, -50%) translateZ(0) scale(1)';
      style.opacity = 1;
      style.zIndex = 10;
    } else if (absOffset === 1) {
      const translateX = sign * (isMobile ? 280 : 400);
      const rotation = isMobile ? 25 : 30;
      const scale = isMobile ? 0.88 : 0.85;
      style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) rotateY(${-sign * rotation}deg) scale(${scale})`;
      style.opacity = 0.8;
      style.zIndex = 5;
    } else if (absOffset === 2) {
      const translateX = sign * (isMobile ? 420 : 600);
      const rotation = isMobile ? 35 : 40;
      const scale = isMobile ? 0.75 : 0.7;
      style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-350px) rotateY(${-sign * rotation}deg) scale(${scale})`;
      style.opacity = 0.5;
      style.zIndex = 3;
    } else {
      style.transform = 'translate(-50%, -50%) translateZ(-500px) scale(0.5)';
      style.opacity = 0;
      style.zIndex = 1;
    }

    return style;
  };

  const filteredSpecialties = activeCategory === 'all' 
    ? specialties 
    : specialties.filter(s => s.category === activeCategory);

  return (
    <>
      {/* Loading Screen */}
      <div className={`loader ${!loading ? 'hidden' : ''}`} id="loader">
        <div className="loader-content">
          <div className="loader-prism">
            <div className="prism-face"></div>
            <div className="prism-face"></div>
            <div className="prism-face"></div>
          </div>
          <div style={{ color: 'var(--accent-purple)', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '3px' }}>
            Initializing System...
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="carousel-container">
          <div className="carousel">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="carousel-item"
                style={getCarouselItemStyle(index)}
                onClick={() => setActiveIndex(index)}
              >
                <div className="card">
                  <div className="card-number">0{service.id}</div>
                  <div className="card-image">
                    <img src={service.image} alt={service.title} />
                  </div>
                  <h3 className="card-title">{service.title}</h3>
                  <p className="card-description">{service.description}</p>
                  <div className="card-tech">
                    {service.tech.map((t, i) => (
                      <span key={i} className="tech-badge">{t}</span>
                    ))}
                  </div>
                  <Link to="/doctors">
                    <button className="card-cta">Book Now</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="carousel-controls">
            <button className="carousel-btn" onClick={() => setActiveIndex((prev) => (prev - 1 + services.length) % services.length)}>‹</button>
            <button className="carousel-btn" onClick={() => setActiveIndex((prev) => (prev + 1) % services.length)}>›</button>
          </div>
          
          <div className="carousel-indicators">
            {services.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section" id="about">
        <div className="philosophy-container">
          <div className="prism-line"></div>
          
          <h2 className="philosophy-headline">
            Redefining<br />Healthcare
          </h2>
          
          <p className="philosophy-subheading">
            At MediCare, we combine advanced medical technology with compassionate care to provide a seamless healthcare experience. Your well-being is our priority.
          </p>
          
          <div className="philosophy-pillars">
            <div className="pillar">
              <div className="pillar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <h3 className="pillar-title">Excellence</h3>
              <p className="pillar-description">
                Top-tier medical professionals and state-of-the-art facilities ensuring the highest standards of care.
              </p>
            </div>
            
            <div className="pillar">
              <div className="pillar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path><path d="M9 21h6"></path></svg>
              </div>
              <h3 className="pillar-title">Innovation</h3>
              <p className="pillar-description">
                Leveraging the latest medical advancements and digital solutions for accurate diagnosis and treatment.
              </p>
            </div>
            
            <div className="pillar">
              <div className="pillar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <h3 className="pillar-title">Care</h3>
              <p className="pillar-description">
                Patient-centric approach with 24/7 support and personalized treatment plans for every individual.
              </p>
            </div>
          </div>
          
          <div className="philosophy-particles" ref={particlesRef}></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" id="stats" ref={statsRef}>
        <div className="section-header">
          <h2 className="section-title">Our Impact</h2>
          <p className="section-subtitle">Delivering quality healthcare with measurable results</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="stat-number" data-target="15000">0</div>
            <div className="stat-label">Patients Treated</div>
            <p className="stat-description">Successfully treated patients across various specialties with high satisfaction rates.</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div className="stat-number" data-target="50">0</div>
            <div className="stat-label">Expert Doctors</div>
            <p className="stat-description">Highly qualified and experienced medical professionals dedicated to your health.</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="stat-number" data-target="15">0</div>
            <div className="stat-label">Years Experience</div>
            <p className="stat-description">Over a decade of excellence in providing healthcare services to the community.</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            </div>
            <div className="stat-number" data-target="25">0</div>
            <div className="stat-label">Awards Won</div>
            <p className="stat-description">Recognized for excellence in patient care and medical innovation.</p>
          </div>
        </div>
      </section>

      {/* Skills/Services Section */}
      <section className="skills-section" id="services">
        <div className="skills-container">
          <div className="section-header">
            <h2 className="section-title">Medical Services</h2>
            <p className="section-subtitle">Comprehensive healthcare solutions for all your needs</p>
          </div>
          
          <div className="skill-categories">
            {['all', 'urgent', 'preventive', 'diagnostic', 'digital', 'support'].map(cat => (
              <div
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'All Services' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
            ))}
          </div>

          <div className="skills-hexagon-grid">
            {filteredSpecialties.map((skill, index) => (
              <div key={index} className="skill-hexagon" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="hexagon-inner">
                  <div className="hexagon-content">
                    <div className="skill-icon-hex" style={{ color: 'var(--accent-cyan)', marginBottom: '10px' }}>
                      {skill.icon}
                    </div>
                    <div className="skill-name-hex">{skill.name}</div>
                    <div className="skill-level">
                      <div className="skill-level-fill" style={{ width: `${skill.level}%` }}></div>
                    </div>
                    <div className="skill-percentage-hex">{skill.level}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="section-header">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle">We are here to help you. Contact us for any queries.</p>
        </div>
        
        <div className="contact-container">
          <div className="contact-info">
            <div className="info-item">
              <div className="info-icon">L</div>
              <div className="info-text">
                <h4>Location</h4>
                <p>123 Medical Center Dr, Health City</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">E</div>
              <div className="info-text">
                <h4>Email</h4>
                <p>contact@medicare.com</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">P</div>
              <div className="info-text">
                <h4>Phone</h4>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" required></textarea>
            </div>
            
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Home;
