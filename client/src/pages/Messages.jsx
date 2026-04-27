import React, { useEffect, useState, useRef } from "react";
import api from "../axiosInstance";
import { useAuth } from "../context/AuthContext";

var teal = '#2dd4bf';
var navy = '#0f2a3d';

function formatTime(ts) {
  if (!ts) return '';
  var d = new Date(ts);
  var now = new Date();
  var diff = now - d;
  var mins = Math.floor(diff / 60000);
  var hours = Math.floor(diff / 3600000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  if (hours < 24) return hours + 'h ago';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function Messages() {
  var auth = useAuth();
  var user = auth.user;
  var myId = user ? user.user_id : null;

  var s1 = useState([]); var conversations = s1[0]; var setConversations = s1[1];
  var s2 = useState(null); var selectedPeer = s2[0]; var setSelectedPeer = s2[1];
  var s3 = useState([]); var messages = s3[0]; var setMessages = s3[1];
  var s4 = useState(''); var newMsgText = s4[0]; var setNewMsgText = s4[1];
  var s5 = useState(false); var loading = s5[0]; var setLoading = s5[1];
  var s6 = useState(false); var showNewChat = s6[0]; var setShowNewChat = s6[1];
  var s7 = useState([]); var possiblePeers = s7[0]; var setPossiblePeers = s7[1];
  var s8 = useState(false); var peerLoading = s8[0]; var setPeerLoading = s8[1];
  var s9 = useState(false); var sending = s9[0]; var setSending = s9[1];
  var s10 = useState(null); var error = s10[0]; var setError = s10[1];
  var messagesEndRef = useRef(null);

  useEffect(function() {
    loadConversations();
  }, []);

  useEffect(function() {
    if (selectedPeer) {
      loadMessages(selectedPeer.peer_id);
    } else {
      setMessages([]);
    }
  }, [selectedPeer]);

  useEffect(function() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  function loadConversations() {
    setError(null);
    api.get('/api/messages/conversations').then(function(r) {
      var convs = r.data.conversations || [];
      // Filter out any conversation where peer is yourself (safety check)
      var filtered = convs.filter(function(c) { return c.peer_id !== myId; });
      setConversations(filtered);
    }).catch(function(e) {
      console.error('Failed to load conversations', e);
      setError(e?.response?.data?.error || 'Unable to load conversations.');
    });
  }

  function loadMessages(peerId) {
    setError(null);
    setLoading(true);
    setMessages([]);
    api.get('/api/messages', { params: { peer: peerId } }).then(function(r) {
      var rows = Array.isArray(r.data) ? r.data : [];
      setMessages(rows);
    }).catch(function(e) {
      console.error('Failed to load messages', e);
      setError(e?.response?.data?.error || 'Unable to load messages.');
    }).finally(function() {
      setLoading(false);
    });
  }

  function handleSend() {
    if (!selectedPeer || !newMsgText.trim() || sending) return;
    setError(null);
    setSending(true);
    api.post('/api/messages', {
      receiver_user_id: selectedPeer.peer_id,
      text_content: newMsgText.trim()
    }).then(function(r) {
      setNewMsgText('');
      loadMessages(selectedPeer.peer_id);
      loadConversations();
    }).catch(function(e) {
      console.error('Failed to send message', e);
      var msg = e?.response?.data?.error || 'Failed to send message';
      setError(msg);
      alert(msg);
    }).finally(function() {
      setSending(false);
    });
  }

  function openNewChat() {
    setShowNewChat(true);
    setPeerLoading(true);
    api.get('/api/users').then(function(r) {
      var all = Array.isArray(r.data) ? r.data : (r.data.users || []);
      // Only show other users, not yourself
      var others = all.filter(function(u) { return u.user_id !== myId; });
      setPossiblePeers(others);
    }).catch(function() {
      setPossiblePeers([]);
    }).finally(function() {
      setPeerLoading(false);
    });
  }

  function startChat(u) {
    setShowNewChat(false);
    setSelectedPeer({ peer_id: u.user_id, peer_name: u.display_name || u.email });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#f8fafc' }}>

      {/* Left Sidebar */}
      <div style={{ width: 300, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: navy }}>Messages</h2>
          <button
            onClick={openNewChat}
            style={{ padding: '8px 14px', background: teal, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            + New
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
              <div style={{ color: '#64748b', fontSize: 14 }}>No conversations yet.</div>
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>Click "+ New" to start chatting</div>
            </div>
          )}

          {conversations.map(function(c) {
            var isSelected = selectedPeer && selectedPeer.peer_id === c.peer_id;
            var peerName = c.peer_name || c.peer_email || 'Unknown';
            return (
              <div
                key={c.peer_id}
                onClick={function() { setSelectedPeer({ peer_id: c.peer_id, peer_name: peerName }); }}
                style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#f0fffe' : '#fff', borderLeft: isSelected ? '3px solid ' + teal : '3px solid transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: isSelected ? teal : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : navy, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {peerName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: navy, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {peerName}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.text_content || 'No message yet'}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{formatTime(c.created_on)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {!selectedPeer && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>💬</div>
            <h3 style={{ color: navy, marginBottom: 8 }}>Select a Conversation</h3>
            <p style={{ fontSize: 14, color: '#64748b' }}>Choose a conversation or start a new one</p>
            <button
              onClick={openNewChat}
              style={{ marginTop: 16, padding: '12px 24px', background: teal, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Start New Chat
            </button>
          </div>
        )}

        {selectedPeer && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Chat Header */}
            <div style={{ padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: teal, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                {selectedPeer.peer_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: navy, fontSize: 15 }}>{selectedPeer.peer_name}</div>
                <div style={{ fontSize: 12, color: '#10b981' }}>Private conversation</div>
              </div>
            </div>
            {error && (
              <div style={{ padding: '12px 20px', background: '#fee2e2', color: '#b91c1c', fontSize: 13, borderBottom: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

              {loading && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Loading messages...</div>
              )}

              {!loading && messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
                  Start your conversation with {selectedPeer.peer_name}
                </div>
              )}

              {!loading && messages.map(function(m, i) {
                // THIS IS THE KEY FIX - compare with myId from useAuth
                var isMine = Number(m.sender_user_id) === Number(myId);
                var myName = user && user.display_name ? user.display_name : 'Me';

                return (
                  <div key={m.msg_id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>

                    {!isMine && (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: navy, flexShrink: 0 }}>
                        {selectedPeer.peer_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div style={{ maxWidth: '65%', padding: '10px 14px', borderRadius: 12, background: isMine ? teal : '#fff', color: isMine ? '#fff' : navy, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderBottomRightRadius: isMine ? 2 : 12, borderBottomLeftRadius: isMine ? 12 : 2 }}>
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.text_content}</div>
                      <div style={{ fontSize: 11, marginTop: 4, color: isMine ? 'rgba(255,255,255,0.7)' : '#94a3b8', textAlign: 'right' }}>
                        {isMine ? 'You' : selectedPeer.peer_name} • {formatTime(m.created_on)}
                      </div>
                    </div>

                    {isMine && (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {myName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={newMsgText}
                onChange={function(e) { setNewMsgText(e.target.value); }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send)"
                rows={2}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, resize: 'none', fontFamily: 'inherit', outline: 'none' }}
              />
              <button
                onClick={handleSend}
                disabled={!newMsgText.trim() || sending}
                style={{ padding: '10px 20px', background: (!newMsgText.trim() || sending) ? '#94a3b8' : teal, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: (!newMsgText.trim() || sending) ? 'not-allowed' : 'pointer' }}
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: navy, fontSize: 17 }}>Start New Conversation</h3>
              <button onClick={function() { setShowNewChat(false); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>x</button>
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {peerLoading && <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading users...</div>}

              {!peerLoading && possiblePeers.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No users found.</div>
              )}

              {!peerLoading && possiblePeers.map(function(u) {
                var roleColor = u.role === 'faculty' ? '#6366f1' : u.role === 'admin' ? '#f59e0b' : teal;
                return (
                  <div key={u.user_id} style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                        {(u.display_name || u.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: navy, fontSize: 14 }}>{u.display_name || u.email}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {u.email} •
                          <span style={{ color: roleColor, fontWeight: 600, marginLeft: 4 }}>{u.role}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={function() { startChat(u); }}
                      style={{ padding: '8px 16px', background: teal, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                    >
                      Chat
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}