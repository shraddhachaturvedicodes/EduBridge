// Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState(() => {
    // Remember which notifications user already read
    const saved = localStorage.getItem('readNotificationIds');
    return saved ? JSON.parse(saved) : [];
  });
  const dropdownRef = useRef(null);

  // Fetch notifications every 30 seconds
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update unread count when notifications or readIds change
  useEffect(() => {
    const unread = notifications.filter(n => !readIds.includes(n.id));
    setUnreadCount(unread.length);
  }, [notifications, readIds]);

  async function fetchNotifications() {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }

  function handleBellClick() {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      // Mark all as read
      const allIds = notifications.map(n => n.id);
      setReadIds(allIds);
      localStorage.setItem('readNotificationIds', JSON.stringify(allIds));
    }
  }

  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  function getTypeColor(type) {
    if (type === 'notice') return '#2dd4bf';
    if (type === 'message') return '#6366f1';
    if (type === 'feedback') return '#f59e0b';
    return '#64748b';
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20
        }}>
          🎓
        </div>
        <span style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#0f2a3d',
          letterSpacing: '-0.5px'
        }}>
          EduBridge
        </span>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* 🔔 Notification Bell */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={handleBellClick}
            style={{
              position: 'relative',
              background: showDropdown ? '#f0fffe' : '#f8fafc',
              border: showDropdown ? '1px solid #2dd4bf' : '1px solid #e2e8f0',
              borderRadius: 10,
              width: 44,
              height: 44,
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            🔔
            {/* Red Badge */}
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: 20,
                height: 20,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 54,
              right: 0,
              width: 360,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 999,
              overflow: 'hidden'
            }}>
              {/* Dropdown Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#0f2a3d'
                }}>
                  🔔 Notifications
                </span>
                <span style={{
                  fontSize: 12,
                  color: '#64748b'
                }}>
                  {notifications.length} total
                </span>
              </div>

              {/* Notification List */}
              <div style={{
                maxHeight: 400,
                overflowY: 'auto'
              }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: 40,
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: 14
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                    You're all caught up!
                  </div>
                ) : (
                  notifications.map((n, i) => {
                    const isUnread = !readIds.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        style={{
                          padding: '14px 20px',
                          borderBottom: i < notifications.length - 1
                            ? '1px solid #f1f5f9' : 'none',
                          background: isUnread ? '#f0fffe' : '#fff',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.background = isUnread ? '#f0fffe' : '#fff'}
                        onClick={() => {
                          setShowDropdown(false);
                          if (n.type === 'message') navigate('/messages');
                          else if (n.type === 'notice') navigate('/dashboard');
                          else if (n.type === 'feedback') navigate('/feedback');
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 10
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: getTypeColor(n.type),
                              marginBottom: 4
                            }}>
                              {n.title}
                            </div>
                            <div style={{
                              fontSize: 13,
                              color: '#475569',
                              lineHeight: 1.4
                            }}>
                              {n.body}
                            </div>
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: '#94a3b8',
                            whiteSpace: 'nowrap',
                            marginTop: 2
                          }}>
                            {formatTime(n.created_at)}
                          </div>
                        </div>
                        {isUnread && (
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#2dd4bf',
                            marginTop: 6
                          }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid #f1f5f9',
                textAlign: 'center',
                background: '#f8fafc'
              }}>
                <span
                  onClick={() => {
                    setReadIds(notifications.map(n => n.id));
                    localStorage.setItem('readNotificationIds',
                      JSON.stringify(notifications.map(n => n.id)));
                    setShowDropdown(false);
                  }}
                  style={{
                    fontSize: 13,
                    color: '#2dd4bf',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Mark all as read ✓
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          background: '#f8fafc',
          borderRadius: 10
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14
          }}>
            {user?.display_name?.charAt(0)?.toUpperCase() ||
             user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#0f2a3d'
            }}>
              {user?.display_name || 'User'}
            </div>
            <div style={{
              fontSize: 12,
              color: '#64748b',
              textTransform: 'capitalize'
            }}>
              {user?.role || 'Student'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 24px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#dc2626';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#ef4444';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}