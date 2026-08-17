import React, { useState, useEffect } from "react";
import { Activity, HeartPulse, Stethoscope, Pill, Calendar, Edit3, ShieldAlert, Award, FileText, ChevronRight, AlertCircle, Heart, MapPin, CheckCircle2, User, PhoneCall, Sparkles, Bell, Volume2, Clock, X } from "lucide-react";

export function DashboardTab({ user, onNavigate, onUpdateProfile }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Doctor Prescribed Clinical Data
  const [weeklyDietPlan, setWeeklyDietPlan] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [deviceAlarms, setDeviceAlarms] = useState([]);
  const [alarmRinging, setAlarmRinging] = useState(false);
  const [ringingAlarmLabel, setRingingAlarmLabel] = useState("");

  // Editable Profile Form State
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "Male");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "O+");
  const [heightCm, setHeightCm] = useState(user?.heightCm || "");
  const [weightKg, setWeightKg] = useState(user?.weightKg || "");
  const [medicalHistory, setMedicalHistory] = useState(user?.medicalHistory || "");
  const [allergies, setAllergies] = useState(user?.allergies || "");
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || "");

  const userLocation = user?.location?.city
    ? `${user.location.city}, ${user.location.country || ""}`
    : "Chennai, India";

  // Patient Appointments State
  const [appointments, setAppointments] = useState([]);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  // Fetch Doctor Prescribed Diet, Prescriptions & Alarms
  const fetchDoctorPrescriptions = async () => {
    try {
      const token = localStorage.getItem("medico_token");
      const res = await fetch("/api/patient/diet-prescription", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.weeklyDietPlan) setWeeklyDietPlan(data.weeklyDietPlan);
      if (data.prescriptions) setPrescriptions(data.prescriptions);
      if (data.deviceAlarms && data.deviceAlarms.length > 0) {
        setDeviceAlarms(data.deviceAlarms);
        const activeAlarm = data.deviceAlarms.find(a => a.active);
        if (activeAlarm) {
          setRingingAlarmLabel(activeAlarm.label || `Medication Alarm Scheduled for ${activeAlarm.alarmTime}`);
          setAlarmRinging(true);
          playRingingAlarmSound();
          setTimeout(playRingingAlarmSound, 500);
          setTimeout(playRingingAlarmSound, 1000);
        }
      }
    } catch (err) {
      console.error("Fetch doctor prescription error:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("medico_token");
      const res = await fetch("/api/patient/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Fetch appointments error:", err);
    }
  };

  useEffect(() => {
    fetchDoctorPrescriptions();
    fetchAppointments();
  }, []);

  // Web Audio API Ringing Alarm Synthesizer
  const playRingingAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log("Audio alarm play note:", e);
    }
  };

  // Dynamic BMI Calculation
  let bmiValue = null;
  let bmiCategory = "Normal";
  let bmiColor = "#137333";

  if (heightCm && weightKg && Number(heightCm) > 0 && Number(weightKg) > 0) {
    const hMeters = Number(heightCm) / 100;
    const bmi = (Number(weightKg) / (hMeters * hMeters)).toFixed(1);
    bmiValue = bmi;

    if (bmi < 18.5) {
      bmiCategory = "Underweight";
      bmiColor = "#b06000";
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiCategory = "Healthy / Optimal";
      bmiColor = "#137333";
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = "Overweight";
      bmiColor = "#b06000";
    } else {
      bmiCategory = "Obese";
      bmiColor = "#c5221f";
    }
  }

  // Dynamic Max Heart Rate Target based on Age
  const userAgeNum = Number(age) || 28;
  const maxTargetHeartRate = 220 - userAgeNum;
  const targetExerciseZone = `${Math.round(maxTargetHeartRate * 0.5)}-${Math.round(maxTargetHeartRate * 0.85)} bpm`;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    const token = localStorage.getItem("medico_token");
    const payload = {
      age: Number(age),
      gender,
      bloodGroup,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      medicalHistory,
      allergies,
      emergencyContact
    };

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.user) {
        const stored = localStorage.getItem("medico_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const merged = { ...parsed, ...data.user };
            localStorage.setItem("medico_user", JSON.stringify(merged));
          } catch {}
        }
        onUpdateProfile(data.user);
        setShowProfileModal(false);
      } else {
        const localUpdate = { age: Number(age), gender, bloodGroup, heightCm: Number(heightCm), weightKg: Number(weightKg), medicalHistory, allergies, emergencyContact };
        const stored = localStorage.getItem("medico_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            localStorage.setItem("medico_user", JSON.stringify({ ...parsed, ...localUpdate }));
          } catch {}
        }
        onUpdateProfile(localUpdate);
        setShowProfileModal(false);
      }
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1240px", margin: "0 auto", padding: "30px 24px" }}>
      
      {/* Real-time Ringing Alarm Banner */}
      {alarmRinging && (
        <div className="sage-card animate-fade-in" style={{
          marginBottom: "20px", padding: "18px 24px", backgroundColor: "#fce8e6", border: "2px solid #c5221f", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#c5221f" }}>
            <Volume2 size={28} className="animate-spin" />
            <div>
              <strong style={{ fontSize: "16px", display: "block" }}>⏰ DOCTOR SCHEDULED DEVICE ALARM RINGING!</strong>
              <span style={{ fontSize: "12px" }}>{ringingAlarmLabel || "Time for your scheduled medication dose prescribed by your doctor."}</span>
            </div>
          </div>
          <button className="btn" style={{ backgroundColor: "#c5221f", color: "#ffffff" }} onClick={() => setAlarmRinging(false)}>
            Dismiss Alarm Ringing
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="sage-card" style={{
        padding: "30px 32px",
        marginBottom: "30px",
        backgroundColor: "#ffffff",
        border: "1px solid var(--color-border)",
        borderLeft: "4px solid var(--color-primary)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge badge-primary">
                PATIENT HEALTH VAULT • VERIFIED
              </span>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowProfileModal(true)}
                style={{ padding: "3px 10px", fontSize: "11px" }}
              >
                <Edit3 size={12} /> Edit Profile
              </button>
            </div>

            <h1 className="heading-title" style={{ fontSize: "30px", fontWeight: "300", margin: "4px 0" }}>
              Welcome back, {user?.name || "Patient"}
            </h1>
            <p className="body-text" style={{ color: "var(--color-text-muted)", maxWidth: "600px" }}>
              Your Medico Health Vault is synchronized with 450+ Accredited Hospitals and Board-Certified Specialists.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
              borderRadius: "var(--radius-sm)", backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)", fontSize: "12px", fontWeight: "500"
            }}>
              <MapPin size={14} color="var(--color-primary)" />
              <span>Location: <strong>{userLocation}</strong></span>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => { fetchAppointments(); setShowAppointmentsModal(true); }}
              style={{ padding: "7px 16px" }}
            >
              <Calendar size={14} /> Check Appointments ({appointments.length})
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC VITALS TELEMETRY GRID ACCORDING TO PATIENT MEDICAL DATA */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "15px",
        marginBottom: "30px"
      }}>
        {/* CARD 1: DYNAMIC BMI STATUS */}
        <div className="sage-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
              Body Mass Index (BMI)
            </span>
            <Activity size={16} color="var(--color-primary)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "28px", fontWeight: "300", color: "var(--color-text-heading)" }}>
              {bmiValue || "--"}
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>kg/m²</span>
          </div>
          <span style={{ fontSize: "11px", color: bmiColor, fontWeight: "600", display: "inline-block", marginTop: "4px" }}>
            {bmiCategory}
          </span>
        </div>

        {/* CARD 2: DYNAMIC HEART RATE TARGET */}
        <div className="sage-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
              Target Exercise Heart Rate
            </span>
            <Heart size={16} color="#c5221f" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "24px", fontWeight: "300", color: "var(--color-text-heading)" }}>
              {targetExerciseZone}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "inline-block", marginTop: "4px" }}>
            Max Safe HR: {maxTargetHeartRate} bpm (Age {userAgeNum})
          </span>
        </div>

        {/* CARD 3: CHRONIC MEDICAL HISTORY STATUS */}
        <div className="sage-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
              Medical History
            </span>
            <FileText size={16} color="#b06000" />
          </div>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-heading)", display: "block" }}>
            {user?.medicalHistory || medicalHistory || "No Chronic Illness Recorded"}
          </span>
          <span style={{ fontSize: "11px", color: "#b06000", fontWeight: "600", display: "inline-block", marginTop: "4px" }}>
            Allergies: {user?.allergies || allergies || "None Reported"}
          </span>
        </div>
      </div>

      {/* DOCTOR PRESCRIBED 7-DAY WEEKLY DIET PLAN SECTION */}
      {weeklyDietPlan && (
        <div className="sage-card" style={{ padding: "28px", marginBottom: "30px", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
            <Sparkles size={22} color="#137333" />
            <div>
              <h2 className="heading-title" style={{ fontSize: "20px", fontWeight: "600" }}>Your Doctor Prescribed 7-Day Weekly Diet Plan</h2>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Customized nutritional meal plan assigned by your attending physician</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {Object.entries(weeklyDietPlan).map(([day, meal]) => (
              <div key={day} style={{ padding: "14px", backgroundColor: "#f6fbf7", borderRadius: "var(--radius-sm)", border: "1px solid #ceead6" }}>
                <strong style={{ fontSize: "13px", color: "#137333", display: "block", marginBottom: "4px" }}>{day}</strong>
                <p style={{ fontSize: "12px", color: "var(--color-text)", margin: 0, lineHeight: "1.5" }}>{meal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCTOR PRESCRIBED MEDICINES & DOSAGE SECTION */}
      {prescriptions.length > 0 && (
        <div className="sage-card" style={{ padding: "28px", marginBottom: "30px", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
            <Pill size={22} color="var(--color-primary)" />
            <div>
              <h2 className="heading-title" style={{ fontSize: "20px", fontWeight: "600" }}>Active Doctor Prescriptions & Dose Schedule</h2>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Official medication dosages issued by your doctor</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            {prescriptions.map((p, idx) => (
              <div key={idx} style={{ padding: "16px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <strong style={{ fontSize: "15px", color: "var(--color-primary)" }}>{p.medicineName}</strong>
                  <span className="badge badge-primary" style={{ fontSize: "11px" }}>{p.dosage}</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text)", marginBottom: "4px" }}>
                  ⏰ <strong>Dose Frequency:</strong> {p.timeDose}
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  Duration: {p.duration} • Doctor: <strong>{p.prescribedBy}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE EDIT MODAL */}
      {showProfileModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
        }}>
          <div className="sage-card animate-fade-in" style={{ maxWidth: "540px", width: "100%", padding: "28px", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Edit3 size={20} color="var(--color-primary)" />
                <h2 className="heading-title" style={{ fontSize: "20px", fontWeight: "600" }}>Clinical Health Profile Data</h2>
              </div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Age (Years)</label>
                  <input type="number" required min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }}>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Height (cm)</label>
                  <input type="number" required value={heightCm} onChange={(e) => setHeightCm(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Weight (kg)</label>
                  <input type="number" required value={weightKg} onChange={(e) => setWeightKg(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Medical History & Pre-existing Conditions</label>
                <textarea rows={2} value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Known Drug Allergies</label>
                <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "13px" }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={savingProfile}>
                {savingProfile ? "Saving Health Profile..." : "Save Medical Profile Data"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHECK APPOINTMENTS MODAL */}
      {showAppointmentsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
        }}>
          <div className="sage-card animate-fade-in" style={{ maxWidth: "680px", width: "100%", padding: "28px", backgroundColor: "#ffffff", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Calendar size={22} color="var(--color-primary)" />
                <div>
                  <h2 className="heading-title" style={{ fontSize: "20px", fontWeight: "600" }}>Your Booked Appointments</h2>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Active and past scheduled consultations</span>
                </div>
              </div>
              <button onClick={() => setShowAppointmentsModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {appointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--color-text-muted)" }}>
                <Stethoscope size={32} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                <p>No appointments booked yet.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: "12px" }} onClick={() => { setShowAppointmentsModal(false); onNavigate("doctors"); }}>
                  Find & Book a Doctor
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {appointments.map((appItem) => (
                  <div key={appItem._id || appItem.id} style={{ padding: "16px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "16px", color: "var(--color-text-heading)", display: "block" }}>
                          {appItem.doctorName || "Attending Doctor"}
                        </strong>
                        <span className="badge badge-primary" style={{ fontSize: "11px", marginTop: "2px" }}>
                          {appItem.specialty || "General Physician"}
                        </span>
                      </div>

                      <span className="badge badge-success" style={{ fontSize: "11px" }}>
                        <CheckCircle2 size={12} /> {appItem.status || "CONFIRMED"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--color-text-muted)", marginTop: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={13} /> {appItem.appointmentDate}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={13} /> {appItem.slotTime}</span>
                    </div>

                    <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--color-text)", backgroundColor: "#ffffff", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                      <strong>Complaint:</strong> "{appItem.symptomComplaint || "Routine Consult"}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Portals Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px"
      }}>
        <div onClick={() => onNavigate("help")} className="sage-card" style={{ padding: "24px", cursor: "pointer" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(0, 81, 195, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", marginBottom: "16px" }}>
            <HeartPulse size={22} />
          </div>
          <h3 className="heading-title" style={{ fontSize: "18px", fontWeight: "600", marginBottom: "6px" }}>Symptom Assessment Portal</h3>
          <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>Input natural symptom complaints to receive instant care pathways and specialist referrals.</p>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "4px" }}>Start Triage Assessment <ChevronRight size={14} /></span>
        </div>

        <div onClick={() => onNavigate("doctors")} className="sage-card" style={{ padding: "24px", cursor: "pointer" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", backgroundColor: "#e6f4ea", display: "flex", alignItems: "center", justifyContent: "center", color: "#137333", marginBottom: "16px" }}>
            <Stethoscope size={22} />
          </div>
          <h3 className="heading-title" style={{ fontSize: "18px", fontWeight: "600", marginBottom: "6px" }}>Specialist Doctor Directory</h3>
          <p className="body-text" style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>Consult verified doctors across cardiology, neurology, pediatrics, and dermatology.</p>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#137333", display: "flex", alignItems: "center", gap: "4px" }}>Find Verified Doctor <ChevronRight size={14} /></span>
        </div>

        {user?.gender?.toLowerCase() === "female" && (
          <div onClick={() => onNavigate("herhealth")} className="sage-card" style={{ padding: "24px", cursor: "pointer", border: "1px solid rgba(236, 72, 153, 0.3)", backgroundColor: "#fdf2f8" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(236, 72, 153, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", marginBottom: "16px" }}>
              <Heart size={22} />
            </div>
            <h3 className="heading-title" style={{ fontSize: "18px", fontWeight: "600", marginBottom: "6px", color: "#9d174d" }}>HerHealth Care Portal</h3>
            <p className="body-text" style={{ color: "#be185d", marginBottom: "16px" }}>Menstrual cycle tracker, ovulation predictor, PCOS risk screener, and Gynecologist consultation.</p>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#db2777", display: "flex", alignItems: "center", gap: "4px" }}>Open Women's Health Hub <ChevronRight size={14} /></span>
          </div>
        )}
      </div>
    </div>
  );
}
