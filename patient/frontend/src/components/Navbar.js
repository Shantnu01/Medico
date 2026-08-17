import React, { useState } from "react";
import { Activity, LogOut, User, Stethoscope, Pill, HeartPulse, LayoutDashboard, MapPin, PhoneCall, X, ShieldCheck, UserPlus, Heart, MessageSquare, Hospital, Globe, Sun, Moon } from "lucide-react";

export function Navbar({ activeTab, setActiveTab, user, onLogout, onOpenAuth, theme, onToggleTheme }) {
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
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab(user ? "dashboard" : "landing")}
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
                Patient Care Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflowX: "auto",
            padding: "4px 0"
          }}>
            {user ? (
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
                    style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px", backgroundColor: activeTab === "herhealth" ? "rgba(194,71,110,0.12)" : "transparent", borderColor: "#c2476e", color: "#c2476e" }}
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
                  <HeartPulse size={14} /> Symptom AI Triage
                </button>
                <button
                  onClick={() => setActiveTab("doctors")}
                  className={`btn btn-sm ${activeTab === "doctors" ? "btn-primary" : "btn-outline"}`}
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                >
                  <Stethoscope size={14} /> Doctors Directory
                </button>
              </>
            )}
          </nav>

          {/* Right actions: SOS, Theme, User Auth */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {/* SOS Emergency Button */}
            <button
              onClick={() => setShowSosModal(true)}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-pill)",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer"
              }}
            >
              <PhoneCall size={14} /> SOS Emergency
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="btn btn-outline btn-sm"
              style={{ borderRadius: "var(--radius-pill)", width: "34px", height: "34px", padding: 0 }}
              title="Toggle Dark / Light Theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-text-heading)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <User size={15} color="var(--color-primary)" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
                  title="Log out of Patient Portal"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px" }}
              >
                <UserPlus size={14} /> Patient Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SOS Emergency Modal */}
      {showSosModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div className="sage-card animate-fade-in" style={{ maxWidth: "480px", width: "100%", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#dc2626" }}>
                <PhoneCall size={22} />
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>24/7 Emergency Medical Response</h3>
              </div>
              <button onClick={() => setShowSosModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <X size={20} />
              </button>
            </div>
            <p className="body-text" style={{ fontSize: "14px", marginBottom: "16px" }}>
              If you or someone near you is experiencing life-threatening medical distress (severe chest pain, breathing cessation, heavy bleeding, loss of consciousness):
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <a href="tel:108" className="btn btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#dc2626", textDecoration: "none" }}>
                <PhoneCall size={16} /> Call 108 Ambulance Immediate Dispatch
              </a>
              <a href="tel:112" className="btn btn-outline" style={{ textDecoration: "none" }}>
                <ShieldCheck size={16} /> Call 112 National Emergency Helpline
              </a>
            </div>
            <button onClick={() => setShowSosModal(false)} className="btn btn-outline" style={{ width: "100%" }}>
              Close Window
            </button>
          </div>
        </div>
      )}
    </>
  );
}
