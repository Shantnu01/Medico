import React, { useState } from "react";
import { Activity, LogOut, User, Stethoscope, Pill, HeartPulse, LayoutDashboard, MapPin, PhoneCall, X, ShieldCheck, UserPlus, Info, TrendingDown, Heart, Users, Globe, Bell, Calendar, Bot, ClipboardList, CheckCircle2, AlertTriangle, Sparkles, Clock, RefreshCw, Sun, Moon, Hospital, Edit3, MessageSquare } from "lucide-react";

export function Navbar({ activeTab, setActiveTab, user, doctorUser, adminUser, onLogout, onDoctorLogout, onAdminLogout, onOpenAuth, onOpenDoctorAuth, onOpenAdminPortal, theme, onToggleTheme, doctorSubTab, onSelectDoctorTab }) {
  const [showSosModal, setShowSosModal] = useState(false);

  return (
    <>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-subtle)",
        transition: "background-color 300ms ease, border-color 300ms ease"
      }}>
        {/* Primary Navbar Header */}
        <div style={{
          maxWidth: "1320px",
          margin: "0 auto",
          height: "64px",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}>
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => {
              if (doctorUser) {
                setActiveTab("doctor_workspace");
                if (onSelectDoctorTab) onSelectDoctorTab("my_patients");
              } else if (adminUser) {
                setActiveTab("admin");
              } else if (user) {
                setActiveTab("dashboard");
              } else {
                setActiveTab("landing");
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flexShrink: 0 }}
          >
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-on-primary)"
            }}>
              <Activity size={20} />
            </div>
            <div>
              <span style={{ fontSize: "17px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--color-text-heading)", display: "block", lineHeight: 1.1 }}>
                Medico
              </span>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "500", display: "block" }}>
                {doctorUser ? "Physician Portal" : adminUser ? "Medical Board Admin" : "Smart Urgent & Primary Care"}
              </span>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflowX: "auto",
            padding: "4px 0"
          }}>
            {doctorUser ? (
              /* DOCTOR WORKSPACE TABS: Dashboard, My Patients, Appointments */
              <>
                <button
                  onClick={() => { setActiveTab("doctor_workspace"); if (onSelectDoctorTab) onSelectDoctorTab("dashboard"); }}
                  className={`btn btn-sm ${activeTab === "doctor_workspace" && doctorSubTab === "dashboard" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab("doctor_workspace"); if (onSelectDoctorTab) onSelectDoctorTab("my_patients"); }}
                  className={`btn btn-sm ${activeTab === "doctor_workspace" && doctorSubTab === "my_patients" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Users size={14} /> My Patients
                </button>
                <button
                  onClick={() => { setActiveTab("doctor_workspace"); if (onSelectDoctorTab) onSelectDoctorTab("appointments"); }}
                  className={`btn btn-sm ${activeTab === "doctor_workspace" && doctorSubTab === "appointments" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Calendar size={14} /> Appointments
                </button>
              </>
            ) : adminUser ? (
              /* ADMIN TABS */
              <>
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`btn btn-sm ${activeTab === "admin" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <ClipboardList size={14} /> Doctor Audits
                </button>
                <button
                  onClick={() => setActiveTab("admin")}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <CheckCircle2 size={14} color="var(--color-primary)" /> Verified Doctors
                </button>
                <button
                  onClick={() => setActiveTab("admin")}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Users size={14} color="var(--color-primary)" /> Patient Directory
                </button>
              </>
            ) : user ? (
              /* PATIENT TABS */
              <>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`btn btn-sm ${activeTab === "dashboard" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <LayoutDashboard size={14} /> Health Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("help")}
                  className={`btn btn-sm ${activeTab === "help" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <HeartPulse size={14} /> Symptom AI Triage
                </button>
                <button
                  onClick={() => setActiveTab("doctors")}
                  className={`btn btn-sm ${activeTab === "doctors" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Stethoscope size={14} /> Doctors Directory
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`btn btn-sm ${activeTab === "history" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <MessageSquare size={14} /> Consultation History
                </button>
                {user?.gender?.toLowerCase() === "female" && (
                  <button
                    onClick={() => setActiveTab("herhealth")}
                    className={`btn btn-sm ${activeTab === "herhealth" ? "btn-primary" : "btn-outline"}`}
                    style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px", backgroundColor: activeTab === "herhealth" ? "#ec4899" : "transparent", borderColor: "#ec4899", color: activeTab === "herhealth" ? "#ffffff" : "#ec4899" }}
                  >
                    <Heart size={14} /> HerHealth Care
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("pharmacy")}
                  className={`btn btn-sm ${activeTab === "pharmacy" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Pill size={14} /> 24/7 Pharmacy
                </button>
                <button
                  onClick={() => setActiveTab("hospitals")}
                  className={`btn btn-sm ${activeTab === "hospitals" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Hospital size={14} /> Nearest Hospitals
                </button>
                <button
                  onClick={() => setActiveTab("pharmacies_map")}
                  className={`btn btn-sm ${activeTab === "pharmacies_map" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <MapPin size={14} /> Nearest Pharmacy
                </button>
              </>
            ) : (
              /* PUBLIC VISITORS TABS */
              <>
                <button
                  onClick={() => setActiveTab("landing")}
                  className={`btn btn-sm ${activeTab === "landing" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Globe size={14} /> Care Overview
                </button>
                <button
                  onClick={() => setActiveTab("help")}
                  className={`btn btn-sm ${activeTab === "help" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <HeartPulse size={14} /> Free AI Triage
                </button>
                <button
                  onClick={() => setActiveTab("doctors")}
                  className={`btn btn-sm ${activeTab === "doctors" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Stethoscope size={14} /> Doctors
                </button>
                <button
                  onClick={() => setActiveTab("pharmacy")}
                  className={`btn btn-sm ${activeTab === "pharmacy" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Pill size={14} /> Pharmacy
                </button>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={onToggleTheme}
              className="btn btn-outline"
              style={{
                height: "36px",
                padding: "0 10px",
                fontSize: "12px",
                borderRadius: "var(--radius-pill)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
              title={theme === "dark" ? "Switch to Carbon Bright Mode" : "Switch to Carbon Dark Mode"}
            >
              {theme === "dark" ? (
                <>
                  <Sun size={14} color="#d4a323" />
                  <span style={{ fontSize: "11.5px", fontWeight: "600" }}>Bright</span>
                </>
              ) : (
                <>
                  <Moon size={14} color="#338272" />
                  <span style={{ fontSize: "11.5px", fontWeight: "600" }}>Dark</span>
                </>
              )}
            </button>

            {doctorUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-primary" style={{ height: "36px", padding: "0 12px", fontSize: "11.5px" }}>
                  🩺 {doctorUser.name || "Dr. Aris Thorne"}
                </span>
                <button 
                  onClick={onDoctorLogout}
                  className="btn btn-outline"
                  style={{ height: "36px", padding: "0 12px", fontSize: "11.5px", borderRadius: "var(--radius-pill)" }}
                >
                  Exit Doctor
                </button>
              </div>
            ) : adminUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-primary" style={{ height: "36px", padding: "0 12px", fontSize: "11.5px" }}>
                  👑 ADMIN CONTROL
                </span>
                <button 
                  onClick={onAdminLogout}
                  className="btn btn-outline"
                  style={{ height: "36px", padding: "0 12px", fontSize: "11.5px", borderRadius: "var(--radius-pill)" }}
                >
                  Exit Admin
                </button>
              </div>
            ) : user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => setShowSosModal(true)}
                  style={{
                    height: "36px",
                    padding: "0 12px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: theme === "dark" ? "rgba(239, 68, 68, 0.2)" : "#fce8e6",
                    color: theme === "dark" ? "#f87171" : "#c5221f",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    fontWeight: "700",
                    fontSize: "11.5px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <PhoneCall size={13} />
                  <span>SOS 108</span>
                </button>

                <div style={{
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700"
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : "P"}
                  </div>
                  <span>{user.name}</span>
                </div>

                <button 
                  onClick={onLogout}
                  title="Sign out"
                  className="btn btn-outline"
                  style={{ height: "36px", width: "36px", padding: 0, borderRadius: "var(--radius-pill)" }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn btn-outline"
                  onClick={onOpenDoctorAuth}
                  style={{ height: "36px", fontSize: "12px", borderRadius: "var(--radius-pill)" }}
                >
                  <Stethoscope size={14} color="var(--color-primary)" />
                  <span>Join as Doctor</span>
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => onOpenAuth("login")}
                  style={{ height: "36px", fontSize: "12px", borderRadius: "var(--radius-pill)" }}
                >
                  <User size={14} />
                  <span>Book Appointment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
          zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
        }}>
          <div className="sage-card animate-fade-in" style={{ maxWidth: "480px", width: "100%", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#c5221f" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PhoneCall size={22} />
                </div>
                <div>
                  <h3 className="heading-title" style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-text-heading)" }}>
                    Medical Emergency SOS
                  </h3>
                  <span style={{ fontSize: "11px", color: "#c5221f", fontWeight: "700", letterSpacing: "0.04em" }}>
                    IMMEDIATE AMBULANCE DISPATCH
                  </span>
                </div>
              </div>

              <button onClick={() => setShowSosModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><X size={20} /></button>
            </div>

            <p className="body-text" style={{ marginBottom: "20px", color: "var(--color-text)" }}>
              If you or someone near you is experiencing severe chest pain, sudden stroke symptoms, or acute trauma, call emergency services immediately:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <a
                href="tel:108"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px", backgroundColor: "rgba(239, 68, 68, 0.15)", borderRadius: "var(--radius-lg)",
                  color: "#c5221f", textDecoration: "none", fontWeight: "700", fontSize: "14px", border: "1px solid rgba(239, 68, 68, 0.3)"
                }}
              >
                <span>National Medical Ambulance Hotline</span>
                <span style={{ fontSize: "18px", fontWeight: "800" }}>108</span>
              </a>

              <a
                href="tel:112"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px", backgroundColor: "rgba(51, 130, 114, 0.12)", borderRadius: "var(--radius-lg)",
                  color: "var(--color-primary)", textDecoration: "none", fontWeight: "700", fontSize: "14px", border: "1px solid rgba(51, 130, 114, 0.3)"
                }}
              >
                <span>Unified Emergency Response</span>
                <span style={{ fontSize: "18px", fontWeight: "800" }}>112</span>
              </a>
            </div>

            <button className="btn btn-outline" style={{ width: "100%", borderRadius: "var(--radius-pill)" }} onClick={() => setShowSosModal(false)}>
              Close Window
            </button>
          </div>
        </div>
      )}
    </>
  );
}
