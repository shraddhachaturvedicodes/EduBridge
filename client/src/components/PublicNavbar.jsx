import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: '#0f2a3d',
      padding: '20px 5%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: 40,
          height: 40,
          background: '#2dd4bf',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20
        }}>
          🎓
        </div>
        <span style={{
          color: '#fff',
          fontSize: 24,
          fontWeight: 700
        }}>
          EduBridge
        </span>
      </div>

      {/* Navigation Links */}
      <div style={{
        display: 'flex',
        gap: 35,
        alignItems: 'center'
      }}>
        {[
          { path: '/', label: 'Home' },
          { path: '/features', label: 'Features' },
          { path: '/about', label: 'About' },
          { path: '/contact', label: 'Contact' }
        ].map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              background: 'none',
              border: 'none',
              color: isActive(link.path) ? '#2dd4bf' : '#cbd5e1',
              fontSize: 16,
              fontWeight: isActive(link.path) ? 600 : 500,
              cursor: 'pointer',
              transition: 'color 0.3s',
              padding: '8px 0',
              borderBottom: isActive(link.path) ? '2px solid #2dd4bf' : '2px solid transparent'
            }}
            onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
            onMouseOut={(e) => {
              if (!isActive(link.path)) e.target.style.color = '#cbd5e1';
            }}
          >
            {link.label}
          </button>
        ))}

        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 24px',
            background: '#2dd4bf',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 15,
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#22c7b0'}
          onMouseOut={(e) => e.target.style.background = '#2dd4bf'}
        >
          Sign In
        </button>
      </div>
    </nav>
  );
}