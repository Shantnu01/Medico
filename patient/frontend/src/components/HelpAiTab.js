import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Stethoscope, ArrowRight, MapPin, HelpCircle, Flame, ShieldCheck, HeartPulse, Award, Lock } from "lucide-react";

export function HelpAiTab({ onNavigateToDoctors, userLocation = "Chennai, India" }) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  
  // Regional common diseases state
  const [regionalDiseases, setRegionalDiseases] = useState([]);

  const sampleQueries = [
    { label: "Throbbing Headache & Fever", text: "I have a throbbing headache and mild fever" },
    { label: "Arm Pain & Swelling", text: "I have a hurting arm and swollen arm after exercise" },
    { label: "Stomach Cramps & Vomiting", text: "I am throwing up and having loose motion" },
    { label: "Ringing in Ear & Dizziness", text: "ringing sound in my ears and dizziness" },
    { label: "Sharp Heel Pain", text: "sharp heel pain while walking in the morning" }
  ];

  useEffect(() => {
    async function fetchRegionalDiseases() {
      try {
        const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://temporary-rushing-cello-v2ffgse.vercel.app';
        const res = await fetch(`${API_BASE}/api/regional-diseases?location=${encodeURIComponent(userLocation)}`);
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.common_diseases && Array.isArray(data.common_diseases)) {
            setRegionalDiseases(data.common_diseases);
          }
        }
      } catch (err) {
        console.error("Failed to fetch regional diseases:", err);
      }
    }
    fetchRegionalDiseases();
  }, [userLocation]);

  const handlePredict = async (textToPredict, expectedDisease = "") => {
    const queryText = textToPredict || inputText;
    if (!queryText.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://temporary-rushing-cello-v2ffgse.vercel.app';
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: queryText, 
          location: userLocation,
          expected_disease: expectedDisease 
        })
      });

      const contentType = res.headers.get("content-type") || "";
      let data = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        await res.text();
        throw new Error(`AI prediction server returned status ${res.status}. Please check backend server connection.`);
      }

      if (!res.ok) {
        throw new Error(data.detail?.message || data.error || "Failed to analyze symptoms.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRegionalCard = (diseaseCard) => {
    setInputText(diseaseCard.sample_query);
    handlePredict(diseaseCard.sample_query, diseaseCard.name);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1040px", margin: "0 auto", padding: "30px 24px" }}>
      {/* Branded Page Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
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
          marginBottom: "12px",
          border: "1px solid rgba(0, 81, 195, 0.2)"
        }}>
          <ShieldCheck size={14} />
          Medico Clinical Assessment & Triage System
        </div>

        <h1 className="display-title" style={{ fontSize: "36px", fontWeight: "300", color: "var(--color-text-heading)", marginBottom: "8px" }}>
          Symptom Triage & Care Pathway Assessment
        </h1>
        
        <p className="body-text" style={{ color: "var(--color-text-muted)", maxWidth: "660px", margin: "0 auto" }}>
          Describe what you are experiencing in plain language. Receive instant clinical assessment, safe home care protocols, and specialist doctor recommendations tailored to <strong>{userLocation}</strong>.
        </p>

        {/* Clinical Trust Badges */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "14px", fontSize: "12px", color: "var(--color-text-muted)", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Lock size={13} color="var(--color-primary)" /> HIPAA & ISO 27001 Protection
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Award size={13} color="var(--color-primary)" /> 450+ Partner Hospitals
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={13} color="var(--color-primary)" /> Location: <strong>{userLocation}</strong>
          </span>
        </div>
      </div>

      {/* Input Box Card */}
      <div className="sage-card" style={{ padding: "28px", marginBottom: "30px", backgroundColor: "#ffffff" }}>
        <form onSubmit={(e) => { e.preventDefault(); handlePredict(); }}>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-heading)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Enter Patient Symptoms & Medical Complaints:
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe your symptoms in detail (e.g. 'I have had a throbbing headache since morning with mild fever', 'hurting arm and swollen arm after exercise')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                fontSize: "13px",
                fontFamily: "var(--font-stack)",
                outline: "none",
                resize: "none",
                transition: "all 0.15s ease",
                backgroundColor: "var(--color-bg)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-primary)";
                e.target.style.boxShadow = "0 0 0 3px rgba(0, 81, 195, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            {/* Quick Sample Query Chips */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "600" }}>Common symptoms:</span>
              {sampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setInputText(q.text); handlePredict(q.text); }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    fontSize: "11px",
                    cursor: "pointer",
                    color: "var(--color-text)",
                    fontWeight: "500"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-surface-hover)";
                    e.currentTarget.style.borderColor = "#d4d4d4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-surface)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: "10px 24px" }}
            >
              <HeartPulse size={16} />
              {loading ? "Evaluating..." : "Run Clinical Assessment"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={{
          padding: "14px 18px",
          backgroundColor: "#fce8e6",
          color: "#c5221f",
          borderRadius: "var(--radius-sm)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "13px",
          border: "1px solid #fad2cf"
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Diagnostic Results Container */}
      {result && (
        result.is_medical === false || result.prediction === "Non-Medical Query Detected" ? (
          <div className="sage-card animate-fade-in" style={{ padding: "28px", marginBottom: "40px", backgroundColor: "#fef7e0", border: "1px solid #feefc3" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#b06000", fontWeight: "600", fontSize: "16px", marginBottom: "8px" }}>
              <ShieldAlert size={22} />
              Non-Medical Input Detected
            </div>
            <p className="body-text" style={{ color: "#7a4300", marginBottom: "16px", lineHeight: "1.5" }}>
              {result.safety_warning || "Medico AI Clinical Triage is designed exclusively for evaluating physical and mental health symptoms. Please enter your medical complaint or select a common symptom below."}
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#7a4300" }}>Try checking common symptoms:</span>
              {sampleQueries.slice(0, 3).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setInputText(q.text); handlePredict(q.text); }}
                  className="btn btn-outline btn-sm"
                  style={{ backgroundColor: "#ffffff", borderColor: "#feefc3", color: "#7a4300", fontSize: "12px" }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
        <div className="sage-card animate-fade-in" style={{ padding: "30px", marginBottom: "40px", backgroundColor: "#ffffff" }}>
          
          {/* Top Assessment Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "20px",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "2px" }}>
                <ShieldCheck size={15} />
                Clinical Triage Evaluation Complete
              </div>
              <h2 className="heading-title" style={{ fontSize: "28px", fontWeight: "300", color: "var(--color-text-heading)" }}>
                {result.prediction}
              </h2>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", fontWeight: "600", textTransform: "uppercase" }}>Severity Rating</span>
              <span className={`badge badge-${(result.disease_severity_risk || "MEDIUM").toLowerCase()}`} style={{ fontSize: "12px", marginTop: "2px" }}>
                {result.disease_severity_risk || "MEDIUM"} RISK
              </span>
            </div>
          </div>

          {/* Regional Epidemiological Prior Applied */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            backgroundColor: "rgba(0, 81, 195, 0.06)",
            border: "1px solid rgba(0, 81, 195, 0.15)",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            marginBottom: "24px",
            color: "var(--color-primary)"
          }}>
            <MapPin size={15} />
            <span>
              <strong>Regional Epidemiology Prior:</strong> Calibrated against vectors in <strong>{userLocation}</strong>
            </span>
          </div>

          {/* UNMAPPED PRESENTATION SPECIALIST ADVISORY CARD */}
          {result.is_unmapped_presentation ? (
            <div style={{
              padding: "22px",
              backgroundColor: "#fef7e0",
              border: "1px solid #feefc3",
              borderRadius: "var(--radius-sm)",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b06000", fontWeight: "600", fontSize: "15px", marginBottom: "8px" }}>
                <HelpCircle size={20} />
                Specialist Consultation Advisory
              </div>
              <p className="body-text" style={{ color: "#7a4300", marginBottom: "18px" }}>
                {result.safety_warning}
              </p>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #feefc3",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    Recommended Medical Specialist
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--color-text-heading)", marginTop: "2px" }}>
                    {result.recommended_specialist}
                  </h3>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => onNavigateToDoctors && onNavigateToDoctors(result.recommended_specialist)}
                  style={{ padding: "8px 18px" }}
                >
                  <Stethoscope size={15} />
                  Book Consult with {result.recommended_specialist}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* RECOMMENDED SPECIALIST DOCTOR CARD */}
              <div style={{
                padding: "22px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: "600", textTransform: "uppercase" }}>
                    Recommended Care Pathway
                  </span>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-text-heading)", marginTop: "2px" }}>
                    Consult {result.recommended_specialist || "General Physician"}
                  </h3>
                  <p className="body-text" style={{ color: "var(--color-text-muted)", marginTop: "2px" }}>
                    Clinical assessment recommends consulting a board-certified specialist in {result.recommended_specialist || "General Practice"}.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => onNavigateToDoctors && onNavigateToDoctors(result.recommended_specialist || "All")}
                  style={{ padding: "9px 20px" }}
                >
                  <Stethoscope size={16} />
                  Find Nearest {result.recommended_specialist || "Doctor"}
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Matched Symptoms Section */}
              {result.matched_symptoms?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "10px", color: "var(--color-text-heading)", textTransform: "uppercase" }}>
                    Detected Symptom Observations ({result.matched_symptoms.length}):
                  </span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {result.matched_symptoms.map((m, i) => (
                      <div key={i} style={{
                        padding: "5px 12px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text)",
                        fontSize: "12px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        border: "1px solid var(--color-border)"
                      }}>
                        <CheckCircle2 size={13} color="var(--color-primary)" />
                        <span>"{m.matched_phrase}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment Protocol Box */}
              {result.can_give_medication ? (
                <div style={{
                  padding: "20px",
                  backgroundColor: "#e6f4ea",
                  border: "1px solid #ceead6",
                  borderRadius: "var(--radius-sm)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#137333", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>
                    <ShieldCheck size={18} />
                    Verified Home Treatment & OTC Protocol
                  </div>
                  <p className="body-text" style={{ color: "#137333" }}>
                    {result.medication_recommendation}
                  </p>
                </div>
              ) : (
                <div style={{
                  padding: "20px",
                  backgroundColor: "#fce8e6",
                  border: "1px solid #fad2cf",
                  borderRadius: "var(--radius-sm)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c5221f", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>
                    <ShieldAlert size={18} />
                    Clinical Safety Notice: Doctor Consultation Required
                  </div>
                  <p className="body-text" style={{ color: "#c5221f", marginBottom: "14px" }}>
                    {result.safety_warning}
                  </p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => onNavigateToDoctors && onNavigateToDoctors(result.recommended_specialist || "All")}
                  >
                    <Stethoscope size={14} />
                    Consult {result.recommended_specialist || "Doctor"} Now
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        )
      )}

      {/* REGIONAL COMMON DISEASES SECTION */}
      <div style={{ marginTop: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c5221f", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>
              <Flame size={14} />
              Regional Health Outbreak Tracker
            </div>
            <h2 className="heading-title" style={{ fontSize: "24px", fontWeight: "300", color: "var(--color-text-heading)", marginTop: "2px" }}>
              Prevalent Health Outbreaks in {userLocation}
            </h2>
          </div>

          <div style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
            <MapPin size={14} color="var(--color-primary)" />
            <span>Region: <strong>{userLocation}</strong></span>
          </div>
        </div>

        <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
          Conditions showing elevated seasonal incidence reported by local public health monitoring. Select any card to run an instant clinical triage check and view verified treatment pathways.
        </p>

        {/* Disease Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: "18px"
        }}>
          {regionalDiseases.map((card) => (
            <div
              key={card.id}
              className="sage-card"
              style={{
                padding: "22px",
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer"
              }}
              onClick={() => handleSelectRegionalCard(card)}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ fontSize: "28px" }}>{card.icon}</span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: card.risk_level === "HIGH" ? "#fce8e6" : "#fef7e0",
                    color: card.risk_level === "HIGH" ? "#c5221f" : "#b06000",
                    border: card.risk_level === "HIGH" ? "1px solid #fad2cf" : "1px solid #feefc3"
                  }}>
                    {card.prevalence_badge}
                  </span>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--color-text-heading)", marginBottom: "4px" }}>
                  {card.name}
                </h3>
                
                <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "14px" }}>
                  {card.description}
                </p>

                <div style={{
                  padding: "10px 12px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  color: "var(--color-text)",
                  marginBottom: "18px",
                  border: "1px solid var(--color-border)"
                }}>
                  <strong style={{ display: "block", color: "var(--color-text-muted)", fontSize: "10px", textTransform: "uppercase", marginBottom: "2px" }}>
                    Common Symptoms:
                  </strong>
                  {card.symptoms_preview}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{
                  width: "100%",
                  justifyContent: "center"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRegionalCard(card);
                }}
              >
                <span>Check Care Pathway</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
