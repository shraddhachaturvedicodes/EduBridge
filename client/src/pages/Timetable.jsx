import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import { useAuth } from "../context/AuthContext";

var teal = '#2dd4bf';
var navy = '#0f2a3d';

var pageStyle = { padding: 28, background: '#f8fafc', minHeight: '100vh' };

var viewBtnStyle = { padding: '8px 14px', background: '#2dd4bf', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' };
var dlBtnStyle = { padding: '8px 14px', background: '#f0fffe', color: '#2dd4bf', border: '1px solid #2dd4bf', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' };
var delBtnStyle = { padding: '8px 14px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' };
var delDisabledStyle = { padding: '8px 14px', background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'not-allowed' };
var uploadActiveStyle = { width: '100%', padding: 14, background: '#2dd4bf', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' };
var uploadDisabledStyle = { width: '100%', padding: 14, background: '#94a3b8', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'not-allowed' };

function getIcon(name) {
  if (!name) return '📄';
  var n = name.toLowerCase();
  if (n.endsWith('.pdf')) return '📕';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.png')) return '🖼️';
  return '📄';
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtSize(b) {
  if (!b) return '';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function StatCard(props) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '14px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + props.color, minWidth: 120 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#0f2a3d' }}>{props.value}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{props.label}</div>
    </div>
  );
}

export default function Timetable() {
  var auth = useAuth();
  var user = auth.user;
  var canUpload = user && ['faculty', 'admin', 'management'].includes(user.role);

  var stateFile = useState(null);
  var file = stateFile[0];
  var setFile = stateFile[1];

  var stateFiles = useState([]);
  var files = stateFiles[0];
  var setFiles = stateFiles[1];

  var stateLoading = useState(false);
  var loading = stateLoading[0];
  var setLoading = stateLoading[1];

  var stateUploading = useState(false);
  var uploading = stateUploading[0];
  var setUploading = stateUploading[1];

  var stateDeleting = useState(null);
  var deleting = stateDeleting[0];
  var setDeleting = stateDeleting[1];

  var stateSuccess = useState(false);
  var success = stateSuccess[0];
  var setSuccess = stateSuccess[1];

  var stateDrag = useState(false);
  var drag = stateDrag[0];
  var setDrag = stateDrag[1];

  useEffect(function() { load(); }, []);

  function load() {
    setLoading(true);
    api.get('/api/timetables').then(function(r) {
      setFiles(r.data.files || []);
    }).catch(function(e) {
      console.error(e);
    }).finally(function() {
      setLoading(false);
    });
  }

  function upload(e) {
    e.preventDefault();
    if (!file) return;
    var fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    api.post('/api/timetables/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(function() {
      setSuccess(true);
      setFile(null);
      load();
      setTimeout(function() { setSuccess(false); }, 3000);
    }).catch(function() {
      alert('Upload failed.');
    }).finally(function() {
      setUploading(false);
    });
  }

  function deleteFile(f) {
    var ok = window.confirm('Delete "' + f.original_name + '"? This cannot be undone.');
    if (!ok) return;
    setDeleting(f.tf_id);
    api.delete('/api/timetables/' + f.tf_id).then(function() {
      load();
    }).catch(function() {
      alert('Failed to delete.');
    }).finally(function() {
      setDeleting(null);
    });
  }

  function onDrop(e) {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  }

  var pdfCount = files.filter(function(f) { return f.original_name && f.original_name.toLowerCase().endsWith('.pdf'); }).length;
  var imgCount = files.filter(function(f) { var n = f.original_name ? f.original_name.toLowerCase() : ''; return n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.png'); }).length;

  return (
    <div style={pageStyle}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: navy, margin: '0 0 6px 0' }}>
          📅 Timetable
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          {canUpload ? 'Upload and manage timetable files for students.' : 'View and download timetables uploaded by faculty.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Total Files" value={files.length} color={teal} />
        <StatCard label="PDFs" value={pdfCount} color="#f43f5e" />
        <StatCard label="Images" value={imgCount} color="#6366f1" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: canUpload ? '1fr 340px' : '1fr', gap: 24, alignItems: 'start' }}>

        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: navy, margin: 0 }}>📂 Available Timetables</h2>
          </div>

          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div>
          )}

          {!loading && files.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 600, color: navy, marginBottom: 8 }}>No Timetables Yet</div>
              <div style={{ color: '#64748b', fontSize: 14 }}>
                {canUpload ? 'Upload your first timetable.' : 'Faculty will upload timetables here soon.'}
              </div>
            </div>
          )}

          {!loading && files.map(function(f, i) {
            var isPdf = f.original_name && f.original_name.toLowerCase().endsWith('.pdf');
            var isDeleting = deleting === f.tf_id;
            var fileUrl = 'http://localhost:5000' + f.url;

            return (
              <div key={f.tf_id || i} style={{
                padding: '14px 24px',
                borderBottom: i < files.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                background: isDeleting ? '#fff5f5' : '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: isPdf ? '#fee2e2' : '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {getIcon(f.original_name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: navy, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.original_name || 'File'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {fmtDate(f.uploaded_on)}{f.size_bytes ? ' • ' + fmtSize(f.size_bytes) : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={viewBtnStyle}>View</button>
                  </a>
                  <a href={fileUrl} download={f.original_name} style={{ textDecoration: 'none' }}>
                    <button style={dlBtnStyle}>Download</button>
                  </a>
                  {canUpload && (
                    <button
                      disabled={isDeleting}
                      onClick={function() { deleteFile(f); }}
                      style={isDeleting ? delDisabledStyle : delBtnStyle}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {canUpload && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: navy, margin: 0 }}>Upload Timetable</h2>
              </div>
              <div style={{ padding: 24 }}>

                {success && (
                  <div style={{ padding: 12, background: '#f0fff8', border: '1px solid #2dd4bf', borderRadius: 8, color: '#0f766e', fontSize: 14, marginBottom: 16, fontWeight: 600 }}>
                    File uploaded successfully!
                  </div>
                )}

                <form onSubmit={upload}>
                  <div
                    onDragOver={function(e) { e.preventDefault(); setDrag(true); }}
                    onDragLeave={function() { setDrag(false); }}
                    onDrop={onDrop}
                    onClick={function() { document.getElementById('tfile').click(); }}
                    style={{ border: drag ? '2px dashed #2dd4bf' : '2px dashed #e2e8f0', borderRadius: 12, padding: 32, textAlign: 'center', background: drag ? '#f0fffe' : '#f8fafc', cursor: 'pointer', marginBottom: 16 }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
                    <div style={{ fontWeight: 600, color: navy, fontSize: 14, marginBottom: 4 }}>
                      {file ? file.name : 'Drag & drop or click to select'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>PDF, JPG, PNG supported</div>
                    <input
                      id="tfile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={function(e) { if (e.target.files[0]) setFile(e.target.files[0]); }}
                    />
                  </div>

                  {file && (
                    <div style={{ padding: 12, background: '#f0fffe', borderRadius: 8, border: '1px solid #2dd4bf', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: navy, fontSize: 13 }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{fmtSize(file.size)}</div>
                      </div>
                      <button type="button" onClick={function() { setFile(null); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}>
                        x
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={!file || uploading} style={(!file || uploading) ? uploadDisabledStyle : uploadActiveStyle}>
                    {uploading ? 'Uploading...' : 'Upload Timetable'}
                  </button>
                </form>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: navy, margin: '0 0 12px 0' }}>Upload Guidelines</h3>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 2.2 }}>
                Accepted: PDF, JPG, PNG<br />
                Max size: 20MB<br />
                Visible to all students<br />
                Use clear descriptive file names<br />
                Delete wrong files using Delete button
              </div>
            </div>
          </div>
        )}
      </div>

      {!canUpload && (
        <div style={{ marginTop: 20, padding: 14, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, color: '#475569' }}>
          You are viewing as <strong style={{ color: navy }}>{user && user.role}</strong>. Click View to open or Download to save a file.
        </div>
      )}
    </div>
  );
}