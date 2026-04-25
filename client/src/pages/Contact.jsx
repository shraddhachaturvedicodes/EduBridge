import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function Contact() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PublicNavbar />
      
      <div style={{
        paddingTop: 120,
        paddingBottom: 80,
        maxWidth: 600,
        margin: '0 auto',
        padding: '120px 40px 80px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 50,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: 36,
            marginBottom: 10,
            color: '#0f2a3d',
            textAlign: 'center'
          }}>
            Get in Touch
          </h1>
          <p style={{
            textAlign: 'center',
            color: '#64748b',
            marginBottom: 40
          }}>
            Have questions? We'd love to hear from you.
          </p>

          <div style={{ marginBottom: 30 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              padding: 20,
              background: '#f8fafc',
              borderRadius: 12,
              marginBottom: 15
            }}>
              <div style={{
                fontSize: 24
              }}>
                📧
              </div>
              <div>
                <div style={{
                  fontSize: 14,
                  color: '#64748b',
                  marginBottom: 4
                }}>
                  Email
                </div>
                <div style={{
                  fontSize: 16,
                  color: '#0f2a3d',
                  fontWeight: 600
                }}>
                  admin@edubridge.com
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              padding: 20,
              background: '#f8fafc',
              borderRadius: 12
            }}>
              <div style={{
                fontSize: 24
              }}>
                📞
              </div>
              <div>
                <div style={{
                  fontSize: 14,
                  color: '#64748b',
                  marginBottom: 4
                }}>
                  Phone
                </div>
                <div style={{
                  fontSize: 16,
                  color: '#0f2a3d',
                  fontWeight: 600
                }}>
                  +91 9628712610
                </div>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: 30,
            marginTop: 30
          }}>
            <h3 style={{
              fontSize: 18,
              marginBottom: 20,
              color: '#0f2a3d'
            }}>
              Quick Links
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 15
            }}>
              <a
                href="/"
                style={{
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#0f2a3d',
                  fontWeight: 500,
                  transition: 'all 0.3s'
                }}
              >
                Home
              </a>
              <a
                href="/features"
                style={{
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#0f2a3d',
                  fontWeight: 500
                }}
              >
                Features
              </a>
              <a
                href="/about"
                style={{
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#0f2a3d',
                  fontWeight: 500
                }}
              >
                About
              </a>
              <a
                href="/login"
                style={{
                  padding: 12,
                  background: '#2dd4bf',
                  borderRadius: 8,
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#fff',
                  fontWeight: 600
                }}
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}