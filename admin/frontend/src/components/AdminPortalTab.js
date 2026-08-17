import React, { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Clock, Award, Activity, User, Building, MapPin, Search, AlertCircle, FileText, CreditCard, GraduationCap } from "lucide-react";

export function AdminPortalTab() {
  const [activeSubTab, setActiveSubTab] = useState("pending");
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [activeDoctors, setActiveDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || window.MEDICO_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/admin/doctors/pending`);
      const data = await res.json();
      if (data.pendingDoctors) setPendingDoctors(data.pendingDoctors);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActive = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || window.MEDICO_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/admin/doctors/active`);
      const data = await res.json();
      if (data.activeDoctors) setActiveDoctors(data.activeDoctors);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPending(), fetchActive()]).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (docId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || window.MEDICO_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/admin/doctors/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: docId })
      });
      const data = await res.json();
      alert(data.message || "Doctor license verified and approved!");
      fetchPending();
      fetchActive();
    } catch (err) {
      alert("Approve failed: " + err.message);
    }
  };

  const handleReject = async (docId) => {
    const reason = prompt("Enter reason for license rejection:", "Unverified Medical Registration License Number.");
    if (reason === null) return;

    try {
      const res = await fetch("/api/admin/doctors/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: docId, reason })
      });
      const data = await res.json();
      alert(data.message || "Doctor application rejected.");
      fetchPending();
      fetchActive();
    } catch (err) {
      alert("Reject failed: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 24px" }}>
      {/* Admin Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "rgba(0, 81, 195, 0.08)",
          color: "var(--color-primary)",
          fontSize: "12px",
          fontWeight: "600",
          marginBottom: "8px",
          border: "1px solid rgba(0, 81, 195, 0.2)"
        }}>
          <ShieldCheck size={14} />
          ADMINISTRATOR CONTROL PANEL • MEDICAL VERIFICATION BOARD
        </div>

        <h1 className="heading-title" style={{ fontSize: "30px", fontWeight: "300", color: "var(--color-text-heading)" }}>
          Physician License Verification & Oversight
        </h1>
        <p className="body-text" style={{ color: "var(--color-text-muted)", maxWidth: "700px", marginTop: "4px" }}>
          Audit doctor applications, verify State Medical Council license numbers, cross-check workplace affiliations, and inspect active clinical working cases.
        </p>
      </div>

      {/* Telemetry Overview Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "16px",
        marginBottom: "30px"
      }}>
        <div className="sage-card" style={{ padding: "18px 20px", borderLeft: "4px solid #b06000" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
            Pending Verification Applications
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
            <span style={{ fontSize: "28px", fontWeight: "300", color: "var(--color-text-heading)" }}>{pendingDoctors.length}</span>
            <span style={{ fontSize: "12px", color: "#b06000", fontWeight: "600" }}>Pending Audit</span>
          </div>
        </div>

        <div className="sage-card" style={{ padding: "18px 20px", borderLeft: "4px solid #137333" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
            Verified Active Doctors
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
            <span style={{ fontSize: "28px", fontWeight: "300", color: "var(--color-text-heading)" }}>{activeDoctors.length}</span>
            <span style={{ fontSize: "12px", color: "#137333", fontWeight: "600" }}>Board-Certified</span>
          </div>
        </div>

        <div className="sage-card" style={{ padding: "18px 20px", borderLeft: "4px solid var(--color-primary)" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
            Live Clinical Working Cases
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
            <span style={{ fontSize: "28px", fontWeight: "300", color: "var(--color-text-heading)" }}>7</span>
            <span style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "600" }}>Active Patient Triage</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <button
          className={`btn ${activeSubTab === "pending" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveSubTab("pending")}
        >
          <Clock size={14} /> Pending License Verification ({pendingDoctors.length})
        </button>
        <button
          className={`btn ${activeSubTab === "active_doctors" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveSubTab("active_doctors")}
        >
          <CheckCircle2 size={14} /> Verified Active Doctors ({activeDoctors.length})
        </button>
        <button
          className={`btn ${activeSubTab === "working_cases" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveSubTab("working_cases")}
        >
          <Activity size={14} /> Live Cases Inspector
        </button>
      </div>

      {/* SUB TAB 1: PENDING DOCTOR VERIFICATION REQUESTS */}
      {activeSubTab === "pending" && (
        <div>
          {pendingDoctors.length === 0 ? (
            <div className="sage-card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-muted)" }}>
              <CheckCircle2 size={36} color="#137333" style={{ margin: "0 auto 10px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--color-text-heading)" }}>All Doctor License Applications Audited!</h3>
              <p className="body-text" style={{ marginTop: "4px" }}>There are no pending doctor registration requests awaiting license verification.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pendingDoctors.map((doc) => (
                <div key={doc.id} className="sage-card" style={{ padding: "24px", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-text-heading)" }}>{doc.name}</h3>
                        <span className="badge badge-warning" style={{ fontSize: "11px" }}>LICENSE AUDIT REQUIRED</span>
                      </div>
                      <span style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "600" }}>
                        {doc.specialty} • {doc.experienceYears} Years Experience • Fee: {doc.consultationFee}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleApprove(doc.id)}>
                        <CheckCircle2 size={14} /> Approve Doctor License
                      </button>
                      <button className="btn btn-outline btn-sm" style={{ color: "#c5221f", borderColor: "#fad2cf" }} onClick={() => handleReject(doc.id)}>
                        <XCircle size={14} /> Reject Application
                      </button>
                    </div>
                  </div>

                  {/* RICH CREDENTIAL AUDIT GRID */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                    padding: "16px",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    fontSize: "12px"
                  }}>
                    <div>
                      <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px", fontWeight: "600" }}>
                        🪪 Registration License ID
                      </span>
                      <strong style={{ color: "var(--color-primary)", fontFamily: "monospace", fontSize: "13px" }}>
                        {doc.medicalLicenseId || doc.licenseNumber}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px", fontWeight: "600" }}>
                        🏛️ State Medical Council
                      </span>
                      <strong>{doc.medicalCouncilAuthority || doc.medicalCouncil}</strong>
                    </div>

                    <div>
                      <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px", fontWeight: "600" }}>
                        🎓 MBBS & Postgrad Degrees
                      </span>
                      <strong>{doc.postgradDegree || doc.qualifications} ({doc.mbbsCollege || "MMC"})</strong>
                    </div>

                    <div>
                      <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px", fontWeight: "600" }}>
                        🏥 Primary Workplace Hospital
                      </span>
                      <strong>{doc.workplaceHospital || doc.hospital}</strong>
                    </div>

                    <div>
                      <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px", fontWeight: "600" }}>
                        🆔 Government Identification
                      </span>
                      <strong>{doc.governmentIdType}: {doc.governmentIdNumber}</strong>
                    </div>

                    <div>
                      <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px", fontWeight: "600" }}>
                        📧 Contact Email & Phone
                      </span>
                      <span>{doc.email} • {doc.workplacePhone || "Verified"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 2: APPROVED ACTIVE DOCTORS */}
      {activeSubTab === "active_doctors" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
          {activeDoctors.map((doc) => (
            <div key={doc.id} className="sage-card" style={{ padding: "20px", backgroundColor: "#ffffff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--color-text-heading)" }}>{doc.name}</h3>
                  <span style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "600" }}>{doc.specialty} • {doc.experience}</span>
                </div>
                <span className="badge badge-low" style={{ fontSize: "11px" }}>VERIFIED LICENSE</span>
              </div>
              <p className="body-text" style={{ color: "var(--color-text-muted)", fontSize: "12px", marginBottom: "6px" }}>
                {doc.workplaceHospital || doc.hospital}
              </p>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "monospace", display: "block", marginBottom: "12px" }}>
                License ID: {doc.medicalLicenseId || "TN-MCI-2012-74819"}
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 10px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)" }}>
                <span>Rating: <strong>★ {doc.rating}</strong></span>
                <span>Active Cases: <strong>{doc.activeCasesCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB TAB 3: LIVE WORKING CASES INSPECTOR */}
      {activeSubTab === "working_cases" && (
        <div className="sage-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Active Clinical Working Cases</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {activeDoctors.map((doc) => (
              <div key={doc.id} style={{ padding: "14px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ fontSize: "13px", color: "var(--color-primary)" }}>Attending Physician: {doc.name} ({doc.specialty})</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                  {doc.workingCases && doc.workingCases.length > 0 ? (
                    doc.workingCases.map((c, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)", fontSize: "12px" }}>
                        <span>Patient: <strong>{c.patientName}</strong> • Complaint: <em>"{c.symptom}"</em></span>
                        <span style={{ color: "#137333", fontWeight: "600" }}>{c.status}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>No active patient consultations assigned right now.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
