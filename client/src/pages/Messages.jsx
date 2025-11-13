// client/src/pages/Messages.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../axiosInstance";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch { return ts; }
}

/**
 * Messages page
 * - Uses explicit /api/ paths so it does not depend on axiosInstance.baseURL
 * - Loads conversations (grouped by peer) from /api/messages/conversations when available
 * - Falls back to grouping raw inbox rows if server returns non-grouped rows
 */

export default function Messages() {
  const [conversations, setConversations] = useState([]); // {peer_id, peer_name, text_content, created_on}
  const [selectedPeer, setSelectedPeer] = useState(null); // { peer_id, peer_name }
  const [messages, setMessages] = useState([]);
  const [inboxError, setInboxError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMsgText, setNewMsgText] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [possiblePeers, setPossiblePeers] = useState([]);
  const [peerLoading, setPeerLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Helper: unique conversations from raw inbox rows
  function groupInboxToConversations(rows, currentUserId) {
    // rows expected to have sender_user_id, receiver_user_id, text_content, created_on, sender_name, receiver_name
    // Build map by peer id where peer is the other user
    const map = new Map();
    rows.forEach(r => {
      const peerId = (r.sender_user_id === currentUserId) ? r.receiver_user_id : r.sender_user_id;
      const peerName = (r.sender_user_id === currentUserId) ? r.receiver_name : r.sender_name;
      const existing = map.get(peerId);
      if (!existing || new Date(r.created_on) > new Date(existing.created_on)) {
        map.set(peerId, {
          peer_id: peerId,
          peer_name: peerName || `User ${peerId}`,
          text_content: r.text_content,
          created_on: r.created_on
        });
      }
    });
    // convert to array and sort by created_on desc
    return Array.from(map.values()).sort((a,b) => new Date(b.created_on) - new Date(a.created_on));
  }

  // load conversations (unique peers) - prefers /api/messages/conversations
  async function loadConversations() {
    setInboxError("");
    try {
      // Try the grouped endpoint first
      const resp = await api.get("/api/messages/conversations");
      if (resp?.data?.conversations) {
        setConversations(resp.data.conversations);
        return;
      }
      // fallback: fetch inbox rows and group on client
      const inboxResp = await api.get("/api/messages");
      const rows = inboxResp.data || [];
      // if the server returned an object with .rows or .messages handle that:
      const candidateRows = Array.isArray(rows) ? rows :
                            Array.isArray(inboxResp.data.rows) ? inboxResp.data.rows :
                            Array.isArray(inboxResp.data.messages) ? inboxResp.data.messages : [];
      // Try to detect current user id from first row if present (safe fallback)
      const currentUserId = candidateRows[0]?.me_user_id || candidateRows[0]?.current_user_id || null;
      const convs = groupInboxToConversations(candidateRows, currentUserId);
      setConversations(convs);
    } catch (err) {
      console.error("Failed to load conversations", err);
      setInboxError("Failed to load inbox");
      setConversations([]);
    }
  }

  // load full conversation with selected peer
  async function loadConversationWith(peerId) {
    setLoading(true);
    setMessages([]);
    try {
      const resp = await api.get(`/api/messages?peer=${peerId}`);
      // server might send an array or an object -> normalize
      const data = resp.data;
      const rows = Array.isArray(data) ? data :
                   Array.isArray(data.rows) ? data.rows :
                   Array.isArray(data.messages) ? data.messages :
                   [];
      // If api returned a single object with message fields, wrap into an array
      const final = rows.length ? rows : (data && typeof data === 'object' && data.text_content ? [data] : []);
      setMessages(final);
    } catch (err) {
      console.error("Failed to load messages for peer", peerId, err);
      setMessages([]);
    } finally {
      setLoading(false);
      // scroll after messages set
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 150);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedPeer) {
      loadConversationWith(selectedPeer.peer_id);
    } else {
      setMessages([]);
    }
  }, [selectedPeer]);

  // Send message (existing endpoint)
  async function handleSend() {
    if (!selectedPeer || !newMsgText.trim()) return;
    try {
      const payload = { receiver_user_id: selectedPeer.peer_id, text_content: newMsgText.trim() };
      const resp = await api.post("/api/messages", payload);
      // resp.data is the created message
      const created = resp.data;
      // append the created message to messages
      setMessages(prev => [...prev, created]);
      setNewMsgText("");
      // refresh conversations list (so latest message preview/order updates)
      await loadConversations();
      // ensure scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    } catch (err) {
      console.error("Send failed", err);
      alert("Failed to send message");
    }
  }

  // Open New Chat modal and load possible peers
  async function openNewChat() {
    setShowNewChat(true);
    if (possiblePeers.length === 0) {
      setPeerLoading(true);
      try {
        // fetch faculty + management (explicit api path)
        const resp = await api.get("/api/users?roles=faculty,admin,management");
        const users = resp.data?.users || resp.data || [];
        setPossiblePeers(users);
      } catch (err) {
        console.error("Failed to fetch possible peers", err);
        setPossiblePeers([]);
      } finally {
        setPeerLoading(false);
      }
    }
  }

  // Start chat with selected user (select peer)
  function startChatWith(user) {
    setShowNewChat(false);
    setSelectedPeer({ peer_id: user.user_id, peer_name: user.display_name || user.email });
    setTimeout(() => {
      document.getElementById("msg-input")?.focus();
    }, 150);
  }

  // Render left sidebar conversation row
  function renderConvoRow(c) {
    return (
      <div key={c.peer_id}
           onClick={() => setSelectedPeer({ peer_id: c.peer_id, peer_name: c.peer_name })}
           style={{
             padding: "12px 16px",
             borderBottom: "1px solid #eee",
             cursor: "pointer",
             background: selectedPeer && selectedPeer.peer_id === c.peer_id ? "#f5f8fa" : "transparent"
           }}>
        <div style={{ fontWeight: 600 }}>{c.peer_name}</div>
        <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>
          {c.text_content ? (c.text_content.length > 60 ? c.text_content.slice(0, 60) + "…" : c.text_content) : <em>No message yet</em>}
        </div>
        <div style={{ color: "#999", fontSize: 11, marginTop: 6 }}>{formatTime(c.created_on)}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      {/* Left Sidebar */}
      <div style={{ width: 300, background: "#fafafa", borderRight: "1px solid #eee", minHeight: 500 }}>
        <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Inbox</div>
          <button onClick={openNewChat} style={{ padding: "6px 10px" }}>New Chat</button>
        </div>

        {inboxError && <div style={{ color: "crimson", padding: 12 }}>{inboxError}</div>}
        {!inboxError && conversations.length === 0 && <div style={{ padding: 12, color: "#666" }}>No conversations yet.</div>}

        <div style={{ overflowY: "auto", maxHeight: 520 }}>
          {conversations.map(c => renderConvoRow(c))}
        </div>
      </div>

      {/* Right Conversation pane */}
      <div style={{ flex: 1, paddingLeft: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Conversation {selectedPeer ? `— ${selectedPeer.peer_name}` : ""}</h3>
        </div>

        <div style={{
          border: "1px solid #eee",
          borderRadius: 8,
          minHeight: 360,
          padding: 16,
          marginTop: 12,
          background: "#fff"
        }}>
          {loading && <div>Loading...</div>}
          {!loading && messages.length === 0 && <div style={{ color: "#666" }}>No conversation to show.</div>}
          {!loading && messages.map((m, i) => {
            const isMine = m.sender_user_id === (m.current_user_id || m.me_user_id || undefined);
            const author = m.sender_name || (m.sender_user_id === (m.current_user_id || -1) ? "You" : m.sender_user_id);
            return (
              <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "65%",
                  padding: 12,
                  borderRadius: 8,
                  background: isMine ? "#dff0d8" : "#f2f4f6",
                }}>
                  <div style={{ fontWeight: 700 }}>{m.text_content}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{formatTime(m.created_on)} — <span style={{ display:"inline" }}>{author}</span></div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* message composer */}
        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <textarea id="msg-input" value={newMsgText} onChange={e => setNewMsgText(e.target.value)}
                    placeholder={selectedPeer ? "Type your message..." : "Select a peer to send message"}
                    style={{ flex: 1, minHeight: 50, padding: 8 }} disabled={!selectedPeer} />
          <button onClick={handleSend} style={{ padding: "8px 12px" }} disabled={!selectedPeer || !newMsgText.trim()}>Send</button>
        </div>
      </div>

      {/* New Chat Modal (simple) */}
      {showNewChat && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ width: 560, background: "#fff", padding: 20, borderRadius: 8 }}>
            <h3>Start new chat</h3>
            <p style={{ color: "#666" }}>Choose a faculty or admin/management account</p>
            <div style={{ maxHeight: 300, overflowY: "auto", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
              {peerLoading && <div style={{ padding: 12 }}>Loading...</div>}
              {!peerLoading && possiblePeers.length === 0 && <div style={{ padding: 12 }}>No users found.</div>}
              {!peerLoading && possiblePeers.map(u => (
                <div key={u.user_id} style={{ padding: 12, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{u.display_name || u.email}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{u.role} — {u.email}</div>
                  </div>
                  <div>
                    <button onClick={() => startChatWith(u)}>Start Chat</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <button onClick={() => setShowNewChat(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
