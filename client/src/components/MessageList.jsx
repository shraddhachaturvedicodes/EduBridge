// client/src/components/MessageList.jsx
import React from 'react';

export default function MessageList({ message, meId, onDelete }) {
  const mine = message.sender_user_id === meId;
  const containerStyle = {
    display: 'flex',
    justifyContent: mine ? 'flex-end' : 'flex-start',
    marginBottom: 8
  };
  const bubbleStyle = {
    maxWidth: '78%',
    padding: 10,
    borderRadius: 8,
    background: mine ? '#d1e7dd' : '#f1f3f5',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.02) inset'
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: mine ? 'right' : 'left' }}>
        <div style={bubbleStyle}>
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.text_content}</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>
            {new Date(message.created_on).toLocaleString()}
            {message.sender_name && <> — <strong style={{ fontWeight: 600 }}>{message.sender_name}</strong></>}
          </div>
        </div>
        { (mine || (message.receiver_name && message.sender_name)) && (
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {mine && <button onClick={onDelete} style={{ color: 'crimson', border: 'none', background: 'transparent', cursor: 'pointer' }}>Delete</button>}
          </div>
        )}
      </div>
    </div>
  );
}
