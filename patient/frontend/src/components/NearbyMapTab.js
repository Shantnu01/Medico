import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Search, Phone, Clock, Star, Hospital, Pill, RefreshCw, Loader2, ExternalLink, Target, AlertCircle } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Shared Overpass-API fetcher (free, no key needed)
   Uses OpenStreetMap data with a Leaflet map embed
───────────────────────────────────────────────────────────── */
async function fetchNearbyPlaces(lat, lon, type = "hospital", radiusKm = 5) {
  const radius = radiusKm * 1000;
  let query = "";
  if (type === "hospital") {
    query = `[out:json][timeout:20];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="clinic"](around:${radius},${lat},${lon});
        node["healthcare"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="doctors"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="clinic"](around:${radius},${lat},${lon});
      );
      out center 30;`;
  } else {
    query = `[out:json][timeout:20];
      (
        node["amenity"="pharmacy"](around:${radius},${lat},${lon});
        node["shop"="chemist"](around:${radius},${lat},${lon});
        way["amenity"="pharmacy"](around:${radius},${lat},${lon});
      );
      out center 30;`;
  }

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" }
  });
  const data = await res.json();

  return (data.elements || []).map(el => {
    const elLat = el.lat || el.center?.lat;
    const elLon = el.lon || el.center?.lon;
    const distKm = getDistanceKm(lat, lon, elLat, elLon);
    return {
      id: el.id,
      name: el.tags?.name || el.tags?.["name:en"] || (type === "hospital" ? "Hospital / Clinic" : "Pharmacy"),
      address: [el.tags?.["addr:full"] || el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || "Address not available",
      phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
      openingHours: el.tags?.opening_hours || null,
      lat: elLat,
      lon: elLon,
      distKm: distKm.toFixed(2),
      type: el.tags?.amenity || el.tags?.healthcare || el.tags?.shop || type,
      emergency: el.tags?.emergency === "yes",
    };
  }).filter(p => p.lat && p.lon).sort((a, b) => parseFloat(a.distKm) - parseFloat(b.distKm));
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─────────────────────────────────────────────────────────────
   Map embed using OpenStreetMap iframe
───────────────────────────────────────────────────────────── */
function MapEmbed({ lat, lon, places, selectedId, type }) {
  if (!lat || !lon) return null;

  // Build Google Maps embed URL with nearby search
  const searchQuery = type === "hospital" ? "hospitals+clinics" : "pharmacy+chemist";
  const gmapsUrl = `https://www.google.com/maps/embed/v1/search?key=AIzaSyD-placeholder&q=${searchQuery}&center=${lat},${lon}&zoom=14`;

  // Fallback: use OpenStreetMap iframe
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05},${lat - 0.05},${lon + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--color-border)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <iframe
        title={type === "hospital" ? "Nearest Hospitals Map" : "Nearest Pharmacies Map"}
        src={osmUrl}
        width="100%"
        height="360"
        style={{ border: "none", display: "block" }}
        loading="lazy"
      />
      <div style={{ padding: "10px 16px", backgroundColor: "var(--color-bg)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Map data © OpenStreetMap contributors</span>
        <a
          href={`https://www.google.com/maps/search/${type === "hospital" ? "hospitals+near+me" : "pharmacies+near+me"}/@${lat},${lon},14z`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
        >
          <ExternalLink size={13} /> Open in Google Maps
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Place Card
───────────────────────────────────────────────────────────── */
function PlaceCard({ place, type, isSelected, onClick }) {
  const isHospital = type === "hospital";
  const accentColor = isHospital ? "#e74c3c" : "var(--color-primary)";
  const bgAccent = isHospital ? "rgba(231,76,60,0.08)" : "rgba(51,130,114,0.08)";

  return (
    <div
      onClick={onClick}
      style={{
        padding: "20px 22px",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: isSelected ? `2px solid ${accentColor}` : "1px solid var(--color-border)",
        cursor: "pointer",
        transition: "all 180ms ease",
        boxShadow: isSelected ? `0 0 0 3px ${bgAccent}` : "none"
      }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.transform = "none"; } }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-md)", backgroundColor: bgAccent, color: accentColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isHospital ? <Hospital size={18} /> : <Pill size={18} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 3px", lineHeight: 1.3 }}>{place.name}</h4>
            {place.address !== "Address not available" && (
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{place.address}</p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0, marginLeft: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: accentColor }}>{place.distKm} km</span>
          {place.emergency && <span style={{ fontSize: "10px", backgroundColor: "#fce8e6", color: "#c5221f", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>24h EMERGENCY</span>}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "var(--color-text-muted)" }}>
        {place.phone && (
          <a href={`tel:${place.phone}`} onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-primary)", textDecoration: "none", fontWeight: "600" }}>
            <Phone size={12} /> {place.phone}
          </a>
        )}
        {place.openingHours && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={12} /> {place.openingHours.slice(0, 30)}{place.openingHours.length > 30 ? "..." : ""}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ flex: 1, padding: "8px 0", borderRadius: "var(--radius-md)", backgroundColor: accentColor, color: "#fff", textDecoration: "none", fontSize: "12px", fontWeight: "700", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
        >
          <Navigation size={12} /> Get Directions
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", color: "var(--color-text)", textDecoration: "none", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}
        >
          <ExternalLink size={12} /> Maps
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export function NearbyMapTab({ type = "hospital" }) {
  const isHospital = type === "hospital";
  const pageTitle = isHospital ? "Nearest Hospitals" : "Nearest Pharmacies";
  const pageSubtitle = isHospital
    ? "Find hospitals, clinics and urgent care centers near your current location."
    : "Find pharmacies and chemist shops near your current location.";
  const accentColor = isHospital ? "#e74c3c" : "var(--color-primary)";
  const bgAccent = isHospital ? "rgba(231,76,60,0.08)" : "rgba(51,130,114,0.08)";

  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [userCity, setUserCity] = useState("Your Location");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [radius, setRadius] = useState(5);
  const [locationGranted, setLocationGranted] = useState(false);

  const getLocation = useCallback(() => {
    setLocationLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);
        setLocationGranted(true);
        // Reverse geocode for city name
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const d = await r.json();
          const city = d.address?.city || d.address?.town || d.address?.suburb || "Your Area";
          setUserCity(city);
        } catch {}
        setLocationLoading(false);
      },
      (err) => {
        // Fall back to IP-based location
        fetch("http://ip-api.com/json/")
          .then(r => r.json())
          .then(d => {
            if (d.lat && d.lon) {
              setUserLat(d.lat);
              setUserLon(d.lon);
              setUserCity(d.city || "Chennai");
              setLocationGranted(true);
            } else {
              // Default to Chennai
              setUserLat(13.0827);
              setUserLon(80.2707);
              setUserCity("Chennai");
              setLocationGranted(true);
            }
          })
          .catch(() => {
            setUserLat(13.0827);
            setUserLon(80.2707);
            setUserCity("Chennai");
            setLocationGranted(true);
          })
          .finally(() => setLocationLoading(false));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  const fetchPlaces = useCallback(async () => {
    if (!userLat || !userLon) return;
    setLoading(true);
    setError("");
    try {
      const results = await fetchNearbyPlaces(userLat, userLon, type, radius);
      setPlaces(results);
      if (results.length === 0) {
        setError(`No ${isHospital ? "hospitals" : "pharmacies"} found within ${radius} km. Try increasing the search radius.`);
      }
    } catch (err) {
      setError("Failed to load nearby places. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [userLat, userLon, type, radius, isHospital]);

  useEffect(() => {
    if (userLat && userLon) fetchPlaces();
  }, [userLat, userLon, radius]);

  // Auto-request location on mount
  useEffect(() => { getLocation(); }, []);

  const filtered = places.filter(p =>
    !searchText || p.name.toLowerCase().includes(searchText.toLowerCase()) || p.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1240px", margin: "0 auto", padding: "36px 28px" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "var(--radius-pill)", backgroundColor: bgAccent, color: accentColor, fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "12px", border: `1px solid ${accentColor}30` }}>
          {isHospital ? <Hospital size={13} /> : <Pill size={13} />} Live Location Search &bull; OpenStreetMap
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: "700", color: "var(--color-text-heading)", margin: "0 0 8px" }}>{pageTitle}</h1>
        <p style={{ fontSize: "15px", color: "var(--color-text-muted)", maxWidth: "680px", margin: 0, lineHeight: 1.6 }}>{pageSubtitle}</p>
      </div>

      {/* Location banner */}
      {!locationGranted ? (
        <div style={{ padding: "28px 32px", backgroundColor: bgAccent, borderRadius: "var(--radius-lg)", border: `1.5px solid ${accentColor}40`, marginBottom: "28px", textAlign: "center" }}>
          {locationLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", color: accentColor }}>
              <Loader2 size={22} className="animate-spin" />
              <span style={{ fontSize: "15px", fontWeight: "600" }}>Detecting your location...</span>
            </div>
          ) : (
            <>
              <Target size={36} color={accentColor} style={{ margin: "0 auto 14px", display: "block" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-text-heading)", marginBottom: "8px" }}>Share Your Location</h3>
              <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "18px" }}>Allow location access to find {isHospital ? "hospitals" : "pharmacies"} near you. No data is stored.</p>
              <button onClick={getLocation} style={{ padding: "12px 28px", borderRadius: "var(--radius-pill)", backgroundColor: accentColor, color: "#fff", border: "none", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Target size={16} /> Allow Location Access
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Controls row */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Location pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "var(--radius-pill)", backgroundColor: bgAccent, border: `1px solid ${accentColor}40`, fontSize: "13px", fontWeight: "700", color: accentColor }}>
              <MapPin size={14} /> {userCity}
            </div>

            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
              <Search size={15} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="text"
                placeholder={`Filter ${isHospital ? "hospitals" : "pharmacies"}...`}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--color-border)", fontSize: "13px", backgroundColor: "var(--color-surface)", color: "var(--color-text)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Radius */}
            <select
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              style={{ padding: "10px 14px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--color-border)", fontSize: "13px", backgroundColor: "var(--color-surface)", color: "var(--color-text)", cursor: "pointer" }}
            >
              <option value={2}>Within 2 km</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={20}>Within 20 km</option>
            </select>

            <button
              onClick={fetchPlaces}
              disabled={loading}
              style={{ padding: "10px 18px", borderRadius: "var(--radius-pill)", backgroundColor: accentColor, color: "#fff", border: "none", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {loading ? "Searching..." : "Refresh"}
            </button>
          </div>

          {/* Map */}
          <div style={{ marginBottom: "28px" }}>
            <MapEmbed lat={userLat} lon={userLon} places={filtered} selectedId={selectedId} type={type} />
          </div>

          {/* Error */}
          {error && !loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", backgroundColor: "#fef7e0", borderRadius: "var(--radius-md)", border: "1px solid #feefc3", color: "#92400e", fontSize: "14px", marginBottom: "20px" }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Loader2 size={36} color={accentColor} className="animate-spin" style={{ margin: "0 auto 16px", display: "block" }} />
              <p style={{ color: "var(--color-text-muted)", fontSize: "15px" }}>Searching OpenStreetMap for nearby {isHospital ? "hospitals" : "pharmacies"}...</p>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
                  <strong style={{ color: accentColor }}>{filtered.length}</strong> {isHospital ? "hospitals" : "pharmacies"} found within <strong>{radius} km</strong> of {userCity}
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
                {filtered.map(place => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    type={type}
                    isSelected={selectedId === place.id}
                    onClick={() => setSelectedId(selectedId === place.id ? null : place.id)}
                  />
                ))}
              </div>
            </>
          ) : !error && (
            <div style={{ padding: "60px 24px", textAlign: "center", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
              {isHospital ? <Hospital size={40} style={{ opacity: 0.2, margin: "0 auto 16px", display: "block" }} /> : <Pill size={40} style={{ opacity: 0.2, margin: "0 auto 16px", display: "block" }} />}
              <p style={{ color: "var(--color-text-muted)", fontSize: "15px" }}>Click "Refresh" to search for nearby {isHospital ? "hospitals" : "pharmacies"}.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
