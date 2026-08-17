import React, { useState, useEffect } from "react";
import { MessageSquare, Stethoscope, Calendar, Clock, Pill, Sparkles, Building2, CheckCircle2, ChevronRight, FileText, User, RefreshCw, X, Download, ShieldCheck, Loader2 } from "lucide-react";

export function ConsultationHistoryTab({ onNavigateToDoctors }) {
  const [consultations, setConsultations] = useState([]);
  const [historyFiles, setHistoryFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [aiSummary, setAiSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [viewTxtFile, setViewTxtFile] = useState(null);

  const fetchConsultationHistory = async () => {
    setLoading(true);
    try {
      const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://temporary-rushing-cello-v2ffgse.vercel.app';
      const token = localStorage.getItem("medico_token");
      const [resConsult, resFiles] = await Promise.all([
        fetch(`${API_BASE}/api/patient/consultations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/patient/medical-history-files`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const contentTypeConsult = resConsult.headers.get("content-type") || "";
      const contentTypeFiles = resFiles.headers.get("content-type") || "";
      const dataConsult = (resConsult.ok && contentTypeConsult.includes("application/json")) ? await resConsult.json() : {};
      const dataFiles = (resFiles.ok && contentTypeFiles.includes("application/json")) ? await resFiles.json() : {};

      setConsultations(dataConsult.consultations || []);
      setHistoryFiles(dataFiles.files || []);

      if (dataConsult.consultations?.length > 0) {
        setExpandedId(dataConsult.consultations[0].id);
      }
    } catch (err) {
      console.error("Fetch consultation history error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSummarize = async () => {
    setSummarizing(true);
    try {
      const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://temporary-rushing-cello-v2ffgse.vercel.app';
      const token = localStorage.getItem("medico_token");
      const res = await fetch(`${API_BASE}/api/ai/summarize-medical-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId: token })
      });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setAiSummary(data);
      }
    } catch (e) {
      alert("Failed to generate AI summary.");
    } finally {
      setSummarizing(false);
    }
  };

  useEffect(() => {
    fetchConsultationHistory();
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1040px", margin: "0 auto", padding: "30px 24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(0, 81, 195, 0.08)",
            color: "var(--color-primary)",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "8px",
            border: "1px solid rgba(0, 81, 195, 0.2)"
          }}>
            <MessageSquare size={14} />
            Patient Consultation History & Medical .txt Records
          </div>

          <h1 className="display-title" style={{ fontSize: "32px", fontWeight: "300", color: "var(--color-text-heading)", margin: "4px 0" }}>
            Past Consultations & Medical History Files
          </h1>
          
          <p className="body-text" style={{ color: "var(--color-text-muted)", maxWidth: "620px" }}>
            Review past doctor consultations, official clinical notes, saved .txt medical records, prescribed medicines, and customized 7-day diet plans.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAiSummarize}
          disabled={summarizing}
          className="btn btn-primary"
          style={{ padding: "10px 20px" }}
        >
          {summarizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {summarizing ? "AI Summarizing..." : "AI Summarize Medical History"}
        </button>
      </div>

      {/* AI Executive Summary Box */}
      {aiSummary && (
        <div className="sage-card animate-fade-in" style={{ padding: "26px", marginBottom: "30px", backgroundColor: "#f0f4fb", border: "1.5px solid rgba(0, 81, 195, 0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", fontWeight: "700", fontSize: "16px", marginBottom: "10px" }}>
            <Sparkles size={20} /> AI Clinical Medical History Executive Summary
          </div>
          <p className="body-text" style={{ fontSize: "14px", color: "var(--color-text-heading)", lineHeight: "1.6", marginBottom: "16px" }}>
            {aiSummary.executive_summary}
          </p>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "13px" }}>
            <div><strong style={{ color: "var(--color-text-muted)" }}>Risk Assessment:</strong> <span className="badge badge-primary">{aiSummary.risk_overview || "LOW RISK"}</span></div>
            <div><strong style={{ color: "var(--color-text-muted)" }}>Active Conditions:</strong> {(aiSummary.identified_conditions || []).join(", ") || "None"}</div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
          <p>Retrieving your clinical consultation records from database...</p>
        </div>
      )}

      {/* Saved .txt Medical History Files Grid */}
      {!loading && historyFiles.length > 0 && (
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <FileText size={20} color="var(--color-primary)" />
            <h2 className="heading-title" style={{ fontSize: "20px", fontWeight: "600" }}>
              Saved Clinical .txt Record Files ({historyFiles.length})
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {historyFiles.map((file) => (
              <div key={file.id} className="sage-card" style={{ padding: "20px", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <FileText size={18} color="var(--color-primary)" />
                    <strong style={{ fontSize: "14px", color: "var(--color-text-heading)", wordBreak: "break-all" }}>{file.fileName}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "10px" }}>
                    Date: <strong>{file.date}</strong> &bull; Doctor: <strong>{file.doctorName}</strong> ({file.specialty})
                  </div>
                  <div style={{ padding: "10px 12px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)", fontSize: "12px", border: "1px solid var(--color-border)", marginBottom: "14px" }}>
                    <strong>Problem Stated:</strong> "{file.problemStated}"
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setViewTxtFile(file)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <FileText size={14} /> View & Download .txt File
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TXT FILE CONTENT VIEWER MODAL */}
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
                <Download size={14} /> Download .txt Record File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && consultations.length === 0 && historyFiles.length === 0 && (
        <div className="sage-card" style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "#ffffff" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(0, 81, 195, 0.08)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Stethoscope size={28} />
          </div>
          <h3 className="heading-title" style={{ fontSize: "20px", marginBottom: "8px" }}>No Past Consultations Found</h3>
          <p className="body-text" style={{ color: "var(--color-text-muted)", maxWidth: "460px", margin: "0 auto 24px" }}>
            You haven't completed any doctor consultations yet. Book a consultation with board-certified physicians to receive verified clinical care.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigateToDoctors && onNavigateToDoctors("All")}>
            <Stethoscope size={16} /> Book New Doctor Consultation
          </button>
        </div>
      )}

      {/* Consultation Record Cards */}
      {!loading && consultations.length > 0 && (
        <div>
          <h2 className="heading-title" style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
            Past Consultations Timeline ({consultations.length})
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {consultations.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="sage-card animate-fade-in"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-border)",
                    borderLeft: isExpanded ? "4px solid var(--color-primary)" : "1px solid var(--color-border)",
                    padding: "24px"
                  }}
                >
                  {/* Consultation Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <div style={{
                        width: "52px", height: "52px", borderRadius: "var(--radius-md)",
                        backgroundColor: "rgba(0, 81, 195, 0.1)", color: "var(--color-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "18px"
                      }}>
                        {item.doctorName ? item.doctorName.split(' ').slice(0, 2).map(n => n[0]).join('') : "DR"}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h3 className="heading-title" style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-text-heading)" }}>
                            {item.doctorName}
                          </h3>
                          <span className="badge badge-primary" style={{ fontSize: "11px" }}>
                            {item.specialty}
                          </span>
                        </div>
                        <p className="body-text" style={{ fontSize: "13px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <Building2 size={13} /> {item.workplaceHospital}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <span className="badge badge-success" style={{ fontSize: "11px" }}>
                        <CheckCircle2 size={12} /> {item.status || "CONFIRMED"}
                      </span>
                      <div style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={13} /> {item.appointmentDate}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={13} /> {item.slotTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Complaint Summary */}
                  <div style={{ padding: "12px 16px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)", marginBottom: "16px", border: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                      Chief Problem Stated / Complaint:
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--color-text-heading)", fontWeight: "500" }}>
                      "{item.symptomComplaint}"
                    </span>
                  </div>

                  {/* Doctor Clinical Notes */}
                  <div style={{ padding: "16px", backgroundColor: "#f0f4fb", borderRadius: "var(--radius-sm)", border: "1px solid rgba(0, 81, 195, 0.15)", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                      <FileText size={15} /> Attending Doctor Clinical Notes & Directions:
                    </div>
                    <p className="body-text" style={{ fontSize: "13px", color: "var(--color-text)", margin: 0, lineHeight: "1.6" }}>
                      {item.doctorNotes}
                    </p>
                  </div>

                  {/* Prescribed Medications Section */}
                  {item.prescriptions && item.prescriptions.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-heading)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                        <Pill size={14} color="var(--color-primary)" /> Prescribed Medications ({item.prescriptions.length}):
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
                        {item.prescriptions.map((p, pIdx) => (
                          <div key={pIdx} style={{ padding: "12px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                            <strong style={{ fontSize: "13px", color: "var(--color-primary)", display: "block" }}>{p.medicineName} ({p.dosage})</strong>
                            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginTop: "2px" }}>
                              ⏰ Frequency: {p.timeDose} • Duration: {p.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7-Day Diet Plan Preview */}
                  {item.weeklyDietPlan && (
                    <div style={{ padding: "14px", backgroundColor: "#f6fbf7", borderRadius: "var(--radius-sm)", border: "1px solid #ceead6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#137333", fontWeight: "600", fontSize: "12px", marginBottom: "6px" }}>
                        <Sparkles size={14} /> Prescribed 7-Day Weekly Diet Plan Active
                      </div>
                      <span style={{ fontSize: "12px", color: "#137333" }}>
                        Monday Sample: {item.weeklyDietPlan.Monday}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
