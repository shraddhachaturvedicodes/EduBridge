// src/pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0f2a3d' }}>
      <PublicNavbar />
      
      {/* Hero Section */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5%',
        background: 'linear-gradient(135deg, #0f2a3d 0%, #1a3f5c 100%)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Left Side - Text */}
          <div style={{ color: '#fff', paddingTop: 40 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              marginBottom: 30
            }}>
              <div style={{
                width: 60,
                height: 60,
                background: '#2dd4bf',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30
              }}>
                🎓
              </div>
              <h1 style={{
                fontSize: 48,
                margin: 0,
                fontWeight: 700,
                letterSpacing: -1
              }}>
                EduBridge
              </h1>
            </div>

            <h2 style={{
              fontSize: 42,
              marginBottom: 20,
              color: '#2dd4bf',
              fontWeight: 600,
              lineHeight: 1.2
            }}>
              Unified Academic Collaboration Platform
            </h2>

            <p style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: '#cbd5e1',
              marginBottom: 40,
              maxWidth: 560
            }}>
              Connecting students, faculty, and management in one powerful platform. 
              Eliminate dependency on WhatsApp, email chains, and disconnected tools — 
              everything you need for academic collaboration, in one place.
            </p>

            <div style={{ display: 'flex', gap: 20 }}>
              <button
                onClick={() => navigate('/features')}
                style={{
                  padding: '16px 32px',
                  background: '#2dd4bf',
                  color: '#0f2a3d',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Explore Features
              </button>
              
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: '#fff',
                  border: '2px solid #2dd4bf',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(45, 212, 191, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right Side - Login Card Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: 40,
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              width: '100%',
              maxWidth: 480
            }}>
              <h3 style={{
                textAlign: 'center',
                fontSize: 28,
                marginBottom: 10,
                color: '#0f2a3d'
              }}>
                Welcome Back
              </h3>
              <p style={{
                textAlign: 'center',
                color: '#64748b',
                marginBottom: 30
              }}>
                Sign in to your account
              </p>

              <div style={{
                display: 'flex',
                gap: 10,
                marginBottom: 25
              }}>
                {['Faculty', 'Student', 'Management'].map((role) => (
                  <button
                    key={role}
                    onClick={() => navigate('/login', { state: { role: role.toLowerCase() } })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: role === 'Faculty' ? '#2dd4bf' : '#f1f5f9',
                      color: role === 'Faculty' ? '#fff' : '#64748b',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#2dd4bf';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = role === 'Faculty' ? '#2dd4bf' : '#f1f5f9';
                      e.currentTarget.style.color = role === 'Faculty' ? '#fff' : '#64748b';
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <input
                placeholder="Enter your email or username"
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  marginBottom: 16,
                  fontSize: 15,
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="password"
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  marginBottom: 20,
                  fontSize: 15,
                  boxSizing: 'border-box'
                }}
              />

              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  padding: 16,
                  background: '#2dd4bf',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>

              <p style={{
                textAlign: 'center',
                marginTop: 20,
                color: '#64748b',
                fontSize: 14
              }}>
                Don't have an account?{' '}
                <span
                  onClick={() => navigate('/signup')}
                  style={{
                    color: '#2dd4bf',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}