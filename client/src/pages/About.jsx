// src/pages/About.jsx
import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function About() {
  const benefits = [
    'Role-based access for Faculty, Students & Management',
    'Mentor discovery and project lifecycle management',
    'Centralized communication — no more WhatsApp groups',
    'Structured feedback collection and analysis',
    'Real-time announcements and schedule management',
    'Comprehensive management dashboard and reporting'
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PublicNavbar />
      
      <div style={{
        paddingTop: 100,
        paddingBottom: 80,
        maxWidth: 1200,
        margin: '0 auto',
        padding: '100px 40px 80px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center'
        }}>
          {/* Left Side - Text Content */}
          <div>
            <h1 style={{
              fontSize: 48,
              marginBottom: 30,
              color: '#0f2a3d',
              fontWeight: 700
            }}>
              Why EduBridge?
            </h1>
            
            <p style={{
              fontSize: 17,
              lineHeight: 1.8,
              color: '#475569',
              marginBottom: 30
            }}>
              Educational institutions rely on dozens of disconnected platforms — 
              WhatsApp for communication, email for announcements, spreadsheets for 
              scheduling, and more. EduBridge eliminates this fragmentation by bringing 
              everything into one unified platform, purpose-built for academic collaboration.
            </p>

            <div style={{ marginBottom: 40 }}>
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                    marginBottom: 16
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#2dd4bf',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <span style={{
                    fontSize: 16,
                    color: '#334155'
                  }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Stats Card */}
          <div style={{
            background: '#0f2a3d',
            borderRadius: 20,
            padding: 50,
            color: '#fff'
          }}>
            <div style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#2dd4bf',
              marginBottom: 20
            }}>
              1
            </div>
            <h3 style={{
              fontSize: 32,
              marginBottom: 10,
              fontWeight: 600
            }}>
              Platform
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: 40,
              fontSize: 16
            }}>
              for your entire institution
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20
            }}>
              <div style={{
                background: 'rgba(45, 212, 191, 0.1)',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: '#2dd4bf',
                  marginBottom: 8
                }}>
                  3
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#94a3b8'
                }}>
                  User Roles
                </div>
              </div>

              <div style={{
                background: 'rgba(45, 212, 191, 0.1)',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: '#2dd4bf',
                  marginBottom: 8
                }}>
                  6+
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#94a3b8'
                }}>
                  Core Features
                </div>
              </div>

              <div style={{
                background: 'rgba(45, 212, 191, 0.1)',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: '#2dd4bf',
                  marginBottom: 8
                }}>
                  0
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#94a3b8'
                }}>
                  External Apps
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}