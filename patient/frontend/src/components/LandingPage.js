import React, { useState } from "react";
import { ShieldCheck, Cpu, MapPin, Pill, ArrowRight, Activity, CheckCircle2, HeartPulse, Stethoscope, ChevronDown, Award, Sparkles, Building, Lock, FileText, PhoneCall, UserCheck, Heart, AlertTriangle, TrendingDown, Users, Globe } from "lucide-react";

export function LandingPage({ onGetStarted }) {
  const [activeSectionTab, setActiveSectionTab] = useState("why");
  const [openFaq, setOpenFaq] = useState(0);

  const faqItems = [
    {
      q: "Why is healthcare so expensive in India and how does Medico help?",
      a: "In India, over 65% of medical expenses are out-of-pocket, forcing millions of middle-class and low-income families into debt during health crises. Medico eliminates unnecessary initial hospital visit fees by providing 100% FREE AI Clinical Triage, connecting patients to affordable doctors, and finding 70% cheaper generic medicines."
    },
    {
      q: "How does Medico save lives during critical emergency hours?",
      a: "During golden hours (cardiac arrests, strokes, or trauma), delay in ambulance dispatch leads to high mortality. Medico features 1-click National Emergency SOS (108 & 112) integration, real-time nearest hospital ER locator, and instant triage alerts."
    },
    {
      q: "Can poor and rural families access this platform for free?",
      a: "Yes! Anyone with a smartphone can type symptoms in plain Hindi, Tamil, or English for 0 Rupees. You receive instant, USMLE-grade severity risk guidance and generic medication options."
    },
    {
      q: "How are doctor licenses verified on Medico?",
      a: "Every doctor applicant undergoes strict credential verification by our Medical Review Board. Registration license numbers are cross-referenced with State Medical Councils (e.g. Tamil Nadu Medical Council / MCI) before approval."
    }
  ];

  return (
    <div className="animate-fade-in" style={{ overflowX: "hidden" }}>

      {/* HERO SECTION DEDICATED TO INDIAN HEALTHCARE ACCESS */}
      <section style={{
        padding: "70px 24px 50px",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center"
      }}>
        {/* Sub-badge */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
          <span className="badge badge-primary">
            <Heart size={13} color="var(--color-primary)" /> HEALTHCARE FOR 1.4 BILLION INDIANS
          </span>
          <span className="badge badge-low">
            <TrendingDown size={13} color="#137333" /> REDUCING OUT-OF-POCKET MEDICAL EXPENSES
          </span>
          <span className="badge badge-high">
            <PhoneCall size={13} color="#c5221f" /> 24/7 EMERGENCY SOS DISPATCH
          </span>
        </div>

        {/* Headline */}
        <h1 className="display-title" style={{ maxWidth: "980px", margin: "0 auto 18px", fontWeight: "300" }}>
          Democratizing Healthcare in India: Free AI Triage, Emergency Care & Affordable Doctors
        </h1>

        {/* Subtitle */}
        <p className="body-text" style={{
          fontSize: "15px",
          color: "var(--color-text-muted)",
          maxWidth: "800px",
          margin: "0 auto 32px",
          lineHeight: "1.6"
        }}>
          High hospital consultation fees and costly diagnostic tests push millions of Indian families into financial stress every year. Medico bridges this gap by providing <strong>Free Clinical AI Triage</strong>, direct connections to verified doctors, and 1-click emergency care.
        </p>

        {/* Main CTAs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", marginBottom: "44px" }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: "12px 28px", fontSize: "14px" }}
            onClick={onGetStarted}
          >
            Start Free Triage Assessment
            <ArrowRight size={16} />
          </button>
          
          <button 
            className="btn btn-outline" 
            style={{ padding: "12px 24px", fontSize: "14px" }}
            onClick={onGetStarted}
          >
            <Stethoscope size={16} color="var(--color-primary)" />
            Join as Patient / Doctor
          </button>
        </div>

        {/* REAL-TIME IMPACT STATS FOR INDIA */}
        <div className="sage-card" style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "24px 28px",
          backgroundColor: "#ffffff",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "20px",
          textAlign: "center"
        }}>
          <div>
            <span style={{ fontSize: "32px", fontWeight: "300", color: "#c5221f", display: "block" }}>65%</span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Out-of-Pocket Expense in India</span>
          </div>
          <div>
            <span style={{ fontSize: "32px", fontWeight: "300", color: "#137333", display: "block" }}>₹0</span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Cost for AI Clinical Triage</span>
          </div>
          <div>
            <span style={{ fontSize: "32px", fontWeight: "300", color: "var(--color-primary)", display: "block" }}>108</span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase" }}>National Ambulance Dispatch</span>
          </div>
          <div>
            <span style={{ fontSize: "32px", fontWeight: "300", color: "#b06000", display: "block" }}>70%</span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Savings on Generic OTC Medicines</span>
          </div>
        </div>
      </section>

      {/* PUBLIC INFORMATIONAL SECTIONS SWITCHER */}
      <section style={{
        backgroundColor: "var(--color-surface)",
        padding: "60px 24px",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span className="badge badge-primary" style={{ marginBottom: "8px" }}>INDIAN HEALTHCARE EQUITY MISSION</span>
            <h2 className="heading-title" style={{ fontSize: "28px", fontWeight: "300" }}>
              Understanding the Problem & How Medico Helps
            </h2>
          </div>

          {/* Section Switcher Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
            <button
              className={`btn ${activeSectionTab === "why" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveSectionTab("why")}
            >
              <TrendingDown size={15} /> 1. Why We Need This (Cost Problem)
            </button>
            <button
              className={`btn ${activeSectionTab === "emergency" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveSectionTab("emergency")}
            >
              <PhoneCall size={15} /> 2. Emergency 108 & Golden Hours
            </button>
            <button
              className={`btn ${activeSectionTab === "affordable" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveSectionTab("affordable")}
            >
              <Heart size={15} /> 3. Healthcare for Poor & Rural India
            </button>
            <button
              className={`btn ${activeSectionTab === "about" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveSectionTab("about")}
            >
              <Users size={15} /> 4. About Our Mission
            </button>
          </div>

          {/* SECTION 1: WHY WE NEED THIS */}
          {activeSectionTab === "why" && (
            <div className="sage-card" style={{ padding: "32px", backgroundColor: "#ffffff" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", alignItems: "center" }}>
                <div>
                  <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", backgroundColor: "#fce8e6", color: "#c5221f", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                    <TrendingDown size={22} />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>
                    The Commercial Medical Cost Crisis in India
                  </h3>
                  <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "16px", lineHeight: "1.6" }}>
                    In India, visiting a private clinic often costs ₹500 to ₹1500 just for initial consultation, followed by expensive diagnostic tests. For millions of daily-wage workers and middle-class families, a single illness can wipe out monthly savings. Medico replaces expensive initial triage with <strong>Free USMLE-Grade AI Triage</strong> so patients know exactly when a hospital visit is necessary.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={onGetStarted}>
                    Sign In to Access Free Triage <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}>
                  <span style={{ fontWeight: "700", color: "#c5221f", display: "block", marginBottom: "8px" }}>Healthcare Cost Comparison in India:</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ padding: "8px 12px", backgroundColor: "#fce8e6", color: "#c5221f", borderRadius: "var(--radius-sm)", border: "1px solid #fad2cf" }}>
                      <strong>Traditional Hospital OPD:</strong> ₹500 - ₹1200 Consultation + ₹3000 Unnecessary Tests
                    </div>
                    <div style={{ padding: "8px 12px", backgroundColor: "#e6f4ea", color: "#137333", borderRadius: "var(--radius-sm)", border: "1px solid #ceead6", fontWeight: "600" }}>
                      <strong>Medico AI Platform:</strong> ₹0 Initial Triage + Verified Generic Pharmacy Options
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: EMERGENCY CARE 108 */}
          {activeSectionTab === "emergency" && (
            <div className="sage-card" style={{ padding: "32px", backgroundColor: "#ffffff" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", alignItems: "center" }}>
                <div>
                  <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", backgroundColor: "#fce8e6", color: "#c5221f", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                    <PhoneCall size={22} />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>
                    Saving Lives During Critical Golden Hours
                  </h3>
                  <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "16px", lineHeight: "1.6" }}>
                    During acute cardiac arrests, strokes, or trauma, every minute matters. Panic and lack of ambulance access cost lives. Medico includes a prominent <strong>SOS 108 & 112 Hotline Shortcut</strong>, automated emergency contact SMS alerts, and hospital ER direction routing.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={onGetStarted}>
                    Sign In for Full Emergency Protocol <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ padding: "20px", backgroundColor: "#fce8e6", borderRadius: "var(--radius-sm)", border: "1px solid #fad2cf", fontSize: "12px", color: "#c5221f" }}>
                  <span style={{ fontWeight: "700", display: "block", marginBottom: "8px" }}>Emergency Protocol Integration:</span>
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    <li style={{ marginBottom: "6px" }}>1-Click National Ambulance Dispatch (108 & 112)</li>
                    <li style={{ marginBottom: "6px" }}>Automated Geolocation SOS to Emergency Contacts</li>
                    <li style={{ marginBottom: "6px" }}>Real-Time Blood Bank & ER Availability Map</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: AFFORDABLE CARE FOR POOR & RURAL INDIA */}
          {activeSectionTab === "affordable" && (
            <div className="sage-card" style={{ padding: "32px", backgroundColor: "#ffffff" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", alignItems: "center" }}>
                <div>
                  <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", backgroundColor: "#e6f4ea", color: "#137333", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                    <Heart size={22} />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>
                    Equal Access to Healthcare for Underprivileged & Rural Families
                  </h3>
                  <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "16px", lineHeight: "1.6" }}>
                    In rural India, reaching a qualified doctor requires traveling hours to district hospitals. Medico allows anyone with a basic smartphone to evaluate symptoms instantly in local Indian languages, receive guidance on low-cost generic drugs, and find nearest government and charitable clinics.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={onGetStarted}>
                    Get Started Free <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ padding: "20px", backgroundColor: "#e6f4ea", borderRadius: "var(--radius-sm)", border: "1px solid #ceead6", fontSize: "12px", color: "#137333" }}>
                  <span style={{ fontWeight: "700", display: "block", marginBottom: "8px" }}>Social Impact Pillars:</span>
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    <li style={{ marginBottom: "6px" }}>0 Rupees fee for AI Symptom Evaluation</li>
                    <li style={{ marginBottom: "6px" }}>Up to 70% savings on verified generic OTC medications</li>
                    <li style={{ marginBottom: "6px" }}>Preventing delayed medical care in rural communities</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ABOUT US */}
          {activeSectionTab === "about" && (
            <div className="sage-card" style={{ padding: "32px", backgroundColor: "#ffffff" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", alignItems: "center" }}>
                <div>
                  <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(0, 81, 195, 0.08)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                    <Globe size={22} />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>
                    About Medico Health Technologies
                  </h3>
                  <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "16px", lineHeight: "1.6" }}>
                    Medico was founded with a singular mission: to make clinical-grade medical intelligence and telemedicine accessible, transparent, and affordable for every citizen of India, regardless of income level or geographic location.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={onGetStarted}>
                    Join the Healthcare Revolution <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "12px" }}>
                  <span style={{ fontWeight: "700", color: "var(--color-primary)", display: "block", marginBottom: "8px" }}>Our Core Values:</span>
                  <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--color-text-muted)" }}>
                    <li style={{ marginBottom: "6px" }}>Patient Safety & Ethical AI Guardrails First</li>
                    <li style={{ marginBottom: "6px" }}>Transparency & State Medical Council Doctor Audits</li>
                    <li style={{ marginBottom: "6px" }}>Universal Affordability for All Income Classes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section style={{ padding: "70px 24px", maxWidth: "840px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h2 className="heading-title" style={{ fontSize: "28px", fontWeight: "300" }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className="sage-card"
              style={{ backgroundColor: "#ffffff", padding: "16px 20px", cursor: "pointer" }}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "14px", color: "var(--color-text-heading)", fontWeight: "600" }}>
                  {item.q}
                </strong>
                <ChevronDown
                  size={16}
                  color="var(--color-text-muted)"
                  style={{ transform: openFaq === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
                />
              </div>

              {openFaq === idx && (
                <p className="body-text" style={{ marginTop: "10px", color: "var(--color-text-muted)", fontSize: "12px", lineHeight: "1.6" }}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section style={{ padding: "60px 24px", backgroundColor: "var(--color-primary)", color: "#ffffff", textAlign: "center" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 className="heading-title" style={{ color: "#ffffff", fontSize: "28px", fontWeight: "300", marginBottom: "12px" }}>
            Experience Affordable Healthcare Navigation Today
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "13px", marginBottom: "24px" }}>
            Join thousands of patients and verified doctors across India using Medico for secure, free clinical triage and affordable care.
          </p>
          <button className="btn" style={{ backgroundColor: "#ffffff", color: "var(--color-primary)", padding: "12px 30px", fontSize: "13px", fontWeight: "600" }} onClick={onGetStarted}>
            Sign In / Get Started Free <ArrowRight size={16} />
          </button>
        </div>
      </section>

    </div>
  );
}
