import React, { useState, useEffect } from 'react';
import { AdminAuthModal } from './components/AdminAuthModal.js';
import { AdminPortalTab } from './components/AdminPortalTab.js';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [showAdminAuth, setShowAdminAuth] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Restore admin session
  useEffect(() => {
    const saved = localStorage.getItem('medico_admin');
    const token = localStorage.getItem('medico_admin_token');
    if (saved && token) {
      try {
        setAdmin(JSON.parse(saved));
        setShowAdminAuth(false);
      } catch {}
    }
  }, []);

  const handleAdminLogin = (adminData, token) => {
    setAdmin(adminData);
    setShowAdminAuth(false);
    localStorage.setItem('medico_admin', JSON.stringify(adminData));
    localStorage.setItem('medico_admin_token', token);
  };

  const handleAdminLogout = () => {
    setAdmin(null);
    setShowAdminAuth(true);
    localStorage.removeItem('medico_admin');
    localStorage.removeItem('medico_admin_token');
  };

  return (
    <div className="app-container" style={{ minHeight: '100dvh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-primary)' }}>🛡️ Medico Admin Portal</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {admin && <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{admin.name}</span>}
          <button onClick={() => setDarkMode(d => !d)} className="btn btn-outline btn-sm">{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          {admin && <button onClick={handleAdminLogout} className="btn btn-outline btn-sm">Logout</button>}
        </div>
      </div>

      {showAdminAuth || !admin ? (
        <AdminAuthModal
          onClose={() => admin && setShowAdminAuth(false)}
          onAdminLogin={handleAdminLogin}
        />
      ) : (
        <AdminPortalTab admin={admin} onLogout={handleAdminLogout} />
      )}
    </div>
  );
}
