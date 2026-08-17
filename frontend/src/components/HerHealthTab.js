import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Calendar, Sparkles, Activity, Stethoscope,
  AlertTriangle, CheckCircle2, ChevronRight, RefreshCw,
  Send, Loader2, FileText, ShieldCheck, ArrowRight,
  HelpCircle, User, Bell, TrendingUp, Zap, X
} from "lucide-react";

/* ─── Medico Design tokens ─────────────────────────────────────
   All colours come from our existing CSS custom-property set.
   The only addition: a rose blush used sparingly as a secondary
   accent inside the Women's Wellness section to distinguish it
   from the general portal without breaking brand consistency.
──────────────────────────────────────────────────────────────── */
const ROSE = "#c2476e";            // warm rose – used as a subtle accent
const ROSE_LIGHT = "rgba(194,71,110,0.08)";
const ROSE_BORDER = "rgba(194,71,110,0.22)";
const ROSE_BADGE_BG = "rgba(194,71,110,0.10)";

const SYMPTOM_OPTIONS = [
  "Abdominal / Pelvic Cramps",
  "Bloating",
  "Headache or Migraine",
  "Mood Changes / Irritability",
  "Fatigue / Low Energy",
  "Breast Tenderness",
  "Acne Flare-Up",
  "Lower Back Ache",
  "Irregular Spotting",
  "Nausea"
];

const AGENTS = [
  {
    key: "cycle",
    label: "Cycle & Ovulation Adviser",
    desc: "Period timing, fertile window, phase guidance",
    icon: <Calendar size={16} />,
    scope: "menstrual cycle analysis, period prediction, ovulation, luteal/follicular phase guidance"
  },
  {
    key: "symptom",
    label: "Symptom Pattern Analyst",
    desc: "PMS, cramps, PCOS symptom interpretation",
    icon: <Activity size={16} />,
    scope: "PMS, PMDD, dysmenorrhea, PCOS and PCOD symptom patterns, hormonal imbalance signs"
  },
  {
    key: "nutrition",
    label: "Hormonal Nutrition Coach",
    desc: "Anti-inflammatory, hormone-balancing meals",
    icon: <Sparkles size={16} />,
    scope: "nutrition for hormonal balance, anti-inflammatory foods, iron-rich meals for menstruation, PCOS diet"
  },
  {
    key: "mood",
    label: "Mood & Cycle Wellness",
    desc: "Progesterone-related mood, sleep, stress",
    icon: <Heart size={16} />,
    scope: "premenstrual mood shifts, stress impact on cycles, mindfulness, breathing techniques, sleep for hormonal health"
  },
  {
    key: "prep",
    label: "Gynaecology Visit Prep",
    desc: "Symptom summary for doctor appointments",
    icon: <FileText size={16} />,
    scope: "structuring symptom history for gynaecologist visits, what to expect from pelvic exams, hormonal blood tests, ultrasound for PCOS"
  }
];

/* ─── Phase indicator ─────────────────────────────────────── */
function calculateCurrentPhase(lastStartDate, cycleLength) {
  if (!lastStartDate) return null;
  const today = new Date();
  const start = new Date(lastStartDate);
  const dayOfCycle = Math.round((today - start) / 86400000) + 1;
  if (dayOfCycle < 1) return null;

  if (dayOfCycle <= 5) return { phase: "Menstrual", day: dayOfCycle, color: ROSE, desc: "Your period phase. Rest, hydrate, and use warmth for cramp relief." };
  if (dayOfCycle <= 13) return { phase: "Follicular", day: dayOfCycle, color: "var(--color-primary)", desc: "Oestrogen rising. Energy and focus tend to be higher — good time for activity." };
  if (dayOfCycle <= 16) return { phase: "Ovulatory", day: dayOfCycle, color: "#88690c", desc: "Peak fertile window. Oestrogen at its highest; mood and energy peak." };
  if (dayOfCycle <= cycleLength) return { phase: "Luteal", day: dayOfCycle, color: "#7c3aed", desc: "Progesterone rises. PMS symptoms may begin. Gentle exercise and magnesium-rich food help." };
  return { phase: "Late Cycle", day: dayOfCycle, color: "var(--color-text-muted)", desc: "Period expected soon. Track your next start date." };
}

/* ─── Main Component ───────────────────────────────────────── */
export function HerHealthTab({ user, onNavigateToDoctors }) {
  const isFemale = user?.gender?.toLowerCase() === "female";
  const [subTab, setSubTab] = useState("cycle"); // cycle | pcos | copilot

  /* Cycle Logger */
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [flow, setFlow] = useState("Medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [cycleNotes, setCycleNotes] = useState("");
  const [savingLog, setSavingLog] = useState(false);
  const [logs, setLogs] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  /* PCOS Screener */
  const [irregularCycles, setIrregularCycles] = useState(false);
  const [acneSeverity, setAcneSeverity] = useState("None");
  const [hairGrowth, setHairGrowth] = useState(false);
  const [weightFluctuations, setWeightFluctuations] = useState(false);
  const [moodSwings, setMoodSwings] = useState(false);
  const [screeningResult, setScreeningResult] = useState(null);
  const [runningScreen, setRunningScreen] = useState(false);

  /* AI Copilot */
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome! I am Medico's Women's Wellness assistant. I can help you understand your cycle, interpret PCOS symptoms, suggest nutrition for hormonal health, and help you prepare for your gynaecologist visit. What would you like to know?"
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /* ─── Fetch existing data ─────────────── */
  const fetchCycleData = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem("medico_token");
      const res = await fetch("/api/patient/cycle-log", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setPrediction(data.prediction || null);
      if (data.pcosScreening) setScreeningResult(data.pcosScreening);
      if (data.logs?.length > 0) {
        setCurrentPhase(calculateCurrentPhase(data.logs[0].startDate, data.logs[0].cycleLength));
      }
    } catch (e) {
      console.error("HerHealth fetchCycleData error:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isFemale) fetchCycleData();
  }, [isFemale]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ─── Handlers ────────────────────────── */
  const toggleSymptom = (s) => setSelectedSymptoms(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  const handleSaveCycleLog = async (e) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      const token = localStorage.getItem("medico_token");
      const res = await fetch("/api/patient/cycle-log", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          startDate, cycleLength: Number(cycleLength),
          periodDuration: Number(periodDuration), flow, symptoms: selectedSymptoms, notes: cycleNotes
        })
      });
      const data = await res.json();
      if (data.log) {
        setLogs(prev => [data.log, ...prev]);
        setPrediction(data.prediction);
        setCurrentPhase(calculateCurrentPhase(startDate, cycleLength));
        setSelectedSymptoms([]);
        setCycleNotes("");
      }
    } catch {
      alert("Could not save cycle log. Please try again.");
    } finally {
      setSavingLog(false);
    }
  };

  const handlePcosScreening = async (e) => {
    e.preventDefault();
    setRunningScreen(true);
    try {
      const token = localStorage.getItem("medico_token");
      const res = await fetch("/api/patient/pcos-screening", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ irregularCycles, acneSeverity, hairGrowth, weightFluctuations, moodSwings, symptomsList: selectedSymptoms })
      });
      const data = await res.json();
      if (data.screening) setScreeningResult(data.screening);
    } catch {
      alert("Screening failed. Please check your connection.");
    } finally {
      setRunningScreen(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    setChatInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/herhealth-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: activeAgent.label,
          agentScope: activeAgent.scope,
          prompt: text,
          patientContext: `Patient: ${user?.name}, Age: ${user?.age || "adult"}, Last period start: ${logs[0]?.startDate || startDate}, Typical cycle: ${cycleLength} days.`
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ─── Female-only guardrail ───────────── */
  if (!isFemale) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: "680px", margin: "60px auto", padding: "30px 24px" }}>
        <div className="sage-card" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            backgroundColor: ROSE_LIGHT, color: ROSE,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
          }}>
            <Heart size={28} />
          </div>
          <h2 className="heading-title" style={{ fontSize: "20px", marginBottom: "10px" }}>Women's Wellness Portal</h2>
          <p className="body-text" style={{ color: "var(--color-text-muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
            This section is tailored exclusively for female patients to track menstrual cycles, monitor PCOS risk indicators, and consult Gynaecology specialists.
          </p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "24px", padding: "10px 14px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
            Your profile has gender set to <strong>"{user?.gender || "Not specified"}"</strong>. Update your profile if this is incorrect.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigateToDoctors("Gynecologist")}>
            <Stethoscope size={16} /> Browse Gynaecologist Specialists
          </button>
        </div>
      </div>
    );
  }

  /* ─── Shared label component ─────────── */
  const Label = ({ children }) => (
    <span style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "5px" }}>
      {children}
    </span>
  );

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--color-border)",
    fontSize: "13.5px",
    backgroundColor: "var(--color-input-bg)",
    color: "var(--color-text-heading)",
    outline: "none"
  };

  /* ─── Phase indicator display ─────────── */
  const phaseBar = currentPhase && (
    <div className="sage-card animate-fade-in" style={{ padding: "18px 22px", marginBottom: "24px", borderLeft: `4px solid ${currentPhase.color}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: currentPhase.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>Current Cycle Phase</span>
          <span className="badge" style={{ backgroundColor: `${currentPhase.color}15`, color: currentPhase.color, border: `1px solid ${currentPhase.color}30`, fontSize: "11px" }}>
            Day {currentPhase.day}
          </span>
        </div>
        <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--color-text-heading)", margin: 0 }}>{currentPhase.phase} Phase</h3>
        <p className="body-text" style={{ fontSize: "12.5px", color: "var(--color-text-muted)", margin: "3px 0 0" }}>{currentPhase.desc}</p>
      </div>
      <button className="btn btn-outline btn-sm" onClick={() => onNavigateToDoctors("Gynecologist")} style={{ flexShrink: 0 }}>
        <Stethoscope size={13} /> Consult Gynaecologist
      </button>
    </div>
  );

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <div className="animate-fade-in" style={{ maxWidth: "1080px", margin: "0 auto", padding: "30px 24px" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "4px 14px", borderRadius: "var(--radius-sm)",
          backgroundColor: ROSE_BADGE_BG, color: ROSE,
          fontSize: "12px", fontWeight: "700", marginBottom: "10px",
          border: `1px solid ${ROSE_BORDER}`
        }}>
          <ShieldCheck size={13} /> Medico Women's Wellness — Cycle & Hormonal Health
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="display-title" style={{ fontSize: "34px", fontWeight: "300", marginBottom: "6px" }}>
              Cycle Tracking & Women's Health
            </h1>
            <p className="body-text" style={{ color: "var(--color-text-muted)", maxWidth: "580px" }}>
              Log your periods, predict upcoming cycles, screen for PCOS markers, and consult AI-guided hormonal wellness advice — all from your Medico health portal.
            </p>
          </div>
          <button
            className="btn btn-outline"
            onClick={fetchCycleData}
            style={{ flexShrink: 0, gap: "6px" }}
            title="Refresh data from server"
          >
            <RefreshCw size={14} className={loadingData ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Sub-Nav Tabs (matches Medico pill style from Navbar) ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "2px" }}>
        {[
          { key: "cycle", label: "Cycle Tracker", icon: <Calendar size={14} /> },
          { key: "pcos", label: "PCOS Risk Screener", icon: <Activity size={14} /> },
          { key: "copilot", label: "AI Wellness Copilot", icon: <Sparkles size={14} /> }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`btn btn-sm ${subTab === t.key ? "btn-primary" : "btn-outline"}`}
            style={{ borderRadius: "var(--radius-pill)", height: "34px", fontSize: "12px", flexShrink: 0 }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════
          1. CYCLE TRACKER & OVULATION
      ════════════════════════════════════ */}
      {subTab === "cycle" && (
        <div>
          {/* Current phase indicator */}
          {phaseBar}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px" }}>

            {/* ─ Log Form ─ */}
            <div className="sage-card" style={{ padding: "26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: ROSE_LIGHT, color: ROSE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="heading-title" style={{ fontSize: "16px", fontWeight: "600" }}>Log Period Start</h3>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Record each new cycle accurately for better predictions</span>
                </div>
              </div>

              <form onSubmit={handleSaveCycleLog} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <Label>Period Start Date *</Label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <Label>Cycle Length (days)</Label>
                    <input type="number" min="20" max="45" value={cycleLength} onChange={e => setCycleLength(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <Label>Period Duration (days)</Label>
                    <input type="number" min="2" max="10" value={periodDuration} onChange={e => setPeriodDuration(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <Label>Flow Intensity</Label>
                  <select value={flow} onChange={e => setFlow(e.target.value)} style={inputStyle}>
                    {["Light", "Medium", "Heavy", "Spotting"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Symptoms Experienced</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {SYMPTOM_OPTIONS.map(s => {
                      const sel = selectedSymptoms.includes(s);
                      return (
                        <button
                          key={s} type="button"
                          onClick={() => toggleSymptom(s)}
                          style={{
                            padding: "4px 10px", borderRadius: "var(--radius-pill)", fontSize: "11px", cursor: "pointer",
                            border: sel ? `1px solid ${ROSE}` : "1px solid var(--color-border)",
                            backgroundColor: sel ? ROSE_BADGE_BG : "var(--color-surface)",
                            color: sel ? ROSE : "var(--color-text-muted)",
                            transition: "all 150ms ease"
                          }}
                        >{s}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Personal Notes</Label>
                  <textarea rows={2} value={cycleNotes} onChange={e => setCycleNotes(e.target.value)} placeholder="Any observations you'd like to record..." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={savingLog}>
                  {savingLog ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {savingLog ? "Saving..." : "Save Cycle Log & Update Predictions"}
                </button>
              </form>
            </div>

            {/* ─ Predictions Panel ─ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Prediction cards */}
              {prediction ? (
                <div className="sage-card" style={{ padding: "24px" }}>
                  <h3 className="heading-title" style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
                    Cycle Predictions
                  </h3>

                  {[
                    { label: "Next Expected Period", value: prediction.nextPeriodDate, accent: ROSE, icon: <Calendar size={15} /> },
                    { label: "Estimated Ovulation", value: prediction.ovulationDate, accent: "var(--color-primary)", icon: <TrendingUp size={15} /> },
                    { label: "Peak Fertile Window", value: prediction.fertileWindow, accent: "var(--color-accent)", icon: <Zap size={15} /> }
                  ].map(p => (
                    <div key={p.label} style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)", marginBottom: "10px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)", backgroundColor: `${p.accent}15`, color: p.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {p.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{p.label}</div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-text-heading)" }}>{p.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sage-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                  <Calendar size={30} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                  <p className="body-text" style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                    Log your first period start date on the left to generate cycle, ovulation, and fertility predictions.
                  </p>
                </div>
              )}

              {/* Gynaecologist CTA card */}
              <div className="sage-card" style={{ padding: "20px", border: `1px solid ${ROSE_BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-md)", backgroundColor: ROSE_LIGHT, color: ROSE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-heading)", margin: 0 }}>Experiencing Period Irregularities?</h4>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "2px 0 0" }}>Consult a board-certified Gynaecologist on Medico.</p>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => onNavigateToDoctors("Gynecologist")}>
                  View Gynaecologist Directory <ChevronRight size={14} />
                </button>
              </div>

              {/* Cycle Log History */}
              {logs.length > 0 && (
                <div className="sage-card" style={{ padding: "20px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-heading)", marginBottom: "12px" }}>
                    Recent Cycle History
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {logs.slice(0, 4).map((log, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-heading)" }}>{log.startDate}</span>
                          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginLeft: "8px" }}>{log.cycleLength}d cycle • {log.flow} flow</span>
                        </div>
                        {log.symptoms?.length > 0 && (
                          <span className="badge badge-primary" style={{ fontSize: "10px" }}>{log.symptoms.length} symptoms</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          2. PCOS / PCOD RISK SCREENER
      ════════════════════════════════════ */}
      {subTab === "pcos" && (
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div className="sage-card" style={{ padding: "28px" }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", backgroundColor: ROSE_LIGHT, color: ROSE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={20} />
              </div>
              <div>
                <h2 className="heading-title" style={{ fontSize: "18px", fontWeight: "700" }}>PCOS / PCOD Risk Screening</h2>
                <p style={{ fontSize: "12.5px", color: "var(--color-text-muted)", margin: 0 }}>
                  A clinical marker questionnaire to identify polycystic ovary risk patterns. This does not replace a medical diagnosis.
                </p>
              </div>
            </div>

            {/* Disclaimer strip */}
            <div style={{ padding: "10px 14px", backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>For educational and awareness use only. A confirmed diagnosis requires ultrasound, blood hormone panel (LH, FSH, androgen levels), and evaluation by a registered Gynaecologist.</span>
            </div>

            <form onSubmit={handlePcosScreening} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Q1 */}
              <div style={{ padding: "16px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <label style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-heading)", display: "block" }}>Irregular or missed periods (cycles &gt; 35 days apart)?</span>
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Oligo/amenorrhea is the most significant PCOS diagnostic criterion</span>
                  </div>
                  <input type="checkbox" checked={irregularCycles} onChange={e => setIrregularCycles(e.target.checked)} style={{ width: "18px", height: "18px", marginTop: "2px", flexShrink: 0, accentColor: "var(--color-primary)" }} />
                </label>
              </div>

              {/* Q2 */}
              <div style={{ padding: "16px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <Label>Acne or skin breakout severity (particularly chin / jawline / cheeks)</Label>
                <select value={acneSeverity} onChange={e => setAcneSeverity(e.target.value)} style={inputStyle}>
                  <option value="None">None or Occasional</option>
                  <option value="Moderate">Moderate – persistent hormonal breakouts</option>
                  <option value="Severe">Severe – cystic or deep acne not responding to OTC treatment</option>
                </select>
              </div>

              {/* Q3 */}
              <div style={{ padding: "16px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <label style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-heading)", display: "block" }}>Excess facial or body hair (Hirsutism)?</span>
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Upper lip, chin, abdomen, or chest hair associated with elevated androgens</span>
                  </div>
                  <input type="checkbox" checked={hairGrowth} onChange={e => setHairGrowth(e.target.checked)} style={{ width: "18px", height: "18px", marginTop: "2px", flexShrink: 0, accentColor: "var(--color-primary)" }} />
                </label>
              </div>

              {/* Q4 */}
              <div style={{ padding: "16px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <label style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-heading)", display: "block" }}>Unexplained weight gain or difficulty losing weight?</span>
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Insulin resistance — common in 50–70% of PCOS cases — may cause this</span>
                  </div>
                  <input type="checkbox" checked={weightFluctuations} onChange={e => setWeightFluctuations(e.target.checked)} style={{ width: "18px", height: "18px", marginTop: "2px", flexShrink: 0, accentColor: "var(--color-primary)" }} />
                </label>
              </div>

              {/* Q5 */}
              <div style={{ padding: "16px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <label style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-heading)", display: "block" }}>Frequent fatigue, low mood, or premenstrual mood swings?</span>
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Hormonal fluctuations in PCOS often affect serotonin and cortisol regulation</span>
                  </div>
                  <input type="checkbox" checked={moodSwings} onChange={e => setMoodSwings(e.target.checked)} style={{ width: "18px", height: "18px", marginTop: "2px", flexShrink: 0, accentColor: "var(--color-primary)" }} />
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={runningScreen}>
                {runningScreen ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                {runningScreen ? "Evaluating Clinical Markers..." : "Calculate PCOS Risk Index"}
              </button>
            </form>

            {/* ─ Result card ─ */}
            {screeningResult && (
              <div className="animate-fade-in" style={{
                marginTop: "22px", padding: "20px 22px",
                borderRadius: "var(--radius-md)",
                backgroundColor: screeningResult.riskLevel === "HIGH RISK" ? "rgba(225,29,72,0.06)" : screeningResult.riskLevel === "MODERATE RISK" ? "rgba(136,105,12,0.06)" : "rgba(16,185,129,0.06)",
                border: `1px solid ${screeningResult.riskLevel === "HIGH RISK" ? "rgba(225,29,72,0.25)" : screeningResult.riskLevel === "MODERATE RISK" ? "rgba(136,105,12,0.25)" : "rgba(16,185,129,0.25)"}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>Assessment Result</span>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-text-heading)", margin: 0 }}>{screeningResult.riskLevel}</h3>
                  </div>
                  <span className={`badge ${screeningResult.riskLevel === "HIGH RISK" ? "badge-high" : screeningResult.riskLevel === "MODERATE RISK" ? "badge-medium" : "badge-low"}`}>
                    Score {screeningResult.score} / 100
                  </span>
                </div>
                <p className="body-text" style={{ fontSize: "13.5px", lineHeight: 1.65, marginBottom: "14px" }}>
                  {screeningResult.recommendation}
                </p>
                {screeningResult.riskLevel !== "LOW RISK" && (
                  <button className="btn btn-primary btn-sm" onClick={() => onNavigateToDoctors("Gynecologist")}>
                    <Stethoscope size={13} /> Book Gynaecologist Consultation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          3. AI WELLNESS COPILOT
      ════════════════════════════════════ */}
      {subTab === "copilot" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "22px" }}>

          {/* ─ Agent selector ─ */}
          <div className="sage-card" style={{ padding: "18px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
              Select Wellness Agent
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {AGENTS.map(agent => (
                <button
                  key={agent.key}
                  type="button"
                  onClick={() => {
                    setActiveAgent(agent);
                    setMessages([{
                      role: "assistant",
                      text: `Hello! I am now acting as your **${agent.label}**. ${agent.desc}. What would you like to know?`
                    }]);
                  }}
                  style={{
                    padding: "10px 12px", borderRadius: "var(--radius-md)", textAlign: "left", width: "100%", cursor: "pointer",
                    border: activeAgent.key === agent.key ? "1.5px solid var(--color-primary)" : "1px solid transparent",
                    backgroundColor: activeAgent.key === agent.key ? "rgba(51,130,114,0.08)" : "transparent",
                    color: activeAgent.key === agent.key ? "var(--color-primary)" : "var(--color-text)",
                    transition: "all 150ms ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px" }}>
                    {agent.icon}
                    <strong style={{ fontSize: "12.5px" }}>{agent.label}</strong>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{agent.desc}</span>
                </button>
              ))}
            </div>

            {/* Scope tip */}
            <div style={{ marginTop: "14px", padding: "10px 12px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "11.5px", color: "var(--color-text-muted)" }}>
              <HelpCircle size={12} style={{ marginRight: "5px" }} />
              For general health symptoms (flu, injuries), use the <strong>Symptom AI Triage</strong> section in the top navigation.
            </div>
          </div>

          {/* ─ Chat window ─ */}
          <div className="sage-card" style={{ padding: "22px", display: "flex", flexDirection: "column", height: "560px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "14px", borderBottom: "1px solid var(--color-border)", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "var(--radius-md)", backgroundColor: ROSE_LIGHT, color: ROSE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {activeAgent.icon}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-heading)" }}>{activeAgent.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Medico Women's Wellness AI — Powered by Gemini</div>
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: "10px" }}>ACTIVE</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "78%",
                    padding: "11px 16px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    backgroundColor: m.role === "user" ? "var(--color-primary)" : "var(--color-bg)",
                    color: m.role === "user" ? "var(--color-on-primary)" : "var(--color-text)",
                    fontSize: "13.5px", lineHeight: 1.6,
                    border: m.role === "user" ? "none" : "1px solid var(--color-border)"
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "12px" }}>
                  <Loader2 size={14} className="animate-spin" /> Medico AI is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--color-border)", marginTop: "12px" }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={`Ask about ${activeAgent.desc.toLowerCase()}...`}
                style={{ ...inputStyle, borderRadius: "var(--radius-pill)", flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: "var(--radius-pill)", padding: "0 18px" }} disabled={chatLoading}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
