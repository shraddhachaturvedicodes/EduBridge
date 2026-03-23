import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LeftNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      icon: '🏠',
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['student', 'faculty', 'admin', 'management']
    },
    {
      icon: '🎯',
      label: 'Recommendation Engine',
      path: '/recommendations',
      roles: ['student']
    },
    {
      icon: '💬',
      label: 'Submit Feedback',
      path: '/feedback',
      roles: ['student']
    },
    {
      icon: '📊',
      label: 'Ranking Analytics',
      path: '/analytics',
      roles: ['student', 'faculty', 'management', 'admin']
    },
    {
      icon: '📅',
      label: 'Timetable',
      path: '/timetable',
      roles: ['student', 'faculty', 'management', 'admin']
    },
    {
      icon: '💌',
      label: 'Messages',
      path: '/messages',
      roles: ['student', 'faculty', 'management', 'admin']
    },
    {
      icon: '📚',
      label: 'Courses',
      path: '/courses',
      roles: ['student', 'faculty', 'management', 'admin']
    },
    {
      icon: '👥',
      label: 'Faculty Management',
      path: '/faculty-management',
      roles: ['admin', 'management']
    },
    {
      icon: '🎓',
      label: 'Student Management',
      path: '/student-management',
      roles: ['admin', 'management']
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || 'student')
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      width: 280,
      background: '#0f2a3d',
      minHeight: '100vh',
      padding: '24px 0',
      position: 'sticky',
      top: 0,
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '0 20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 20
      }}>
        <div style={{
          fontSize: 14,
          color: '#94a3b8',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 600
        }}>
          
        </div>
      </div>

      {/* Menu Items */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '0 12px'
      }}>
        {filteredMenuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: isActive(item.path)
                ? 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
                : 'transparent',
              color: isActive(item.path) ? '#fff' : '#cbd5e1',
              fontWeight: isActive(item.path) ? 600 : 500,
              fontSize: 14,
              position: 'relative'
            }}
            onMouseOver={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)';
                e.currentTarget.style.color = '#2dd4bf';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            {/* Active Indicator */}
            {isActive(item.path) && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 4,
                height: 24,
                background: '#fff',
                borderRadius: '0 4px 4px 0'
              }} />
            )}

            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        padding: '0 20px'
      }}>
        <div style={{
          padding: 16,
          background: 'rgba(45, 212, 191, 0.1)',
          borderRadius: 10,
          border: '1px solid rgba(45, 212, 191, 0.2)'
        }}>
          <div style={{
            fontSize: 12,
            color: '#2dd4bf',
            fontWeight: 600,
            marginBottom: 6
          }}>
            Need Help?
          </div>
          <div style={{
            fontSize: 11,
            color: '#94a3b8',
            lineHeight: 1.5
          }}>
            Contact support for any issues or questions
          </div>
        </div>
      </div>
    </div>
  );
}