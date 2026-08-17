import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.js";
import { LandingPage } from "./components/LandingPage.js";
import { AuthPage } from "./components/AuthPage.js";
import { DashboardTab } from "./components/DashboardTab.js";
import { HelpAiTab } from "./components/HelpAiTab.js";
import { DoctorsTab } from "./components/DoctorsTab.js";
import { PharmacyTab } from "./components/PharmacyTab.js";
import { DoctorAuthModal } from "./components/DoctorAuthModal.js";
import { AdminAuthModal } from "./components/AdminAuthModal.js";
import { AdminPortalTab } from "./components/AdminPortalTab.js";
import { DoctorWorkspaceTab } from "./components/DoctorWorkspaceTab.js";
import { NearbyMapTab } from "./components/NearbyMapTab.js";
import { ConsultationHistoryTab } from "./components/ConsultationHistoryTab.js";
import { HerHealthTab } from "./components/HerHealthTab.js";
import { Activity, ShieldCheck, Lock, PhoneCall, User } from "lucide-react";

export function App() {
  const [user, setUser] = useState(null);
  const [doctorUser, setDoctorUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  const [activeTab, setActiveTab] = useState("landing");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDoctorAuthModal, setShowDoctorAuthModal] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState("All");
  const [doctorSubTab, setDoctorSubTab] = useState("my_patients");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("medico_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("medico_theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const detectLocation = async (token) => {
    try {
      const ipRes = await fetch("http://ip-api.com/json/").catch(() => null);
      let locData = null;

      if (ipRes && ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData && ipData.city) {
          locData = {
            city: ipData.city,
            country: ipData.country || "India",
            region: ipData.regionName ? `${ipData.city}, ${ipData.regionName}` : "Tropical South Asia",
            latitude: ipData.lat,
            longitude: ipData.lon
          };
        }
      }

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            try {
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                const city = geoData.address.city || geoData.address.town || geoData.address.state_district || locData?.city || "Chennai";
                const country = geoData.address.country || "India";
                
                locData = {
                  city,
                  country,
                  region: `${city}, ${geoData.address.state || "Tamil Nadu"}`,
                  latitude: lat,
                  longitude: lng
                };
              }
            } catch (e) {
              console.log("Reverse geocoding fallback active:", e);
            }

            if (locData) {
              await sendLocationToBackend(token, locData);
            }
          },
          async (err) => {
            if (locData) await sendLocationToBackend(token, locData);
          }
        );
      } else if (locData) {
        await sendLocationToBackend(token, locData);
      }
    } catch (err) {
      console.error("Location detection error:", err);
    }
  };

  const sendLocationToBackend = async (token, locData) => {
    try {
      const res = await fetch("/api/user/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(locData)
      });
      const data = await res.json();
      if (data.location) {
        setUser((prev) => (prev ? { ...prev, location: data.location } : prev));
        const storedUser = localStorage.getItem("medico_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.location = data.location;
          localStorage.setItem("medico_user", JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Check Doctor Auth
    const storedDoc = localStorage.getItem("medico_doctor_user");
    if (storedDoc) {
      try {
        const dData = JSON.parse(storedDoc);
        const savedSubTab = localStorage.getItem("medico_doctor_sub_tab") || "dashboard";
        setDoctorUser(dData);
        setDoctorSubTab(savedSubTab);
        setActiveTab("doctor_workspace");
        return;
      } catch (e) {
        localStorage.removeItem("medico_doctor_user");
      }
    }

    // Check Admin Auth
    const storedAdmin = localStorage.getItem("medico_admin_user");
    if (storedAdmin) {
      try {
        const aData = JSON.parse(storedAdmin);
        setAdminUser(aData);
        setActiveTab("admin");
        return;
      } catch (e) {
        localStorage.removeItem("medico_admin_user");
      }
    }

    // Check Patient Auth
    const storedUser = localStorage.getItem("medico_user");
    const storedToken = localStorage.getItem("medico_token");
    if (storedUser && storedToken) {
      try {
        const uData = JSON.parse(storedUser);
        setUser(uData);
        setActiveTab("dashboard");
        detectLocation(storedToken);
      } catch (e) {
        localStorage.removeItem("medico_user");
        localStorage.removeItem("medico_token");
      }
    }
  }, []);

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem("medico_user", JSON.stringify(userData));
    localStorage.setItem("medico_token", token);
    setShowAuthModal(false);
    setActiveTab("dashboard");
    detectLocation(token);
  };

  const handleUpdateProfile = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("medico_user", JSON.stringify(updatedUserData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("medico_user");
    localStorage.removeItem("medico_token");
    setActiveTab("landing");
  };

  const handleDoctorLogout = () => {
    setDoctorUser(null);
    localStorage.removeItem("medico_doctor_user");
    setActiveTab("landing");
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem("medico_admin_user");
    localStorage.removeItem("medico_admin_token");
    setActiveTab("landing");
  };

  const handleOpenAuth = (mode = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleOpenAdminPortal = () => {
    if (adminUser) {
      setActiveTab("admin");
    } else {
      setShowAdminAuthModal(true);
    }
  };

  const handleNavigateToDoctorsWithSpecialty = (specialty = "All") => {
    setDoctorSpecialtyFilter(specialty);
    setActiveTab("doctors");
  };

  const formattedUserLocation = user?.location?.city
    ? `${user.location.city}, ${user.location.country || ""}`
    : "Chennai, India";

  const isProtectedTab = ["dashboard", "help", "doctors", "history", "herhealth", "pharmacy", "hospitals", "pharmacies_map"].includes(activeTab);

  const handleSelectDoctorTab = (subTab) => {
    setDoctorSubTab(subTab);
    localStorage.setItem("medico_doctor_sub_tab", subTab);
  };

  // Sync active tab state with address bar URL hash
  useEffect(() => {
    if (activeTab === "doctor_workspace") {
      const routeSlug = doctorSubTab === "my_patients" ? "patients" : doctorSubTab;
      const hash = `#/doctor/${routeSlug}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }
    } else if (activeTab === "admin") {
      if (window.location.hash !== "#/admin") window.history.replaceState(null, "", "#/admin");
    } else if (["dashboard", "help", "doctors", "history", "herhealth", "pharmacy", "hospitals", "pharmacies_map"].includes(activeTab)) {
      const routeSlug = activeTab === "help" ? "triage" : activeTab === "pharmacies_map" ? "pharmacies-map" : activeTab;
      const hash = `#/patient/${routeSlug}`;
      if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
    }
  }, [activeTab, doctorSubTab]);

  // Read URL hash on load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/doctor/")) {
      const slug = hash.replace("#/doctor/", "");
      const sub = slug === "patients" ? "my_patients" : slug;
      if (["dashboard", "my_patients", "appointments"].includes(sub)) {
        setDoctorSubTab(sub);
        localStorage.setItem("medico_doctor_sub_tab", sub);
        setActiveTab("doctor_workspace");
      }
    }
  }, []);

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        doctorUser={doctorUser}
        adminUser={adminUser}
        onLogout={handleLogout}
        onDoctorLogout={handleDoctorLogout}
        onAdminLogout={handleAdminLogout}
        onOpenAuth={handleOpenAuth}
        onOpenDoctorAuth={() => setShowDoctorAuthModal(true)}
        onOpenAdminPortal={handleOpenAdminPortal}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        doctorSubTab={doctorSubTab}
        onSelectDoctorTab={handleSelectDoctorTab}
      />

      <main style={{ flex: 1 }}>
        {activeTab === "landing" && (
          <LandingPage onGetStarted={() => user ? setActiveTab("dashboard") : handleOpenAuth("signup")} />
        )}

        {/* DOCTOR WORKSPACE TAB */}
        {activeTab === "doctor_workspace" && (
          <DoctorWorkspaceTab doctorUser={doctorUser} doctorSubTab={doctorSubTab} onSelectDoctorTab={handleSelectDoctorTab} />
        )}

        {/* PROTECTED PATIENT TABS: REQUIRES PATIENT LOGIN */}
        {user ? (
          <>
            {activeTab === "dashboard" && (
              <DashboardTab
                user={user}
                onNavigate={setActiveTab}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === "help" && (
              <HelpAiTab
                onNavigateToDoctors={handleNavigateToDoctorsWithSpecialty}
                userLocation={formattedUserLocation}
              />
            )}

            {activeTab === "doctors" && (
              <DoctorsTab initialSpecialty={doctorSpecialtyFilter} />
            )}

            {activeTab === "history" && (
              <ConsultationHistoryTab
                onNavigateToDoctors={handleNavigateToDoctorsWithSpecialty}
              />
            )}

            {activeTab === "herhealth" && (
              <HerHealthTab
                user={user}
                onNavigateToDoctors={handleNavigateToDoctorsWithSpecialty}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === "pharmacy" && (
              <PharmacyTab userLocation={formattedUserLocation} />
            )}

            {activeTab === "hospitals" && (
              <NearbyMapTab type="hospital" />
            )}

            {activeTab === "pharmacies_map" && (
              <NearbyMapTab type="pharmacy" />
            )}
          </>
        ) : (
          isProtectedTab && (
            <div style={{ textAlign: "center", padding: "100px 24px", maxWidth: "540px", margin: "0 auto" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(0, 81, 195, 0.08)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <User size={28} />
              </div>
              <h2 className="heading-title" style={{ fontSize: "24px", marginBottom: "8px" }}>
                Patient Authentication Required
              </h2>
              <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
                Symptom Triage Assessment, Doctor Video Consultations, and Pharmacy orders are reserved for signed-in patients. Please sign in to access your Health Vault.
              </p>
              <button className="btn btn-primary" style={{ padding: "12px 28px" }} onClick={() => handleOpenAuth("login")}>
                Sign In / Join as Patient
              </button>
            </div>
          )
        )}

        {activeTab === "admin" && (
          adminUser ? (
            <AdminPortalTab />
          ) : (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <ShieldCheck size={48} color="var(--color-primary)" style={{ margin: "0 auto 12px" }} />
              <h2 className="heading-title" style={{ fontSize: "24px", marginBottom: "8px" }}>
                Admin Authentication Required
              </h2>
              <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "20px" }}>
                Please sign in with administrator credentials (shan01tnu@gmail.com) to access the Medical Board Control Center.
              </p>
              <button className="btn btn-primary" onClick={() => setShowAdminAuthModal(true)}>
                Sign In to Admin Portal
              </button>
            </div>
          )
        )}
      </main>

      {/* Attention Required Bright Mode Footer */}
      <footer style={{
        backgroundColor: "#ffffff",
        color: "var(--color-text)",
        borderTop: "1px solid var(--color-border)",
        padding: "40px 24px 24px",
        marginTop: "60px"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "30px",
          marginBottom: "30px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--color-text-heading)", letterSpacing: "-0.01em" }}>
                Medico
              </span>
            </div>
            <p className="body-text" style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
              Integrated clinical triage and telemedicine network. Connecting patients with verified specialists, partner hospitals, and emergency care.
            </p>
          </div>

          <div>
            <h4 style={{ color: "var(--color-text-heading)", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
              Clinical Portals
            </h4>
            <ul style={{ listStyle: "none", fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li style={{ cursor: "pointer" }} onClick={() => user ? setActiveTab("help") : handleOpenAuth("login")}>Symptom Triage Assessment</li>
              <li style={{ cursor: "pointer" }} onClick={() => user ? setActiveTab("doctors") : handleOpenAuth("login")}>Specialist Doctor Directory</li>
              <li style={{ cursor: "pointer" }} onClick={() => user ? setActiveTab("pharmacy") : handleOpenAuth("login")}>24/7 Verified Pharmacies</li>
              <li style={{ cursor: "pointer" }} onClick={() => setShowDoctorAuthModal(true)}>Physician Onboarding Portal</li>
              <li style={{ cursor: "pointer" }} onClick={handleOpenAdminPortal}>Admin Verification Control</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: "var(--color-text-heading)", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
              Safety & Compliance
            </h4>
            <ul style={{ listStyle: "none", fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Lock size={13} color="var(--color-primary)" /> HIPAA Compliant Security</li>
              <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><ShieldCheck size={13} color="var(--color-primary)" /> ISO 27001 Certified Vault</li>
              <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><PhoneCall size={13} color="#c5221f" /> Emergency Dispatch 108</li>
            </ul>
          </div>
        </div>

        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "20px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "11px",
          color: "var(--color-text-muted)"
        }}>
          <span>© 2026 Medico Healthcare Inc. All rights reserved. Registered Clinical Platform.</span>
          <span>Location: {formattedUserLocation}</span>
        </div>
      </footer>

      {showAuthModal && (
        <AuthPage
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showDoctorAuthModal && (
        <DoctorAuthModal
          onClose={() => setShowDoctorAuthModal(false)}
          onDoctorAuthSuccess={(doc) => {
            setDoctorUser(doc);
            localStorage.setItem("medico_doctor_user", JSON.stringify(doc));
            setDoctorSubTab("dashboard");
            setActiveTab("doctor_workspace");
          }}
        />
      )}

      {showAdminAuthModal && (
        <AdminAuthModal
          onClose={() => setShowAdminAuthModal(false)}
          onAdminAuthSuccess={(adminData) => {
            setAdminUser(adminData);
            setActiveTab("admin");
          }}
        />
      )}
    </div>
  );
}
