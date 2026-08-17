import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.js";
import { LandingPage } from "./components/LandingPage.js";
import { AuthPage } from "./components/AuthPage.js";
import { DashboardTab } from "./components/DashboardTab.js";
import { HelpAiTab } from "./components/HelpAiTab.js";
import { DoctorsTab } from "./components/DoctorsTab.js";
import { NearbyMapTab } from "./components/NearbyMapTab.js";
import { ConsultationHistoryTab } from "./components/ConsultationHistoryTab.js";
import { HerHealthTab } from "./components/HerHealthTab.js";
import { PharmacyTab } from "./components/PharmacyTab.js";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("medico_theme") || "light");
  const [activeTab, setActiveTab] = useState("landing");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userLocation, setUserLocation] = useState("Chennai, India");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("medico_theme", theme);
  }, [theme]);

  // Fetch IP Geolocation on mount
  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("/api/user/location");
        if (res.ok) {
          const data = await res.json();
          if (data.queryLocation) setUserLocation(data.queryLocation);
        }
      } catch (e) {
        console.error("Location fetch error:", e);
      }
    }
    fetchLocation();
  }, []);

  // Check persisted patient session
  useEffect(() => {
    const savedUser = localStorage.getItem("medico_user");
    const token = localStorage.getItem("medico_token");
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setActiveTab("dashboard");
      } catch (e) {
        console.error("Session restore error:", e);
      }
    }
  }, []);

  const handleToggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setShowAuthModal(false);
    setActiveTab("dashboard");
    localStorage.setItem("medico_user", JSON.stringify(userData));
    localStorage.setItem("medico_token", token);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("landing");
    localStorage.removeItem("medico_user");
    localStorage.removeItem("medico_token");
  };

  const handleNavigateToDoctors = (specialty) => {
    if (specialty) setSelectedSpecialty(specialty);
    setActiveTab("doctors");
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("medico_user", JSON.stringify(updatedUser));
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main style={{ flex: 1, paddingBottom: "40px" }}>
        {activeTab === "landing" && (
          <LandingPage
            onGetStarted={() => {
              if (user) setActiveTab("dashboard");
              else setShowAuthModal(true);
            }}
            onStartTriage={() => setActiveTab("help")}
            userLocation={userLocation}
          />
        )}

        {activeTab === "dashboard" && user && (
          <DashboardTab
            user={user}
            onNavigate={(tab) => setActiveTab(tab)}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === "help" && (
          <HelpAiTab
            onNavigateToDoctors={handleNavigateToDoctors}
            userLocation={userLocation}
          />
        )}

        {activeTab === "doctors" && (
          <DoctorsTab
            user={user}
            initialSpecialty={selectedSpecialty}
            userLocation={userLocation}
            onRequireAuth={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === "history" && (
          <ConsultationHistoryTab
            user={user}
            onNavigateToDoctors={handleNavigateToDoctors}
          />
        )}

        {activeTab === "herhealth" && (
          <HerHealthTab
            user={user}
            onNavigateToDoctors={handleNavigateToDoctors}
          />
        )}

        {activeTab === "pharmacy" && <PharmacyTab />}

        {(activeTab === "hospitals" || activeTab === "pharmacies_map") && (
          <NearbyMapTab userLocation={userLocation} mode={activeTab} />
        )}
      </main>

      {/* Patient Auth Modal */}
      {showAuthModal && (
        <AuthPage
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
