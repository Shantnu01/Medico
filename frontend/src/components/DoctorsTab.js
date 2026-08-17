import React, { useEffect, useState } from "react";
import {
  Stethoscope, MapPin, Star, Calendar, Video, Clock,
  CheckCircle2, Search, X, ArrowUpDown, Award, Building2,
  ChevronDown
} from "lucide-react";

const SPECIALTIES = [
  "All",
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "ENT Specialist",
  "Neurologist",
  "Orthopedic",
  "Gastroenterologist",
  "Pulmonologist",
  "Gynecologist",
  "Pediatrician",
  "Ophthalmologist",
  "Psychiatrist",
];

const SORT_OPTIONS = [
  { value: "default",    label: "Default Order" },
  { value: "rating",     label: "Highest Rated" },
  { value: "experience", label: "Most Experienced" },
  { value: "fee_low",    label: "Lowest Fee" },
];

/* ── render N filled/empty stars ── */
function StarRating({ rating = 3, max = 5 }) {
  const filled = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < filled ? "#b06000" : "none"}
          color={i < filled ? "#b06000" : "#d0c9c0"}
        />
      ))}
      <span style={{ marginLeft: "4px", fontWeight: "700", fontSize: "13px", color: "var(--color-text-heading)" }}>
        {Number(rating).toFixed(1)}
      </span>
    </span>
  );
}

/* ── avatar fallback if image 404s ── */
function DoctorAvatar({ name, image }) {
  const [errored, setErrored] = useState(false);
  const initials = (name || "Dr")
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || "")
    .join("");

  if (errored || !image) {
    return (
      <div style={{
        width: "68px", height: "68px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "rgba(51,130,114,0.15)",
        color: "var(--color-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: "800", fontSize: "22px",
        border: "2px solid rgba(51,130,114,0.2)",
        flexShrink: 0
      }}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      onError={() => setErrored(true)}
      style={{
        width: "68px", height: "68px",
        borderRadius: "var(--radius-md)",
        objectFit: "cover",
        border: "2px solid var(--color-border)",
        flexShrink: 0
      }}
    />
  );
}

export function DoctorsTab({ initialSpecialty = "All" }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(false);

  const [consultModalDoc, setConsultModalDoc] = useState(null);
  const [bookModalDoc, setBookModalDoc] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [consultSuccess, setConsultSuccess] = useState(null);

  useEffect(() => {
    if (initialSpecialty) setSelectedSpecialty(initialSpecialty);
  }, [initialSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const url = `/api/doctors?specialty=${encodeURIComponent(selectedSpecialty)}&query=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.doctors) setDoctors(data.doctors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, [selectedSpecialty, searchQuery, sortBy]);

  const handleStartConsultation = async (doc) => {
    const token = localStorage.getItem("medico_token");
    try {
      const res = await fetch(`/api/doctors/${doc.id || doc._id}/consult`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setConsultSuccess(data.consultation);
      } else {
        alert(data.error || "Failed to launch consultation.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return alert("Please select a time slot.");
    const userStr = localStorage.getItem("medico_user");
    let parsedUser = null;
    try { if (userStr) parsedUser = JSON.parse(userStr); } catch {}
    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: parsedUser?.id || parsedUser?._id || `pat_${Date.now()}`,
          patientName: parsedUser?.name || "Patient",
          patientEmail: parsedUser?.email || "patient@medico.org",
          doctorId: bookModalDoc.id || bookModalDoc._id,
          doctorName: bookModalDoc.name,
          specialty: bookModalDoc.specialty,
          symptomComplaint: bookingReason || "Routine Consultation",
          appointmentDate: selectedDate,
          slotTime: selectedSlot
        })
      });
      const data = await res.json();
      if (res.ok || data.appointment) {
        setBookingSuccess({
          id: data.appointment?.id || data.appointment?._id || `app_${Date.now()}`,
          date: selectedDate,
          slot: selectedSlot,
          doctorName: bookModalDoc.name,
          specialty: bookModalDoc.specialty,
          hospital: bookModalDoc.workplaceHospital
        });
      } else {
        alert(data.error || "Booking failed.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--color-border)",
    fontSize: "14px",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text)",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1240px", margin: "0 auto", padding: "36px 28px" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 12px", borderRadius: "var(--radius-pill)",
          backgroundColor: "rgba(51,130,114,0.1)", color: "var(--color-primary)",
          fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em",
          textTransform: "uppercase", marginBottom: "12px",
          border: "1px solid rgba(51,130,114,0.25)"
        }}>
          <MapPin size={13} /> Verified Clinical Directory &bull; Chennai, India
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 8px" }}>
          Find &amp; Book a Specialist
        </h1>
        <p style={{ fontSize: "15px", color: "var(--color-text-muted)", maxWidth: "680px", margin: 0, lineHeight: 1.6 }}>
          Connect with board-certified doctors near you. Choose <strong>Consult</strong> for instant video care or <strong>Book Visit</strong> for an in-clinic appointment.
        </p>
      </div>

      {/* ── Search + Sort Bar ── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search by doctor name, specialty, or hospital..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "42px" }}
          />
        </div>

        {/* Sort select */}
        <div style={{ position: "relative", minWidth: "180px" }}>
          <ArrowUpDown size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "34px", appearance: "none", cursor: "pointer", paddingRight: "32px" }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* ── Specialty Filter Chips ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
        {SPECIALTIES.map(spec => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            style={{
              padding: "7px 16px",
              borderRadius: "var(--radius-pill)",
              fontSize: "13px",
              fontWeight: selectedSpecialty === spec ? "700" : "500",
              cursor: "pointer",
              border: "1.5px solid",
              borderColor: selectedSpecialty === spec ? "var(--color-primary)" : "var(--color-border)",
              backgroundColor: selectedSpecialty === spec ? "var(--color-primary)" : "var(--color-surface)",
              color: selectedSpecialty === spec ? "var(--color-on-primary)" : "var(--color-text)",
              transition: "all 150ms ease"
            }}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>
          {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} found
          {selectedSpecialty !== "All" ? ` in ${selectedSpecialty}` : ""}
          {sortBy !== "default" ? ` — sorted by ${SORT_OPTIONS.find(o => o.value === sortBy)?.label}` : ""}
        </p>
      )}

      {/* ── Doctor Cards Grid ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--color-text-muted)" }}>
          <Stethoscope size={36} color="var(--color-primary)" style={{ margin: "0 auto 16px", display: "block", opacity: 0.5 }} />
          <p style={{ fontSize: "15px" }}>Loading verified doctors...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
          <Stethoscope size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.25 }} />
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-text-heading)", marginBottom: "8px" }}>
            No Doctors Found
          </h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "20px" }}>
            No approved doctors match "{selectedSpecialty !== "All" ? selectedSpecialty : searchQuery}".
          </p>
          <button className="btn btn-outline" style={{ borderRadius: "var(--radius-pill)" }} onClick={() => { setSelectedSpecialty("All"); setSearchQuery(""); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {doctors.map(doc => (
            <div
              key={doc.id || doc._id}
              className="sage-card"
              style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", transition: "all 200ms ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(51,130,114,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = ""; }}
            >
              {/* Top accent */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "var(--color-primary)" }} />

              {/* Doctor header row */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <DoctorAvatar name={doc.name} image={doc.image} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 3px", lineHeight: 1.3 }}>
                    {doc.name}
                  </h3>
                  <div style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "600", marginBottom: "4px" }}>
                    {doc.specialty}
                    {doc.experienceYears ? ` • ${doc.experienceYears} yrs exp` : ""}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--color-text-muted)" }}>
                    <Building2 size={12} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.workplaceHospital || "Private Clinic"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {doc.bio && (
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "16px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {doc.bio}
                </p>
              )}

              {/* Rating + Fee row */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px",
                backgroundColor: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                marginBottom: "16px"
              }}>
                <div>
                  <StarRating rating={doc.rating || 3.0} />
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    {doc.reviewsCount || 0} review{(doc.reviewsCount || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-heading)" }}>{doc.consultationFee || "₹500"}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>per consultation</div>
                </div>
              </div>

              {/* CTA buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: "var(--radius-pill)", height: "38px" }}
                  onClick={() => { setConsultModalDoc(doc); setConsultSuccess(null); }}
                >
                  <Video size={14} /> Consult Online
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: "var(--radius-pill)", height: "38px" }}
                  onClick={() => {
                    setBookModalDoc(doc);
                    setBookingSuccess(null);
                    setSelectedSlot((doc.slots && doc.slots[0]) || "");
                    setSelectedDate(today);
                    setBookingReason("");
                  }}
                >
                  <Calendar size={14} /> Book Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ CONSULT MODAL ══ */}
      {consultModalDoc && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div className="sage-card animate-fade-in" style={{ width: "100%", maxWidth: "480px", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-text-heading)", margin: 0 }}>Online Tele-Consultation</h2>
              <button onClick={() => setConsultModalDoc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}><X size={22} /></button>
            </div>

            {consultSuccess ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <CheckCircle2 size={48} color="#059669" style={{ margin: "0 auto 14px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-heading)" }}>Consultation Room Ready</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "22px" }}>
                  Connected with <strong>{consultSuccess.doctorName}</strong>. Video session is active.
                </p>
                <a href={consultSuccess.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: "block", width: "100%", borderRadius: "var(--radius-pill)" }}>
                  <Video size={16} /> Join HD Video Session
                </a>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "16px", padding: "16px 18px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "20px" }}>
                  <DoctorAvatar name={consultModalDoc.name} image={consultModalDoc.image} />
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 4px" }}>{consultModalDoc.name}</h3>
                    <div style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "600", marginBottom: "4px" }}>{consultModalDoc.specialty}</div>
                    <StarRating rating={consultModalDoc.rating || 3.0} />
                  </div>
                </div>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "22px", fontSize: "14px", lineHeight: 1.6 }}>
                  Start an encrypted online consultation immediately with {consultModalDoc.name}. Consultation fee: <strong>{consultModalDoc.consultationFee}</strong>.
                </p>
                <button className="btn btn-primary" style={{ width: "100%", borderRadius: "var(--radius-pill)", height: "44px" }} onClick={() => handleStartConsultation(consultModalDoc)}>
                  <Video size={16} /> Confirm &amp; Launch Consultation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ BOOK APPOINTMENT MODAL ══ */}
      {bookModalDoc && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div className="sage-card animate-fade-in" style={{ width: "100%", maxWidth: "500px", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-text-heading)", margin: 0 }}>Book Clinic Appointment</h2>
              <button onClick={() => setBookModalDoc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}><X size={22} /></button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <CheckCircle2 size={48} color="#059669" style={{ margin: "0 auto 14px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "var(--color-text-heading)" }}>Appointment Confirmed!</h3>
                <div style={{ padding: "18px 20px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "left", fontSize: "14px", marginBottom: "22px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Doctor:</span> <strong>{bookingSuccess.doctorName}</strong></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Specialty:</span> <strong>{bookingSuccess.specialty}</strong></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Hospital:</span> <strong>{bookingSuccess.hospital || "Clinic"}</strong></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Date &amp; Time:</span> <strong>{bookingSuccess.date} at {bookingSuccess.slot}</strong></div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Ticket ID:</span> <strong style={{ fontFamily: "monospace", color: "var(--color-primary)" }}>#{String(bookingSuccess.id).slice(-8).toUpperCase()}</strong></div>
                </div>
                <button className="btn btn-primary" style={{ width: "100%", borderRadius: "var(--radius-pill)", height: "44px" }} onClick={() => setBookModalDoc(null)}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Doctor info */}
                <div style={{ display: "flex", gap: "14px", padding: "14px 16px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                  <DoctorAvatar name={bookModalDoc.name} image={bookModalDoc.image} />
                  <div>
                    <strong style={{ fontSize: "15px", color: "var(--color-text-heading)", display: "block", marginBottom: "3px" }}>{bookModalDoc.name}</strong>
                    <span style={{ fontSize: "13px", color: "var(--color-text-muted)", display: "block" }}>{bookModalDoc.workplaceHospital}</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)", display: "block" }}>{bookModalDoc.consultationFee}</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "6px" }}>Appointment Date</label>
                  <input type="date" required min={today} value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "14px", backgroundColor: "var(--color-bg)", color: "var(--color-text)", outline: "none", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "8px" }}>Available Time Slots</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                    {(bookModalDoc.slots || ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]).map(slot => (
                      <button
                        key={slot} type="button"
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: "10px", borderRadius: "var(--radius-md)", fontSize: "13px", fontWeight: "600",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                          border: "1.5px solid",
                          borderColor: selectedSlot === slot ? "var(--color-primary)" : "var(--color-border)",
                          backgroundColor: selectedSlot === slot ? "rgba(51,130,114,0.1)" : "var(--color-bg)",
                          color: selectedSlot === slot ? "var(--color-primary)" : "var(--color-text)",
                          transition: "all 150ms ease"
                        }}
                      >
                        <Clock size={13} /> {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "6px" }}>Reason / Symptoms</label>
                  <input
                    type="text"
                    placeholder="e.g. Persistent headache, routine checkup..."
                    value={bookingReason}
                    onChange={e => setBookingReason(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "14px", backgroundColor: "var(--color-bg)", color: "var(--color-text)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", borderRadius: "var(--radius-pill)", height: "46px", fontSize: "14px" }}>
                  <Calendar size={15} /> Confirm Appointment &mdash; {bookModalDoc.consultationFee}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
