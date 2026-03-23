// src/pages/Features.jsx
import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

const features = [
  {
    icon: '📢',
    title: 'Announcements & Notices',
    description: 'Centralized notice board accessible by all roles. Never miss an important update from faculty or management.'
  },
  {
    icon: '📅',
    title: 'Timetable / Schedule',
    description: 'View and manage class schedules, exam dates, and academic events in a clean, organized calendar.'
  },
  {
    icon: '💬',
    title: 'Chat & Messaging',
    description: 'Direct messaging between students, faculty, and management. No more relying on WhatsApp or email chains.'
  },
  {
    icon: '📊',
    title: 'Feedback Analysis',
    description: 'Structured feedback collection with insightful analytics. Help improve teaching quality and student experience.'
  },
  {
    icon: '👥',
    title: 'Faculty Interaction & Mentorship',
    description: 'Discover mentors, submit project proposals, and track progress. Seamless faculty-student collaboration.'
  },
  {
    icon: '📈',
    title: 'Management Dashboard',
    description: 'Monitor academic activities, mentor workload, and project progress with a comprehensive management overview.'
  }
];

export default function Features() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PublicNavbar />
      
      <div style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 60, padding: '0 20px' }}>
          <h1 style={{
            fontSize: 48,
            marginBottom: 20,
            color: '#0f2a3d',
            fontWeight: 700
          }}>
            Everything You Need
          </h1>
          <p style={{
            fontSize: 18,
            color: '#64748b',
            maxWidth: 700,
            margin: '0 auto'
          }}>
            A comprehensive suite of tools designed to streamline academic collaboration and communication.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 30,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 40px'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{
                width: 60,
                height: 60,
                background: '#e0f2fe',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                marginBottom: 20
              }}>
                {feature.icon}
              </div>
              
              <h3 style={{
                fontSize: 22,
                marginBottom: 12,
                color: '#0f2a3d',
                fontWeight: 600
              }}>
                {feature.title}
              </h3>
              
              <p style={{
                color: '#64748b',
                lineHeight: 1.7,
                fontSize: 15
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}