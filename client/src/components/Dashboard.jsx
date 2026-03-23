import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosInstance';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    faculty: 0,
    students: 0,
    courses: 0,
    avgRating: 0
  });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Set default stats for now
      setStats({
        faculty: 45,
        students: 450,
        courses: 85,
        avgRating: 4.2
      });
      
      // Try to fetch notices
      try {
        const noticesResponse = await axios.get('/api/notices');
        setNotices(noticesResponse.data.slice(0, 5) || []);
      } catch (err) {
        console.log('Could not fetch notices');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div style={{ fontSize: 18, color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      background: '#f8fafc',
      minHeight: 'calc(100vh - 73px)'
    }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#0f2a3d',
          marginBottom: 8
        }}>
          Welcome back, {user?.display_name || 'User'}! 👋
        </h1>
        <p style={{
          fontSize: 16,
          color: '#64748b'
        }}>
          Here's what's happening with your academic portal today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        {/* Faculty Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 16,
          padding: 24,
          color: '#fff',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          transition: 'transform 0.3s',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              👨‍🏫
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
              Faculty
            </div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 4 }}>
            {stats.faculty}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Total Faculty Members
          </div>
        </div>

        {/* Students Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: 16,
          padding: 24,
          color: '#fff',
          boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
          transition: 'transform 0.3s',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              🎓
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
              Students
            </div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 4 }}>
            {stats.students}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Enrolled Students
          </div>
        </div>

        {/* Courses Card */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: 16,
          padding: 24,
          color: '#fff',
          boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
          transition: 'transform 0.3s',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              📚
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
              Courses
            </div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 4 }}>
            {stats.courses}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Active Courses
          </div>
        </div>

        {/* Average Rating Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          borderRadius: 16,
          padding: 24,
          color: '#fff',
          boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)',
          transition: 'transform 0.3s',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              ⭐
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
              Avg Rating
            </div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 4 }}>
            {stats.avgRating}/5.0
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Faculty Average Rating
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 24
      }}>
        {/* Left Column - Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Enrollment Trends Chart */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 28,
            boxShadow: '0 4px 20px rgba(15, 42, 61, 0.08)'
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#0f2a3d',
              marginBottom: 24
            }}>
              Student Enrollment Trends
            </h3>
            
            {/* Simple Bar Chart */}
            <div style={{
              position: 'relative',
              height: 250,
              background: 'linear-gradient(to top, #e0f2fe 0%, transparent 100%)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around'
            }}>
              {[420, 435, 445, 450].map((value, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{
                    height: `${(value / 450) * 180}px`,
                    width: 60,
                    background: 'linear-gradient(to top, #0ea5e9, #38bdf8)',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scaleY(1.05)';
                    e.currentTarget.style.background = 'linear-gradient(to top, #0284c7, #0ea5e9)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scaleY(1)';
                    e.currentTarget.style.background = 'linear-gradient(to top, #0ea5e9, #38bdf8)';
                  }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: -25,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0f2a3d'
                    }}>
                      {value}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#64748b',
                    fontWeight: 600
                  }}>
                    {2019 + index}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 16,
              padding: 12,
              background: '#f0f9ff',
              borderRadius: 8,
              fontSize: 13,
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 16 }}>📈</span>
              <span>Steady growth of <strong>7.1%</strong> over the last 4 years</span>
            </div>
          </div>

          {/* Task Progress */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 28,
            boxShadow: '0 4px 20px rgba(15, 42, 61, 0.08)'
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#0f2a3d',
              marginBottom: 24
            }}>
              Task Progress
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              {[
                { name: 'Course Planning', progress: 95, color: '#10b981' },
                { name: 'Assignments Review', progress: 70, color: '#3b82f6' },
                { name: 'Grade Submission', progress: 45, color: '#f59e0b' },
                { name: 'Feedback Collection', progress: 85, color: '#8b5cf6' }
              ].map((task, index) => (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8
                  }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f2a3d'
                    }}>
                      {task.name}
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: task.color
                    }}>
                      {task.progress}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 8,
                    background: '#f1f5f9',
                    borderRadius: 999,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${task.progress}%`,
                      height: '100%',
                      background: task.color,
                      borderRadius: 999,
                      transition: 'width 1s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Notices */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 4px 20px rgba(15, 42, 61, 0.08)',
          height: 'fit-content'
        }}>
          <h3 style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#0f2a3d',
            marginBottom: 20
          }}>
            Recent Notices 📢
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {notices.length > 0 ? notices.map((notice, index) => (
              <div
                key={notice.notice_id || index}
                style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 12,
                  borderLeft: '4px solid #2dd4bf',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0f2a3d',
                  marginBottom: 6
                }}>
                  {notice.title}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#64748b',
                  marginBottom: 8,
                  lineHeight: 1.5
                }}>
                  {notice.content?.substring(0, 100)}
                  {notice.content?.length > 100 ? '...' : ''}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 12,
                  color: '#94a3b8'
                }}>
                  <span style={{
                    padding: '2px 8px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: 4,
                    fontWeight: 600
                  }}>
                    {notice.target_role}
                  </span>
                  <span>
                    {new Date(notice.posted_on).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{
                padding: 40,
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 14 }}>No notices yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}