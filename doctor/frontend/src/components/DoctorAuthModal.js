import React, { useState } from "react";
import { Stethoscope, ShieldCheck, Clock, CheckCircle2, AlertCircle, X, Award, MapPin, Building, FileText, Lock, CreditCard, GraduationCap, PhoneCall, Eye, EyeOff } from "lucide-react";

export function DoctorAuthModal({ onClose, onDoctorAuthSuccess }) {
  const [mode, setMode] = useState("signup"); // 'signup', 'login', 'waiting'
  const [showPassword, setShowPassword] = useState(false);

  // Doctor Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("General Physician");
  
  // UNIQUE MEDICAL ID & CREDENTIAL VERIFICATION FIELDS
  const [medicalLicenseId, setMedicalLicenseId] = useState("");
  const [medicalCouncilAuthority, setMedicalCouncilAuthority] = useState("Tamil Nadu Medical Council (TNMC)");
  const [licenseRegistrationYear, setLicenseRegistrationYear] = useState("2018");
  const [mbbsCollege, setMbbsCollege] = useState("");
  const [mbbsPassYear, setMbbsPassYear] = useState("2013");
  const [postgradDegree, setPostgradDegree] = useState("");
  
  const [workplaceHospital, setWorkplaceHospital] = useState("");
  const [workplaceDepartment, setWorkplaceDepartment] = useState("Department of Internal Medicine");
  const [workplacePhone, setWorkplacePhone] = useState("");
  
  const [governmentIdType, setGovernmentIdType] = useState("PAN Card");
  const [governmentIdNumber, setGovernmentIdNumber] = useState("");
  const [registrationDocLink, setRegistrationDocLink] = useState("");
  
  const [experienceYears, setExperienceYears] = useState("10");
  const [consultationFee, setConsultationFee] = useState("₹700");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [pendingDoctorData, setPendingDoctorData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const specialtiesList = [
    "General Physician",
    "Cardiologist",
    "Neurologist",
    "Dermatologist",
    "ENT Specialist",
    "Orthopedic",
    "Gastroenterologist",
    "Pulmonologist"
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://temporary-racing-tungsten-4lvc3tm.vercel.app';
    const payload = {
      name,
      email,
      password,
      specialty,
      medicalLicenseId,
      medicalCouncilAuthority,
      licenseRegistrationYear,
      mbbsCollege,
      mbbsPassYear,
      postgradDegree,
      workplaceHospital,
      workplaceDepartment,
      workplacePhone,
      governmentIdType,
      governmentIdNumber,
      registrationDocLink,
      experienceYears: Number(experienceYears),
      consultationFee,
      bio
    };

    try {
      const res = await fetch(`${API_BASE}/api/doctor/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get("content-type") || "";
      let data = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        await res.text();
        throw new Error(`Doctor server returned status ${res.status}. Please check backend connection.`);
      }

      if (res.ok) {
        setPendingDoctorData(data.doctor);
        setMode("waiting");
      } else {
        setErrorMessage(data.error || "Registration failed.");
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://temporary-racing-tungsten-4lvc3tm.vercel.app';

    try {
      const res = await fetch(`${API_BASE}/api/doctor/login`, {
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
        throw new Error(`Doctor server returned status ${res.status}. Please check backend connection.`);
      }

      if (res.ok) {
        if (data.status === "PENDING") {
          setPendingDoctorData(data.doctor);
          setMode("waiting");
        } else if (data.status === "APPROVED") {
          alert(`Welcome Dr. ${data.doctor.name}! Medical license verified.`);
          if (onDoctorAuthSuccess) onDoctorAuthSuccess(data.doctor);
          onClose();
        }
      } else {
        setErrorMessage(data.error || "Invalid doctor credentials.");
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
      zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
    }}>
      <div className="sage-card animate-fade-in" style={{
        width: "100%", maxWidth: mode === "signup" ? "740px" : "480px",
        maxHeight: "92vh", overflowY: "auto", padding: "30px", backgroundColor: "#ffffff"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", backgroundColor: "#e6f4ea", display: "flex", alignItems: "center", justifyContent: "center", color: "#137333" }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <h2 className="heading-title" style={{ fontSize: "18px", fontWeight: "600" }}>
                Physician License Verification Portal
              </h2>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Mandatory Credential Audit for Medical Practitioners</span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {errorMessage && (
          <div style={{ padding: "10px 14px", backgroundColor: "#fce8e6", border: "1px solid #fad2cf", color: "#c5221f", borderRadius: "var(--radius-sm)", fontSize: "12px", marginBottom: "16px" }}>
            {errorMessage}
          </div>
        )}

        {/* MODE 1: WAITING SCREEN (PENDING VERIFICATION) */}
        {mode === "waiting" && (
          <div style={{ textAlign: "center", padding: "20px 10px" }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%",
              backgroundColor: "#fef7e0", border: "1px solid #fecd67",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Clock size={30} color="#b06000" className="animate-pulse" />
            </div>

            <span className="badge badge-warning" style={{ marginBottom: "8px", fontSize: "11px" }}>
              CREDENTIAL VERIFICATION PENDING
            </span>

            <h3 style={{ fontSize: "20px", fontWeight: "300", color: "var(--color-text-heading)", marginBottom: "8px" }}>
              Application Under Medical Review
            </h3>

            <p className="body-text" style={{ color: "var(--color-text-muted)", maxWidth: "460px", margin: "0 auto 20px", fontSize: "13px" }}>
              Thank you, <strong>{pendingDoctorData?.name}</strong>. Your Medical Registration License ID (<strong>{pendingDoctorData?.medicalLicenseId}</strong>) has been logged and submitted to our Medical Verification Board.
            </p>

            {/* Detailed Submitted Summary Box */}
            <div style={{
              padding: "16px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              textAlign: "left",
              fontSize: "12px",
              marginBottom: "24px"
            }}>
              <p style={{ marginBottom: "4px" }}><strong>Medical License ID:</strong> <span style={{ fontFamily: "monospace", color: "var(--color-primary)" }}>{pendingDoctorData?.medicalLicenseId}</span></p>
              <p style={{ marginBottom: "4px" }}><strong>Licensing Council:</strong> {pendingDoctorData?.medicalCouncilAuthority}</p>
              <p style={{ marginBottom: "4px" }}><strong>Workplace Hospital:</strong> {pendingDoctorData?.workplaceHospital}</p>
              <p style={{ marginBottom: "4px" }}><strong>Government ID:</strong> {pendingDoctorData?.governmentIdType} ({pendingDoctorData?.governmentIdNumber})</p>
              <p style={{ marginBottom: "4px" }}><strong>Review Status:</strong> <span style={{ color: "#b06000", fontWeight: "600" }}>Awaiting Administrator License Audit</span></p>
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>
              Got It, I'll Await License Verification
            </button>
          </div>
        )}

        {/* MODE 2: RIGOROUS DOCTOR SIGNUP FORM */}
        {mode === "signup" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Doctor Credential Onboarding</span>
              <button type="button" onClick={() => setMode("login")} className="btn btn-outline btn-sm" style={{ fontSize: "11px" }}>
                Already Registered? Sign In
              </button>
            </div>

            {/* SECTION A: BASIC ACCOUNT INFO */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                  Full Doctor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Senthil Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="senthil.cardio@apollo.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                  Account Password *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", padding: "7px 32px 7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION B: UNIQUE MEDICAL COUNCIL VERIFICATION DATA */}
            <div style={{ padding: "14px", backgroundColor: "#f8f9fa", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CreditCard size={16} color="var(--color-primary)" />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  1. State / National Medical Council Registration Data
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Medical Registration License ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TN-MCI-2018-098234"
                    value={medicalLicenseId}
                    onChange={(e) => setMedicalLicenseId(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Licensing Medical Council *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tamil Nadu Medical Council"
                    value={medicalCouncilAuthority}
                    onChange={(e) => setMedicalCouncilAuthority(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Registration Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2018"
                    value={licenseRegistrationYear}
                    onChange={(e) => setLicenseRegistrationYear(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION C: ACADEMIC MEDICAL QUALIFICATIONS */}
            <div style={{ padding: "14px", backgroundColor: "#f8f9fa", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <GraduationCap size={16} color="#137333" />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#137333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  2. Academic Qualifications & Medical Degrees
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Undergrad MBBS College *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madras Medical College"
                    value={mbbsCollege}
                    onChange={(e) => setMbbsCollege(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    MBBS Passing Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2013"
                    value={mbbsPassYear}
                    onChange={(e) => setMbbsPassYear(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Postgrad Degree (MD/MS/DNB) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MD (Cardiology) CMC Vellore"
                    value={postgradDegree}
                    onChange={(e) => setPostgradDegree(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION D: WORKPLACE & GOVERNMENT ID */}
            <div style={{ padding: "14px", backgroundColor: "#f8f9fa", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Building size={16} color="#b06000" />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#b06000", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  3. Primary Workplace Affiliation & Govt Identity
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Workplace Hospital / Clinic *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Hospitals, Greams Rd"
                    value={workplaceHospital}
                    onChange={(e) => setWorkplaceHospital(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Hospital Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dept of Cardiology"
                    value={workplaceDepartment}
                    onChange={(e) => setWorkplaceDepartment(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Govt ID (PAN / Aadhaar Number) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABCDE1234F"
                    value={governmentIdNumber}
                    onChange={(e) => setGovernmentIdNumber(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Specialty Category *
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  >
                    {specialtiesList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Experience Years *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>
                    Consultation Fee *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹800"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "6px" }}
              disabled={loading}
            >
              {loading ? "Submitting Medical Verification Package..." : "Submit Doctor Verification Credentials"}
            </button>
          </form>
        )}

        {/* MODE 3: DOCTOR LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Doctor Portal Sign In</span>
              <button type="button" onClick={() => setMode("signup")} className="btn btn-outline btn-sm" style={{ fontSize: "11px" }}>
                New Doctor? Register Credentials
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Doctor Email Address
              </label>
              <input
                type="email"
                required
                placeholder="senthil.cardio@apollo.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", padding: "8px 36px 8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "4px" }}
              disabled={loading}
            >
              {loading ? "Verifying License..." : "Sign In to Physician Portal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
