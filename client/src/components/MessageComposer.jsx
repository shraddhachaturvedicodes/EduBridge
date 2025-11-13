// client/src/components/MessageComposer.jsx
import React, { useState } from 'react';

export default function MessageComposer({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e && e.preventDefault();
    if (!text || !text.trim()) return;
    setBusy(true);
    try {
      await onSend(text.trim());
      setText('');
    } catch (err) {
      // parent will set error
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? 'Select a peer to send message' : 'Type your message...'}
        style={{ flex: 1, padding: 8, borderRadius: 6, resize: 'vertical' }}
        disabled={disabled || busy}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button type="submit" disabled={disabled || busy} style={{ padding: '8px 12px' }}>
          {busy ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
