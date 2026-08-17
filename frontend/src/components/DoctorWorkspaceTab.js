import React, { useState, useEffect } from "react";
import {
  Stethoscope, User, Calendar, Pill, Activity, FileText, Bot,
  CheckCircle2, X, Plus, Sparkles, Bell, RefreshCw, ChevronRight,
  LayoutDashboard, Users, ClipboardList, Utensils, Zap, Loader2,
  Clock, TrendingUp, Heart, Shield, Edit3, Save
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Shared style tokens
═══════════════════════════════════════════════════════════════ */
const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--color-border)",
  fontSize: "14px",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 150ms ease",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.07em",
  color: "var(--color-text-muted)",
  marginBottom: "6px",
  textTransform: "uppercase",
};

const sectionHeadStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "var(--color-text-heading)",
  margin: "0 0 6px",
};

const sectionSubStyle = {
  fontSize: "13px",
  color: "var(--color-text-muted)",
  margin: 0,
};

/* ═══════════════════════════════════════════════════════════════
   Patient Management Full-Screen Modal
═══════════════════════════════════════════════════════════════ */
function PatientManagementModal({ patient, doctorUser, onClose, onSaved }) {
  const [activeSection, setActiveSection] = useState("overview");

  /* ── Diet ── */
  const defaultDiet = { Monday: "", Tuesday: "", Wednesday: "", Thursday: "", Friday: "", Saturday: "", Sunday: "" };
  const [dietPlan, setDietPlan] = useState(patient.dietPlan || defaultDiet);
  const [generatingDiet, setGeneratingDiet] = useState(false);
  const [dietSaving, setDietSaving] = useState(false);

  /* ── Prescriptions ── */
  const [prescriptions, setPrescriptions] = useState(patient.prescriptions || []);
  const [newMed, setNewMed] = useState({ medicineName: "", dosage: "1 Tablet", timeDose: "After Dinner", duration: "7 Days", instructions: "" });
  const [addingMed, setAddingMed] = useState(false);
  const [prescSaving, setPrescSaving] = useState(false);

  /* ── Alerts ── */
  const [alerts, setAlerts] = useState(patient.alerts || []);
  const [newAlert, setNewAlert] = useState({ time: "08:00", label: "", type: "medicine" });
  const [addingAlert, setAddingAlert] = useState(false);
  const [alertSaving, setAlertSaving] = useState(false);

  /* ── Notes ── */
  const [doctorNotes, setDoctorNotes] = useState(patient.doctorNotes || "");
  const [notesSaving, setNotesSaving] = useState(false);

  /* ── AI ── */
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const patientId = patient._id || patient.id;
  const bmi = (patient.heightCm && patient.weightKg)
    ? (Number(patient.weightKg) / Math.pow(Number(patient.heightCm) / 100, 2)).toFixed(1)
    : "N/A";

  /* ── Handlers ── */
  const handleSaveDiet = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setDietSaving(true);
    try {
      await fetch("/api/doctor/patient/diet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, dietPlan }) });
      onSaved && onSaved();
      alert("Diet plan saved successfully!");
    } catch { alert("Failed to save diet plan."); }
    finally { setDietSaving(false); }
  };

  const handleGenerateDiet = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setGeneratingDiet(true);
    try {
      const res = await fetch("/api/doctor/generate-diet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          symptomComplaint: patient.symptomComplaint || patient.medicalHistory || "General wellness",
          medicalHistory: patient.medicalHistory || "",
          allergies: patient.allergies || "",
          age: patient.age || 28,
          gender: patient.gender || ""
        })
      });
      const data = await res.json();
      if (data.diet_plan) {
        setDietPlan(data.diet_plan);
      }
    } catch { alert("AI diet generation failed."); }
    finally { setGeneratingDiet(false); }
  };

  const handleAddPrescription = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newMed.medicineName.trim()) return alert("Please enter a medicine name.");
    setPrescSaving(true);
    try {
      const obj = { ...newMed, prescribedBy: doctorUser?.name || "Attending Physician", date: new Date().toLocaleDateString("en-IN") };
      await fetch("/api/doctor/patient/prescription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, prescription: obj }) });
      setPrescriptions(prev => [...prev, obj]);
      setNewMed({ medicineName: "", dosage: "1 Tablet", timeDose: "After Dinner", duration: "7 Days", instructions: "" });
      setAddingMed(false);
      onSaved && onSaved();
    } catch { alert("Failed to save prescription."); }
    finally { setPrescSaving(false); }
  };

  const handleAddAlert = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newAlert.label.trim()) return alert("Please enter an alert label.");
    setAlertSaving(true);
    try {
      await fetch("/api/doctor/patient/alarm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, alarmTime: newAlert.time, label: newAlert.label }) });
      setAlerts(prev => [...prev, { ...newAlert, id: Date.now() }]);
      setNewAlert({ time: "08:00", label: "", type: "medicine" });
      setAddingAlert(false);
      onSaved && onSaved();
    } catch { alert("Failed to set alert."); }
    finally { setAlertSaving(false); }
  };

  const handleSaveNotes = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setNotesSaving(true);
    try {
      await fetch("/api/doctor/patient/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, doctorNotes }) });
      onSaved && onSaved();
      alert("Notes saved!");
    } catch { alert("Failed to save notes."); }
    finally { setNotesSaving(false); }
  };

  const handleRunAI = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAiAnalyzing(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/clinical-copilot", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: patient.symptomComplaint || patient.medicalHistory || "General checkup",
          specialty: doctorUser?.specialty || "General Medicine",
          patientContext: `Patient: ${patient.name}, Age: ${patient.age || 28}, Gender: ${patient.gender || "N/A"}, Blood Group: ${patient.bloodGroup || "O+"}, Height: ${patient.heightCm || 175}cm, Weight: ${patient.weightKg || 70}kg, BMI: ${bmi}. Medical History: ${patient.medicalHistory || "None"}. Allergies: ${patient.allergies || "None"}. Current Complaint: ${patient.symptomComplaint || "General Triage"}.`
        })
      });
      const data = await res.json();
      setAiResult(data);
    } catch { alert("AI analysis failed. Please try again."); }
    finally { setAiAnalyzing(false); }
  };

  /* ── Medical History Files & Consultation Completion ── */
  const [historyFiles, setHistoryFiles] = useState([]);
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [completingConsult, setCompletingConsult] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [summarizingHistory, setSummarizingHistory] = useState(false);
  const [viewTxtFile, setViewTxtFile] = useState(null);

  const fetchPatientHistoryFiles = async () => {
    setFetchingFiles(true);
    try {
      const res = await fetch(`/api/patient/medical-history-files?patientId=${patientId}`);
      const data = await res.json();
      setHistoryFiles(data.files || []);
    } catch (e) {
      console.error("Fetch history files error:", e);
    } finally {
      setFetchingFiles(false);
    }
  };

  const handleCompleteConsultation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setCompletingConsult(true);
    try {
      const res = await fetch("/api/doctor/consultation/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          appointmentId: patient._id || patient.id,
          doctorNotes,
          dietPlan,
          prescriptions,
          symptomComplaint: patient.symptomComplaint || "General Outpatient Consultation",
          doctorName: doctorUser?.name || "Attending Physician",
          specialty: doctorUser?.specialty || "General Physician",
          workplaceHospital: doctorUser?.workplaceHospital || "Apollo Hospitals"
        })
      });
      const data = await res.json();
      alert("✅ Consultation Completed Successfully!\nClinical .txt record file generated and saved to Patient Medical History.");
      onSaved && onSaved();
      onClose && onClose();
    } catch {
      alert("Failed to complete consultation.");
    } finally {
      setCompletingConsult(false);
    }
  };

  const handleSummarizeMedicalHistory = async () => {
    setSummarizingHistory(true);
    try {
      const res = await fetch("/api/ai/summarize-medical-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId })
      });
      const data = await res.json();
      setAiSummary(data);
    } catch {
      alert("Failed to summarize medical history.");
    } finally {
      setSummarizingHistory(false);
    }
  };

  const navItems = [
    { key: "overview",      label: "Patient Overview",           icon: <User size={15} /> },
    { key: "history_files", label: "Medical History (.txt)",     icon: <ClipboardList size={15} /> },
    { key: "diet",          label: "Diet Plan",                  icon: <Utensils size={15} /> },
    { key: "prescription",  label: "Medications",                icon: <Pill size={15} /> },
    { key: "alerts",        label: "Alerts",                     icon: <Bell size={15} /> },
    { key: "notes",         label: "Doctor Notes",               icon: <FileText size={15} /> },
    { key: "ai",            label: "Clinical AI Analysis",       icon: <Zap size={15} /> },
  ];

  const vitals = [
    { label: "Age",         value: patient.age ? `${patient.age} yrs` : "N/A",            icon: <User size={18} />,        color: "#3b82f6" },
    { label: "Gender",      value: patient.gender || "Not specified",                       icon: <Shield size={18} />,      color: "#8b5cf6" },
    { label: "Blood Group", value: patient.bloodGroup || "O+",                              icon: <Heart size={18} />,       color: "#ef4444" },
    { label: "Height",      value: patient.heightCm ? `${patient.heightCm} cm` : "N/A",   icon: <TrendingUp size={18} />,  color: "#059669" },
    { label: "Weight",      value: patient.weightKg ? `${patient.weightKg} kg` : "N/A",   icon: <Activity size={18} />,    color: "#d97706" },
    { label: "BMI",         value: bmi,                                                     icon: <ClipboardList size={18} />, color: "var(--color-primary)" },
    { label: "Allergies",   value: patient.allergies || "None reported",                    icon: <Shield size={18} />,      color: "#64748b" },
    { label: "Email",       value: patient.email || patient.patientEmail || "—",           icon: <FileText size={18} />,    color: "#64748b" },
  ];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(10, 15, 25, 0.78)",
      backdropFilter: "blur(10px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div
        className="animate-fade-in"
        style={{
          width: "95vw",
          maxWidth: "1140px",
          height: "88vh",
          maxHeight: "840px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 32px 96px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* ── 1. Top Header Bar ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "rgba(51, 130, 114, 0.15)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "19px",
              border: "1.5px solid rgba(51, 130, 114, 0.3)"
            }}>
              {patient.name?.charAt(0).toUpperCase() || "P"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: "19px", fontWeight: "700", color: "var(--color-text-heading)", margin: 0 }}>
                  {patient.name}
                </h2>
                <span className="badge badge-primary" style={{ fontSize: "11px", padding: "3px 10px" }}>
                  CONFIRMED PATIENT
                </span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--color-text-muted)", margin: "3px 0 0", display: "flex", gap: "10px", alignItems: "center" }}>
                <span>Age: <strong>{patient.age || "28"} yrs</strong></span>
                <span>&bull;</span>
                <span>Blood: <strong style={{ color: "var(--color-primary)" }}>{patient.bloodGroup || "O+"}</strong></span>
                <span>&bull;</span>
                <span>{patient.email || patient.patientEmail || "Registered"}</span>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handleCompleteConsultation}
              disabled={completingConsult}
              className="btn btn-primary"
              style={{ borderRadius: "var(--radius-pill)", fontSize: "13px", height: "36px" }}
            >
              {completingConsult ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {completingConsult ? "Completing..." : "Complete Consultation & Save .txt Record"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 150ms ease"
              }}
              title="Close Window (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── 2. Horizontal Navigation Tabs Bar ── */}
        <div style={{
          display: "flex",
          gap: "6px",
          padding: "10px 24px",
          backgroundColor: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          overflowX: "auto",
          flexShrink: 0
        }}>
          {navItems.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveSection(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: activeSection === item.key ? "1px solid var(--color-primary)" : "1px solid transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: activeSection === item.key ? "700" : "500",
                color: activeSection === item.key ? "var(--color-on-primary)" : "var(--color-text-muted)",
                backgroundColor: activeSection === item.key ? "var(--color-primary)" : "transparent",
                transition: "all 150ms ease",
                whiteSpace: "nowrap"
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── 3. Main Scrollable Content View ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", backgroundColor: "var(--color-surface)" }}>

          {/* ══ MEDICAL HISTORY (.TXT FILES) ══ */}
          {activeSection === "history_files" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h3 style={sectionHeadStyle}>Past Consultation .txt Records &amp; Medical History</h3>
                  <p style={sectionSubStyle}>Review previous consultation text files saved by attending doctors, problem statements, prescribed medicines, and custom diet plans.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSummarizeMedicalHistory}
                  disabled={summarizingHistory}
                  className="btn btn-primary"
                  style={{ borderRadius: "var(--radius-pill)", fontSize: "13px", height: "40px" }}
                >
                  {summarizingHistory ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {summarizingHistory ? "AI Summarizing..." : "AI Summarize Medical History"}
                </button>
              </div>

              {/* AI Executive Summary Card */}
              {aiSummary && (
                <div style={{ padding: "24px", backgroundColor: "#f0f4fb", borderRadius: "var(--radius-lg)", border: "1.5px solid rgba(0, 81, 195, 0.25)", marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", fontWeight: "700", fontSize: "15px", marginBottom: "10px" }}>
                    <Sparkles size={18} /> AI Executive Clinical Medical History Summary
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--color-text-heading)", lineHeight: 1.6, marginBottom: "16px" }}>
                    {aiSummary.executive_summary}
                  </p>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "13px" }}>
                    <div><strong>Risk Level:</strong> <span className="badge badge-primary">{aiSummary.risk_overview || "LOW RISK"}</span></div>
                    <div><strong>Key Conditions:</strong> {(aiSummary.identified_conditions || []).join(", ") || "None"}</div>
                  </div>
                </div>
              )}

              {/* Action: Refresh / Load Files */}
              <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={fetchPatientHistoryFiles} className="btn btn-outline btn-sm" style={{ fontSize: "12px" }}>
                  <RefreshCw size={13} className={fetchingFiles ? "animate-spin" : ""} /> Load Latest Records
                </button>
              </div>

              {fetchingFiles ? (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                  <p>Loading patient's .txt consultation record files...</p>
                </div>
              ) : historyFiles.length === 0 ? (
                <div style={{ padding: "60px 24px", textAlign: "center", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <FileText size={36} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
                  <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>No previous consultation .txt files found for this patient. Completing this consultation will automatically generate and store the first .txt record.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                  {historyFiles.map((file) => (
                    <div key={file.id} style={{ padding: "20px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <FileText size={20} color="var(--color-primary)" />
                          <strong style={{ fontSize: "14px", color: "var(--color-text-heading)", wordBreak: "break-all" }}>{file.fileName}</strong>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "10px" }}>
                          Date: <strong>{file.date}</strong> &bull; Doctor: <strong>{file.doctorName}</strong> ({file.specialty})
                        </div>
                        <div style={{ padding: "10px 12px", backgroundColor: "#ffffff", borderRadius: "var(--radius-sm)", fontSize: "12px", border: "1px solid var(--color-border)", marginBottom: "14px" }}>
                          <strong>Problem Stated:</strong> "{file.problemStated}"
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setViewTxtFile(file)}
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        View Full .txt Consultation Record
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TXT FILE CONTENT MODAL */}
              {viewTxtFile && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                  <div style={{ width: "100%", maxWidth: "680px", backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", maxHeight: "85vh", overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FileText size={20} color="var(--color-primary)" />
                        <h4 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>{viewTxtFile.fileName}</h4>
                      </div>
                      <button onClick={() => setViewTxtFile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
                    </div>

                    <pre style={{ backgroundColor: "#1e293b", color: "#e2e8f0", padding: "20px", borderRadius: "12px", fontSize: "12.5px", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6, maxHeight: "420px", overflowY: "auto" }}>
                      {viewTxtFile.fileContent}
                    </pre>

                    <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                      <button className="btn btn-primary btn-sm" onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([viewTxtFile.fileContent], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = viewTxtFile.fileName;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}>
                        Download .txt Record
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ OVERVIEW ══ */}
          {activeSection === "overview" && (
            <div>
              <div style={{ marginBottom: "28px" }}>
                <h3 style={sectionHeadStyle}>Patient Medical Profile</h3>
                <p style={sectionSubStyle}>Demographics, physical vitals, allergies, and symptom intake details.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                {vitals.map(v => (
                  <div key={v.label} style={{
                    padding: "18px 20px",
                    backgroundColor: "var(--color-bg)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                    display: "flex", alignItems: "flex-start", gap: "14px"
                  }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-md)", backgroundColor: `${v.color}15`, color: v.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {v.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>{v.label}</div>
                      <div style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--color-text-heading)" }}>{v.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "22px 24px", backgroundColor: "rgba(51,130,114,0.06)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(51,130,114,0.25)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>CHIEF SYMPTOM / COMPLAINT</span>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-heading)", margin: "6px 0 0" }}>{patient.symptomComplaint || "General Triage Consultation"}</h4>
                </div>

                <div style={{ padding: "22px 24px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>PAST MEDICAL HISTORY</span>
                  <p style={{ fontSize: "14px", color: "var(--color-text-heading)", margin: "6px 0 0", lineHeight: 1.6 }}>{patient.medicalHistory || "None reported."}</p>
                </div>

                <div style={{ padding: "22px 24px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>APPOINTMENT TIME &amp; SLOT</span>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-heading)", margin: "6px 0 0" }}>{patient.appointmentDate || "Confirmed"} {patient.slotTime ? `at ${patient.slotTime}` : ""}</p>
                </div>
              </div>
            </div>
          )}

          {/* ══ DIET PLAN ══ */}
          {activeSection === "diet" && (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", marginBottom: "28px", flexWrap: "wrap" }}>
                <div>
                  <h3 style={sectionHeadStyle}>7-Day Clinical Diet Plan</h3>
                  <p style={sectionSubStyle}>Write custom daily meals, or click AI Generate Plan to build a personalized meal plan tailored to this patient's medical condition.</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateDiet}
                  disabled={generatingDiet}
                  className="btn btn-outline"
                  style={{ borderRadius: "var(--radius-pill)", fontSize: "13px", height: "40px", flexShrink: 0, minWidth: "160px" }}
                >
                  {generatingDiet ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} color="var(--color-primary)" />}
                  {generatingDiet ? "Generating AI Diet..." : "AI Generate Plan"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
                {Object.entries(dietPlan).map(([day, meal]) => (
                  <div key={day} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ paddingTop: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-text-heading)" }}>{day}</span>
                    </div>
                    <textarea
                      value={meal}
                      onChange={e => setDietPlan({ ...dietPlan, [day]: e.target.value })}
                      placeholder="Breakfast: ... &nbsp; Lunch: ... &nbsp; Dinner: ..."
                      rows={2}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveDiet}
                disabled={dietSaving}
                className="btn btn-primary"
                style={{ borderRadius: "var(--radius-pill)", height: "44px", minWidth: "180px", fontSize: "14px" }}
              >
                {dietSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                {dietSaving ? "Saving..." : "Save Diet Plan"}
              </button>
            </div>
          )}

          {/* ══ MEDICATIONS ══ */}
          {activeSection === "prescription" && (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", marginBottom: "28px" }}>
                <div>
                  <h3 style={sectionHeadStyle}>Medications &amp; Prescriptions</h3>
                  <p style={sectionSubStyle}>Active prescriptions for this patient. Click Add Medication to write a new prescription.</p>
                </div>
                {!addingMed && (
                  <button
                    type="button"
                    onClick={() => setAddingMed(true)}
                    className="btn btn-primary"
                    style={{ borderRadius: "var(--radius-pill)", fontSize: "13px", height: "40px" }}
                  >
                    <Plus size={14} /> Add Medication
                  </button>
                )}
              </div>

              {addingMed && (
                <div style={{ padding: "28px 30px", backgroundColor: "rgba(51,130,114,0.06)", borderRadius: "var(--radius-lg)", border: "1.5px solid rgba(51,130,114,0.28)", marginBottom: "28px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "var(--color-text-heading)" }}>New Medication Prescription</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Medicine Name *</label>
                      <input type="text" placeholder="e.g. Paracetamol 500mg" value={newMed.medicineName} onChange={e => setNewMed({ ...newMed, medicineName: e.target.value })} style={inputStyle} autoFocus />
                    </div>
                    <div>
                      <label style={labelStyle}>Dosage</label>
                      <input type="text" placeholder="e.g. 1 Tablet" value={newMed.dosage} onChange={e => setNewMed({ ...newMed, dosage: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Frequency / Timing</label>
                      <select value={newMed.timeDose} onChange={e => setNewMed({ ...newMed, timeDose: e.target.value })} style={inputStyle}>
                        <option value="After Breakfast">After Breakfast</option>
                        <option value="After Lunch">After Lunch</option>
                        <option value="After Dinner">After Dinner</option>
                        <option value="Twice Daily (Morning &amp; Night)">Twice Daily (Morning &amp; Night)</option>
                        <option value="Three Times Daily (TID)">Three Times Daily (TID)</option>
                        <option value="As Needed (PRN)">As Needed (PRN)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Duration</label>
                      <input type="text" placeholder="e.g. 5 Days" value={newMed.duration} onChange={e => setNewMed({ ...newMed, duration: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Special Instructions</label>
                      <input type="text" placeholder="e.g. Take with warm water" value={newMed.instructions} onChange={e => setNewMed({ ...newMed, instructions: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" className="btn btn-primary" onClick={handleAddPrescription} disabled={prescSaving} style={{ borderRadius: "var(--radius-pill)" }}>
                      {prescSaving ? "Saving..." : "Save Prescription"}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setAddingMed(false)} style={{ borderRadius: "var(--radius-pill)" }}>Cancel</button>
                  </div>
                </div>
              )}

              {prescriptions.length === 0 ? (
                <div style={{ padding: "60px 24px", textAlign: "center", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <Pill size={36} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
                  <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>No prescriptions recorded yet. Click "Add Medication" above to write one.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {prescriptions.map((p, idx) => (
                    <div key={idx} style={{ padding: "20px 24px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 4px" }}>{p.medicineName}</h4>
                        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>{p.dosage} &bull; {p.timeDose} &bull; {p.duration} {p.instructions ? `(${p.instructions})` : ""}</p>
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: "11px" }}>ACTIVE</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ ALERTS ══ */}
          {activeSection === "alerts" && (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", marginBottom: "28px" }}>
                <div>
                  <h3 style={sectionHeadStyle}>Patient Alarm Reminders</h3>
                  <p style={sectionSubStyle}>Schedule medication dose alarms and device notifications on the patient's phone.</p>
                </div>
                {!addingAlert && (
                  <button
                    type="button"
                    onClick={() => setAddingAlert(true)}
                    className="btn btn-primary"
                    style={{ borderRadius: "var(--radius-pill)", fontSize: "13px", height: "40px" }}
                  >
                    <Plus size={14} /> Schedule Alert
                  </button>
                )}
              </div>

              {addingAlert && (
                <div style={{ padding: "26px", backgroundColor: "rgba(51,130,114,0.06)", borderRadius: "var(--radius-lg)", border: "1.5px solid rgba(51,130,114,0.28)", marginBottom: "28px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "18px", color: "var(--color-text-heading)" }}>Schedule Dose Alarm</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "16px", marginBottom: "18px" }}>
                    <div>
                      <label style={labelStyle}>Time *</label>
                      <input type="time" value={newAlert.time} onChange={e => setNewAlert({ ...newAlert, time: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Reminder Label *</label>
                      <input type="text" placeholder="e.g. Paracetamol Dose Reminder" value={newAlert.label} onChange={e => setNewAlert({ ...newAlert, label: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" className="btn btn-primary" onClick={handleAddAlert} disabled={alertSaving} style={{ borderRadius: "var(--radius-pill)" }}>
                      {alertSaving ? "Scheduling..." : "Schedule Alarm"}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setAddingAlert(false)} style={{ borderRadius: "var(--radius-pill)" }}>Cancel</button>
                  </div>
                </div>
              )}

              {alerts.length === 0 ? (
                <div style={{ padding: "60px 24px", textAlign: "center", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <Bell size={36} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
                  <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>No alerts scheduled yet. Click "Schedule Alert" above to create one.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {alerts.map((al, idx) => (
                    <div key={idx} style={{ padding: "18px 24px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(51,130,114,0.12)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 2px" }}>{al.label}</h4>
                          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Alarm scheduled at <strong>{al.alarmTime || al.time}</strong></span>
                        </div>
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: "11px" }}>ACTIVE ALARM</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ DOCTOR NOTES ══ */}
          {activeSection === "notes" && (
            <div>
              <div style={{ marginBottom: "28px" }}>
                <h3 style={sectionHeadStyle}>Clinical Doctor Notes</h3>
                <p style={sectionSubStyle}>Write confidential diagnostic notes, observations, and clinical follow-up instructions for this patient.</p>
              </div>

              <textarea
                rows={10}
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
                placeholder="Record clinical examination notes, vitals observation, differential diagnosis notes..."
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, marginBottom: "24px" }}
              />

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={notesSaving}
                className="btn btn-primary"
                style={{ borderRadius: "var(--radius-pill)", height: "44px", minWidth: "180px", fontSize: "14px" }}
              >
                {notesSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                {notesSaving ? "Saving Notes..." : "Save Clinical Notes"}
              </button>
            </div>
          )}

          {/* ══ CLINICAL AI ANALYSIS ══ */}
          {activeSection === "ai" && (
            <div>
              <div style={{ marginBottom: "28px" }}>
                <h3 style={sectionHeadStyle}>Clinical AI Analysis</h3>
                <p style={sectionSubStyle}>USMLE-grade diagnostic inference calculated dynamically from this patient's chief complaint, vitals, medical history, and blood group.</p>
              </div>

              <div style={{ padding: "20px 24px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "12px" }}>Patient Profile Context</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "13.5px" }}>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Age: </span><strong style={{ color: "var(--color-text-heading)" }}>{patient.age || "28"} yrs</strong></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>BMI: </span><strong style={{ color: "var(--color-text-heading)" }}>{bmi}</strong></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Blood Group: </span><strong style={{ color: "var(--color-text-heading)" }}>{patient.bloodGroup || "O+"}</strong></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Complaint: </span><strong style={{ color: "var(--color-text-heading)" }}>{patient.symptomComplaint || "Routine Triage"}</strong></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Allergies: </span><strong style={{ color: "var(--color-text-heading)" }}>{patient.allergies || "None"}</strong></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAI}
                disabled={aiAnalyzing}
                className="btn btn-primary"
                style={{ borderRadius: "var(--radius-pill)", height: "46px", minWidth: "240px", fontSize: "14px", marginBottom: "28px" }}
              >
                {aiAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {aiAnalyzing ? "Running AI Clinical Inference..." : "Run Clinical AI Analysis"}
              </button>

              {aiAnalyzing && (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
                  <Loader2 size={36} color="var(--color-primary)" className="animate-spin" style={{ margin: "0 auto 16px" }} />
                  <p style={{ fontSize: "15px" }}>Evaluating clinical symptoms and medical history...</p>
                </div>
              )}

              {aiResult && !aiAnalyzing && (() => {
                const diffs = aiResult.differential_diagnoses || [];
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {diffs.length > 0 && (
                      <div style={{ padding: "24px 28px", backgroundColor: "rgba(16,185,129,0.08)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(16,185,129,0.28)" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#059669", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "10px" }}>Primary Diagnosis</div>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--color-text-heading)", marginBottom: "6px" }}>{diffs[0]?.disease}</div>
                        <div style={{ fontSize: "14px", color: "#059669", fontWeight: "700", marginBottom: "8px" }}>{diffs[0]?.likelihood_pct}% Likelihood</div>
                        <div style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.7 }}>{diffs[0]?.clinical_rationale}</div>
                      </div>
                    )}

                    {diffs.length > 1 && (
                      <div style={{ padding: "24px 28px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "16px" }}>Differential Diagnoses</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          {diffs.slice(1).map((d, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "14px", borderBottom: i < diffs.length - 2 ? "1px solid var(--color-border)" : "none" }}>
                              <div style={{ flex: 1, paddingRight: "16px" }}>
                                <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-text-heading)", marginBottom: "4px" }}>{d.disease}</div>
                                <div style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>{d.clinical_rationale}</div>
                              </div>
                              <span className="badge badge-medium" style={{ flexShrink: 0, fontSize: "12px", padding: "5px 12px" }}>{d.likelihood_pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiResult.recommended_tests && (
                      <div style={{ padding: "24px 28px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "14px" }}>Recommended Tests &amp; Investigations</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {(Array.isArray(aiResult.recommended_tests) ? aiResult.recommended_tests : [aiResult.recommended_tests]).map((t, i) => (
                            <span key={i} className="badge badge-primary" style={{ fontSize: "13px", padding: "6px 14px" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   Main Doctor Workspace Tab
═══════════════════════════════════════════════════════════════ */
export function DoctorWorkspaceTab({ doctorUser, doctorSubTab = "dashboard", onSelectDoctorTab }) {
  const [activeSubTab, setActiveSubTab] = useState(doctorSubTab);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managingPatient, setManagingPatient] = useState(null);

  // Doctor Edit Profile
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [docName, setDocName] = useState(doctorUser?.name || "");
  const [docSpecialty, setDocSpecialty] = useState(doctorUser?.specialty || "General Physician");
  const [docBio, setDocBio] = useState(doctorUser?.bio || "");
  const [docFee, setDocFee] = useState(doctorUser?.consultationFee || "₹500");
  const [docHospital, setDocHospital] = useState(doctorUser?.workplaceHospital || "");
  const [docDepartment, setDocDepartment] = useState(doctorUser?.workplaceDepartment || "");
  const [docPhone, setDocPhone] = useState(doctorUser?.workplacePhone || "");
  const [docExp, setDocExp] = useState(doctorUser?.experienceYears || "");
  const [docSlots, setDocSlots] = useState((doctorUser?.slots || ["10:00 AM","11:30 AM","02:00 PM","04:30 PM"]).join(", "));
  const [profileSaving, setProfileSaving] = useState(false);

  const SPECIALTIES_LIST = ["General Physician","Cardiologist","Neurologist","Dermatologist","ENT Specialist","Orthopedic","Gastroenterologist","Pulmonologist","Gynecologist","Pediatrician","Ophthalmologist","Psychiatrist","Rheumatologist","Oncologist","Endocrinologist"];

  const handleSaveDocProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    const token = localStorage.getItem("medico_doctor_token") || doctorUser?._id || doctorUser?.id || "";
    const slotsArr = docSlots.split(",").map(s => s.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: docName, specialty: docSpecialty, bio: docBio, consultationFee: docFee, workplaceHospital: docHospital, workplaceDepartment: docDepartment, workplacePhone: docPhone, experienceYears: docExp, slots: slotsArr })
      });
      const data = await res.json();
      // Update localStorage regardless
      const stored = localStorage.getItem("medico_doctor_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const updated = { ...parsed, name: docName, specialty: docSpecialty, bio: docBio, consultationFee: docFee, workplaceHospital: docHospital, workplaceDepartment: docDepartment, workplacePhone: docPhone, experienceYears: Number(docExp), slots: slotsArr };
          localStorage.setItem("medico_doctor_user", JSON.stringify(updated));
        } catch {}
      }
      setShowEditProfile(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally { setProfileSaving(false); }
  };

  useEffect(() => {
    if (doctorSubTab) setActiveSubTab(doctorSubTab);
  }, [doctorSubTab]);

  const fetchAssignedPatients = async () => {
    setLoading(true);
    try {
      const docId = doctorUser?.id || doctorUser?._id || "";
      const docEmail = doctorUser?.email || "";
      const docName = doctorUser?.name || "";
      const res = await fetch(`/api/doctor/patients?doctorId=${encodeURIComponent(docId)}&doctorEmail=${encodeURIComponent(docEmail)}&doctorName=${encodeURIComponent(docName)}`);
      const data = await res.json();
      if (data.patients) setPatients(data.patients);
    } catch (err) {
      console.error("Error fetching doctor patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignedPatients(); }, [doctorUser]);

  /* ── Shared page wrapper ── */
  const PageWrap = ({ children }) => (
    <div className="animate-fade-in" style={{ maxWidth: "1320px", margin: "0 auto", padding: "40px 32px" }}>
      {children}
    </div>
  );

  /* ── Page header strip ── */
  const PageHeader = ({ title, subtitle, action }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "36px", flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 6px" }}>{title}</h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: 0 }}>{subtitle}</p>
      </div>
      {action}
    </div>
  );

  /* ── Empty state ── */
  const EmptyState = ({ icon, title, message }) => (
    <div style={{ padding: "80px 32px", textAlign: "center", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-lg)", backgroundColor: "rgba(51,130,114,0.1)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        {icon}
      </div>
      <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-text-heading)", marginBottom: "10px" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: "var(--color-text-muted)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>{message}</p>
    </div>
  );

  /* ──────────────── MY PATIENTS PAGE ──────────────── */
  if (activeSubTab === "my_patients") return (
    <PageWrap>
      <PageHeader
        title="My Patients"
        subtitle={`${patients.length} confirmed patient${patients.length !== 1 ? "s" : ""} assigned to your practice`}
        action={
          <button className="btn btn-outline" onClick={fetchAssignedPatients} style={{ height: "40px", fontSize: "13px", borderRadius: "var(--radius-pill)" }}>
            <RefreshCw size={14} /> Refresh Roster
          </button>
        }
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Activity size={36} color="var(--color-primary)" className="animate-spin" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontSize: "15px", color: "var(--color-text-muted)" }}>Loading patients from database...</p>
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={<Stethoscope size={30} />}
          title="No Patients Yet"
          message="When patients book an appointment with you through the Doctors Directory, their records will automatically appear here."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {patients.map(pat => (
            <div
              key={pat._id || pat.id}
              className="sage-card"
              onClick={() => setManagingPatient(pat)}
              style={{ padding: "28px", cursor: "pointer", transition: "all 200ms ease", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(51,130,114,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = ""; }}
            >
              {/* Accent bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }} />

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "50px", height: "50px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, rgba(51,130,114,0.2), rgba(51,130,114,0.06))",
                    color: "var(--color-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "800", fontSize: "20px",
                    border: "2px solid rgba(51,130,114,0.2)"
                  }}>
                    {pat.name?.charAt(0).toUpperCase() || "P"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 4px" }}>{pat.name}</h3>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                      Age {pat.age || "N/A"} &bull; Blood: <strong style={{ color: "var(--color-primary)" }}>{pat.bloodGroup || "O+"}</strong>
                    </p>
                  </div>
                </div>
                <span className="badge badge-low" style={{ fontSize: "10px", marginTop: "2px" }}>CONFIRMED</span>
              </div>

              {/* Complaint */}
              <div style={{ padding: "14px 16px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "18px" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Chief Complaint</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-heading)", lineHeight: 1.5 }}>
                  {pat.symptomComplaint || "General Triage Consultation"}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--color-text-muted)" }}>
                  <Calendar size={13} /> {pat.appointmentDate || "TBD"} at {pat.slotTime || "TBD"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "600", color: "var(--color-primary)" }}>
                  Manage <ChevronRight size={15} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {managingPatient && (
        <PatientManagementModal
          patient={managingPatient}
          doctorUser={doctorUser}
          onClose={() => setManagingPatient(null)}
          onSaved={fetchAssignedPatients}
        />
      )}
    </PageWrap>
  );

  /* ──────────────── DASHBOARD PAGE ──────────────── */
  if (activeSubTab === "dashboard") return (
    <PageWrap>
      <PageHeader
        title="Doctor Dashboard"
        subtitle={`Overview of your clinical workload, ${doctorUser?.name || "Doctor"}`}
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-primary" onClick={() => setShowEditProfile(true)} style={{ height: "40px", fontSize: "13px", borderRadius: "var(--radius-pill)" }}>
              <Edit3 size={14} /> Edit Profile
            </button>
            <button className="btn btn-outline" onClick={fetchAssignedPatients} style={{ height: "40px", fontSize: "13px", borderRadius: "var(--radius-pill)" }}>
              <RefreshCw size={14} /> Refresh Data
            </button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {[
          { label: "Total Patients", value: patients.length, sub: "Assigned to your practice", color: "var(--color-primary)", icon: <Users size={22} /> },
          { label: "Upcoming Appointments", value: patients.length, sub: "Confirmed this week", color: "#3b82f6", icon: <Calendar size={22} /> },
          { label: "Diet Plans Active", value: patients.filter(p => p.dietPlan && Object.values(p.dietPlan).some(v => v)).length, sub: "Across all patients", color: "#059669", icon: <Utensils size={22} /> },
          { label: "Active Alerts", value: patients.reduce((acc, p) => acc + (p.alerts?.length || 0), 0), sub: "Patient reminders scheduled", color: "var(--color-accent)", icon: <Bell size={22} /> },
        ].map((stat, i) => (
          <div key={i} style={{ padding: "28px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "20px", right: "20px", width: "44px", height: "44px", borderRadius: "var(--radius-md)", backgroundColor: `${stat.color}18`, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "10px" }}>{stat.label}</div>
            <div style={{ fontSize: "40px", fontWeight: "800", color: stat.color, lineHeight: 1, marginBottom: "6px" }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Doctor Profile Card */}
      <div style={{ padding: "32px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", borderLeft: "6px solid var(--color-primary)", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Physician Details</div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowEditProfile(true)} style={{ borderRadius: "var(--radius-pill)", height: "32px", fontSize: "12px" }}>
            <Edit3 size={13} /> Edit Details
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
          {[
            ["Full Name", docName || doctorUser?.name || "Dr. Aris Thorne"],
            ["Specialty", docSpecialty || doctorUser?.specialty || "General Physician"],
            ["License ID", doctorUser?.medicalLicenseId || "TN-MCI-2012-74819"],
            ["Authority", doctorUser?.medicalCouncilAuthority || "Tamil Nadu Medical Council"],
            ["Hospital", docHospital || doctorUser?.workplaceHospital || "Apollo Hospitals"],
            ["Consultation Fee", docFee || doctorUser?.consultationFee || "₹500"],
            ["Experience", docExp || doctorUser?.experienceYears ? `${docExp || doctorUser?.experienceYears} years` : "5 years"],
            ["Contact Email", doctorUser?.email || "On file"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{k}</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-heading)" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Patient Access */}
      {patients.length > 0 && (
        <div style={{ padding: "28px 32px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "20px", color: "var(--color-text-heading)" }}>Quick Patient Access</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {patients.map((pat, i) => (
              <div
                key={i}
                onClick={() => setManagingPatient(pat)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", cursor: "pointer", transition: "background-color 150ms ease" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(51,130,114,0.06)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--color-bg)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(51,130,114,0.12)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px" }}>
                    {pat.name?.charAt(0).toUpperCase() || "P"}
                  </div>
                  <div>
                    <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--color-text-heading)" }}>{pat.name}</span>
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)", marginLeft: "10px" }}>{pat.symptomComplaint || "General"}</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--color-text-muted)" />
              </div>
            ))}
          </div>
        </div>
      )}

      {managingPatient && (
        <PatientManagementModal
          patient={managingPatient}
          doctorUser={doctorUser}
          onClose={() => setManagingPatient(null)}
          onSaved={fetchAssignedPatients}
        />
      )}

      {/* DOCTOR EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div style={{ position: "fixed", top: "64px", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
          <div className="sage-card animate-fade-in" style={{ width: "100%", maxWidth: "600px", padding: "32px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Edit3 size={20} color="var(--color-primary)" />
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-text-heading)", margin: 0 }}>Edit Physician Profile</h2>
              </div>
              <button onClick={() => setShowEditProfile(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><X size={22} /></button>
            </div>

            <form onSubmit={handleSaveDocProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" required value={docName} onChange={e => setDocName(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Medical Specialty</label>
                  <select value={docSpecialty} onChange={e => setDocSpecialty(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                    {SPECIALTIES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Consultation Fee</label>
                  <input type="text" required value={docFee} onChange={e => setDocFee(e.target.value)} placeholder="e.g. ₹500" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Workplace / Hospital Name</label>
                <input type="text" required value={docHospital} onChange={e => setDocHospital(e.target.value)} placeholder="e.g. Apollo Multi-Specialty Hospital" style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Department</label>
                  <input type="text" value={docDepartment} onChange={e => setDocDepartment(e.target.value)} placeholder="e.g. Department of Internal Medicine" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Experience (Years)</label>
                  <input type="number" min="0" max="60" value={docExp} onChange={e => setDocExp(e.target.value)} placeholder="e.g. 8" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Available Slot Times (comma-separated)</label>
                <input type="text" value={docSlots} onChange={e => setDocSlots(e.target.value)} placeholder="10:00 AM, 11:30 AM, 02:00 PM, 04:30 PM" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Professional Bio &amp; Clinical Summary</label>
                <textarea rows={3} value={docBio} onChange={e => setDocBio(e.target.value)} placeholder="Board-certified specialist dedicated to patient-centered clinical care..." style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: "var(--radius-pill)", height: "44px" }} onClick={() => setShowEditProfile(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={profileSaving} style={{ flex: 1, borderRadius: "var(--radius-pill)", height: "44px" }}>
                  {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {profileSaving ? "Saving Profile..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrap>
  );

  /* ──────────────── APPOINTMENTS PAGE ──────────────── */
  if (activeSubTab === "appointments") return (
    <PageWrap>
      <PageHeader
        title="Appointments &amp; Schedule"
        subtitle="All confirmed patient consultations and booked time slots"
        action={
          <button className="btn btn-outline" onClick={fetchAssignedPatients} style={{ height: "40px", fontSize: "13px", borderRadius: "var(--radius-pill)" }}>
            <RefreshCw size={14} /> Sync Schedule
          </button>
        }
      />

      {patients.length === 0 ? (
        <EmptyState
          icon={<Calendar size={30} />}
          title="No Appointments Scheduled"
          message="Confirmed patient appointments will appear here once patients book a slot through the Doctors Directory."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {patients.map((pat, idx) => (
            <div
              key={idx}
              onClick={() => setManagingPatient(pat)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "24px 28px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                transition: "all 180ms ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(51,130,114,0.04)"; e.currentTarget.style.borderColor = "rgba(51,130,114,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(51,130,114,0.12)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px" }}>
                  {pat.name?.charAt(0).toUpperCase() || "P"}
                </div>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 5px" }}>{pat.name}</h4>
                  <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>{pat.symptomComplaint || "General Checkup"}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-heading)" }}>{pat.slotTime || "TBD"}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{pat.appointmentDate || "Date TBD"}</div>
                </div>
                <span className="badge badge-primary" style={{ fontSize: "12px" }}>CONFIRMED</span>
                <ChevronRight size={16} color="var(--color-text-muted)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {managingPatient && (
        <PatientManagementModal
          patient={managingPatient}
          doctorUser={doctorUser}
          onClose={() => setManagingPatient(null)}
          onSaved={fetchAssignedPatients}
        />
      )}
    </PageWrap>
  );

  return null;
}
