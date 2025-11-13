// client/src/components/Loading.jsx
import React from 'react';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '40vh',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      color: '#333'
    }}>
      Loading…
    </div>
  );
}
