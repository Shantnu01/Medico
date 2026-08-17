import React, { useState } from "react";
import { ShieldCheck, Lock, Mail, X, Eye, EyeOff } from "lucide-react";

export function AdminAuthModal({ onClose, onAdminAuthSuccess }) {
  const [email, setEmail] = useState("shan01tnu@gmail.com");
  const [password, setPassword] = useState("admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const API_BASE = import.meta.env.VITE_API_BASE || window.MEDICO_API_BASE || '';

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const contentType = res.headers.get("content-type") || "";
      let data = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        await res.text();
        throw new Error(`Admin server returned status ${res.status}. Please check backend connection.`);
      }

      if (res.ok && data.status === "SUCCESS") {
        localStorage.setItem("medico_admin_token", data.token);
        localStorage.setItem("medico_admin_user", JSON.stringify(data.admin));
        if (onAdminAuthSuccess) onAdminAuthSuccess(data.admin);
        onClose();
      } else {
        setErrorMessage(data.error || "Invalid Admin Credentials.");
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)",
      zIndex: 160, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
    }}>
      <div className="sage-card animate-fade-in" style={{
        width: "100%", maxWidth: "420px", padding: "28px", backgroundColor: "#ffffff"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(0, 81, 195, 0.08)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="heading-title" style={{ fontSize: "18px", fontWeight: "600" }}>Administrator Access</h2>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Medical Board Control Center</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {errorMessage && (
          <div style={{ padding: "10px 12px", backgroundColor: "#fce8e6", border: "1px solid #fad2cf", color: "#c5221f", borderRadius: "var(--radius-sm)", fontSize: "12px", marginBottom: "14px" }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
              Admin Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--color-text-muted)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
              Admin Authorization Key / Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--color-text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "8px 36px 8px 34px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "4px" }} disabled={loading}>
            {loading ? "Authenticating Admin..." : "Sign In to Admin Control Center"}
          </button>
        </form>
      </div>
    </div>
  );
}
