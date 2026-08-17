import React, { useState, useEffect } from 'react';
import { DoctorAuthModal } from './components/DoctorAuthModal.js';
import { DoctorWorkspaceTab } from './components/DoctorWorkspaceTab.js';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [showDoctorAuth, setShowDoctorAuth] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Check persisted doctor session
  useEffect(() => {
    const saved = localStorage.getItem('medico_doctor');
    const token = localStorage.getItem('medico_doctor_token');
    if (saved && token) {
      try {
        setDoctor(JSON.parse(saved));
        setShowDoctorAuth(false);
      } catch {}
    }
  }, []);

  const handleDoctorLogin = (doctorData, token) => {
    setDoctor(doctorData);
    setShowDoctorAuth(false);
    localStorage.setItem('medico_doctor', JSON.stringify(doctorData));
    localStorage.setItem('medico_doctor_token', token);
  };

  const handleDoctorLogout = () => {
    setDoctor(null);
    setShowDoctorAuth(true);
    localStorage.removeItem('medico_doctor');
    localStorage.removeItem('medico_doctor_token');
  };

  return (
    <div className="app-container" style={{ minHeight: '100dvh' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-primary)' }}>🏥 Medico Doctor Portal</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {doctor && <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Dr. {doctor.name}</span>}
          <button onClick={() => setDarkMode(d => !d)} className="btn btn-outline btn-sm">{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          {doctor && <button onClick={handleDoctorLogout} className="btn btn-outline btn-sm">Logout</button>}
        </div>
      </div>

      {showDoctorAuth || !doctor ? (
        <DoctorAuthModal
          onClose={() => doctor && setShowDoctorAuth(false)}
          onDoctorLogin={handleDoctorLogin}
        />
      ) : (
        <DoctorWorkspaceTab doctor={doctor} onLogout={handleDoctorLogout} />
      )}
    </div>
  );
}
