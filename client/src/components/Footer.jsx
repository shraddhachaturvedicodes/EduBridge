import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: '#0a1f2e',
      color: '#94a3b8',
      padding: '50px 5%',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 40
      }}>
        {/* Company Info */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 15
          }}>
            <div style={{
              width: 35,
              height: 35,
              background: '#2dd4bf',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              🎓
            </div>
            <span style={{
              color: '#fff',
              fontSize: 20,
              fontWeight: 700
            }}>
              EduBridge
            </span>
          </div>
          <p style={{
            lineHeight: 1.7,
            fontSize: 14
          }}>
            Unified Academic Collaboration Platform connecting students, faculty, and management.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            color: '#fff',
            marginBottom: 15,
            fontSize: 16
          }}>
            QUICK LINKS
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            {['Home', 'Features', 'About'].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = '#94a3b8'}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{
            color: '#fff',
            marginBottom: 15,
            fontSize: 16
          }}>
            CONTACT
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            fontSize: 14
          }}>
            <div>admin@edubridge.com</div>
            <div>+91 9628712610</div>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #1e3a4c',
        marginTop: 40,
        paddingTop: 25,
        textAlign: 'center',
        fontSize: 14
      }}>
        © 2026 EduBridge. All rights reserved.
      </div>
    </footer>
  );
}