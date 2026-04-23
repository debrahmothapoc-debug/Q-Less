import { useState, useEffect } from "react";

const API = "https://qless-api-een4.onrender.com/api";

const api = {
  token: () => localStorage.getItem("ql_token"),
  setToken: (t) => t ? localStorage.setItem("ql_token", t) : localStorage.removeItem("ql_token"),
  async req(method, path, body) {
    const h = { "Content-Type": "application/json" };
    if (api.token()) h["Authorization"] = "Bearer " + api.token();
    const r = await fetch(API + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Something went wrong");
    return d;
  },
  get: (p) => api.req("GET", p),
  post: (p, b) => api.req("POST", p, b),
  patch: (p, b) => api.req("PATCH", p, b),
};

// ── MOCK DATA for preview ─────────────────────────────────
const MOCK_DASH = {
  driver: { name: "Sipho Dlamini", taxi_plate: "GP 34-56 AB", route: "Soweto (Bara) → Johannesburg CBD", capacity: 15, rating: 4.8 },
  summary: { total_booked_seats: 47, confirmed_trips: 8, open_slots: 6, estimated_earnings: "R681.50" },
  date: new Date().toISOString().slice(0, 10),
  slots: [
    { id: "s1", departure_time: "05:00:00", capacity: 15, booked_seats: 0, booking_count: 0 },
    { id: "s2", departure_time: "05:30:00", capacity: 15, booked_seats: 3, booking_count: 1 },
    { id: "s3", departure_time: "06:00:00", capacity: 15, booked_seats: 7, booking_count: 3 },
    { id: "s4", departure_time: "06:30:00", capacity: 15, booked_seats: 12, booking_count: 5 },
    { id: "s5", departure_time: "07:00:00", capacity: 15, booked_seats: 15, booking_count: 6 },
    { id: "s6", departure_time: "07:30:00", capacity: 15, booked_seats: 10, booking_count: 4 },
    { id: "s7", departure_time: "08:00:00", capacity: 15, booked_seats: 0, booking_count: 0 },
    { id: "s8", departure_time: "15:00:00", capacity: 15, booked_seats: 5, booking_count: 2 },
    { id: "s9", departure_time: "15:30:00", capacity: 15, booked_seats: 8, booking_count: 3 },
    { id: "s10", departure_time: "16:00:00", capacity: 15, booked_seats: 14, booking_count: 6 },
    { id: "s11", departure_time: "16:30:00", capacity: 15, booked_seats: 15, booking_count: 7 },
    { id: "s12", departure_time: "17:00:00", capacity: 15, booked_seats: 2, booking_count: 1 },
  ],
};

const MOCK_PAX = {
  s3: [{ id: "b1", booking_ref: "QL-A3K2", commuter_name: "Nomsa Dlamini", phone: "072***4567", seats: 2, status: "confirmed" }, { id: "b2", booking_ref: "QL-B7XP", commuter_name: "Themba Khumalo", phone: "083***2211", seats: 3, status: "confirmed" }, { id: "b3", booking_ref: "QL-C9MN", commuter_name: "Zanele Mokoena", phone: "076***8830", seats: 2, status: "confirmed" }],
  s4: [{ id: "b4", booking_ref: "QL-D2QR", commuter_name: "Kagiso Sithole", phone: "073***4421", seats: 4, status: "confirmed" }, { id: "b5", booking_ref: "QL-E5WZ", commuter_name: "Palesa Nkosi", phone: "082***9034", seats: 2, status: "boarded" }, { id: "b6", booking_ref: "QL-F8TY", commuter_name: "Mpho Zulu", phone: "071***1234", seats: 3, status: "boarded" }, { id: "b7", booking_ref: "QL-G1UV", commuter_name: "Refilwe Ndlovu", phone: "079***5678", seats: 3, status: "confirmed" }],
  s5: [{ id: "b8", booking_ref: "QL-H4AB", commuter_name: "Tumi Mthembu", phone: "084***3344", seats: 4, status: "boarded" }, { id: "b9", booking_ref: "QL-J7CD", commuter_name: "Lerato Sithole", phone: "072***7788", seats: 3, status: "boarded" }, { id: "b10", booking_ref: "QL-K2EF", commuter_name: "Bongani Zulu", phone: "083***9900", seats: 4, status: "boarded" }, { id: "b11", booking_ref: "QL-L5GH", commuter_name: "Sifiso Dube", phone: "076***1122", seats: 4, status: "boarded" }],
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function DriverApp() {
  const [screen, setScreen] = useState("login"); // login | dashboard
  const [phone, setPhone] = useState("0711000001");
  const [password, setPassword] = useState("Driver@123");
  const [authLoading, setAuthLoading] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [user, setUser] = useState(null);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [pax, setPax] = useState({});
  const [paxLoading, setPaxLoading] = useState({});
  const [boardingId, setBoardingId] = useState(null);
  const [useMock, setUseMock] = useState(false);

  // Try restore session
  useEffect(() => {
    const t = api.token();
    if (t) {
      api.get("/auth/me").then(u => { setUser(u); setScreen("dashboard"); loadDash(); }).catch(() => api.setToken(null));
    }
  }, []);

  async function login() {
    setAuthErr(""); setAuthLoading(true);
    try {
      const d = await api.post("/auth/login", { phone, password });
      if (d.user.role !== "driver") throw new Error("This app is for drivers only.");
      api.setToken(d.token);
      setUser(d.user);
      setScreen("dashboard");
      loadDash();
    } catch (e) {
      // Fall back to mock for demo
      setUseMock(true);
      setUser({ name: "Sipho Dlamini", role: "driver" });
      setScreen("dashboard");
      setDash(MOCK_DASH);
    } finally { setAuthLoading(false); }
  }

  async function loadDash() {
    setLoading(true);
    try {
      const d = await api.get("/driver/dashboard");
      setDash(d);
    } catch {
      setDash(MOCK_DASH);
      setUseMock(true);
    } finally { setLoading(false); }
  }

  async function loadPax(slotId) {
    if (pax[slotId]) { setExpandedSlot(expandedSlot === slotId ? null : slotId); return; }
    if (useMock) {
      await delay(400);
      setPax(p => ({ ...p, [slotId]: MOCK_PAX[slotId] || [] }));
      setExpandedSlot(slotId);
      return;
    }
    setPaxLoading(p => ({ ...p, [slotId]: true }));
    try {
      const d = await api.get("/driver/slots/" + slotId + "/passengers");
      setPax(p => ({ ...p, [slotId]: d.passengers }));
      setExpandedSlot(slotId);
    } catch { setPax(p => ({ ...p, [slotId]: [] })); setExpandedSlot(slotId); }
    finally { setPaxLoading(p => ({ ...p, [slotId]: false })); }
  }

  async function board(bookingId, slotId) {
    setBoardingId(bookingId);
    try {
      if (!useMock) await api.patch("/driver/bookings/" + bookingId + "/board");
      await delay(300);
      setPax(p => ({ ...p, [slotId]: p[slotId].map(px => px.id === bookingId ? { ...px, status: "boarded" } : px) }));
    } finally { setBoardingId(null); }
  }

  function logout() { api.setToken(null); setUser(null); setDash(null); setScreen("login"); setPax({}); setExpandedSlot(null); setUseMock(false); }

  const totalBoarded = dash ? dash.slots.reduce((sum, s) => { const p = pax[s.id] || []; return sum + p.filter(px => px.status === "boarded").reduce((a, px) => a + px.seats, 0); }, 0) : 0;

  if (screen === "login") return <LoginScreen phone={phone} setPhone={setPhone} password={password} setPassword={setPassword} loading={authLoading} error={authErr} onLogin={login} />;
  if (!dash) return <LoadingScreen />;
  return <Dashboard user={user} dash={dash} expandedSlot={expandedSlot} pax={pax} paxLoading={paxLoading} boardingId={boardingId} totalBoarded={totalBoarded} onTogglePax={loadPax} onBoard={board} onLogout={logout} useMock={useMock} />;
}

// ── LOGIN ─────────────────────────────────────────────────
function LoginScreen({ phone, setPhone, password, setPassword, loading, error, onLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%, #1a3a8f 50%, #0d2660 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* Logo */}
      <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "linear-gradient(135deg, #4a7bf7, #1a3a8f)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 20px 60px rgba(74,123,247,0.4)" }}>
          <span style={{ fontSize: 36 }}>🚖</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 32, color: "white", letterSpacing: -1 }}>Q-Less</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>Driver Portal</div>
      </div>

      {/* Card */}
      <div style={{ animation: "fadeUp 0.5s ease forwards", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 32, width: "100%", maxWidth: 400 }}>
        <h2 style={{ color: "white", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 28 }}>Sign in to manage your trips</p>

        {error && <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6, letterSpacing: 0.5 }}>PHONE NUMBER</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0711000001"
            style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white", fontSize: 15, outline: "none" }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6, letterSpacing: 0.5 }}>PASSWORD</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && onLogin()}
            style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white", fontSize: 15, outline: "none" }} />
        </div>

        <button onClick={onLogin} disabled={loading}
          style={{ width: "100%", padding: "14px", background: loading ? "rgba(74,123,247,0.5)" : "linear-gradient(135deg, #4a7bf7, #1a3a8f)", border: "none", borderRadius: 14, color: "white", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 8px 32px rgba(74,123,247,0.4)", transition: "all 0.2s" }}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 20 }}>Demo: 0711000001 / Driver@123</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%, #1a3a8f 50%, #0d2660 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "float 1s ease-in-out infinite" }}>🚖</div>
        <p style={{ opacity: 0.6 }}>Loading dashboard...</p>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ user, dash, expandedSlot, pax, paxLoading, boardingId, totalBoarded, onTogglePax, onBoard, onLogout, useMock }) {
  const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar{width:0}
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0d1f5c 0%, #1a3a8f 60%, #2952c4 100%)", padding: "0 20px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 30px rgba(13,31,92,0.4)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚖</div>
            <div>
              <div style={{ fontWeight: 800, color: "white", fontSize: 17, letterSpacing: -0.5 }}>Q-Less Driver</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 0.5 }}>SKIP THE QUEUE</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "6px 14px", color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 500 }}>
              {user?.name?.split(" ")[0]}
            </div>
            <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px 40px" }}>

        {/* HERO STATS */}
        <div style={{ background: "linear-gradient(135deg, #1a3a8f 0%, #2952c4 100%)", borderRadius: "0 0 28px 28px", padding: "28px 20px 32px", marginBottom: 24, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>{today}</p>
            <h1 style={{ color: "white", fontWeight: 800, fontSize: 26, letterSpacing: -0.5, marginTop: 4 }}>{dash.driver.route}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px", color: "rgba(255,255,255,0.9)", fontSize: 12 }}>🚕 {dash.driver.taxi_plate}</span>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px", color: "rgba(255,255,255,0.9)", fontSize: 12 }}>⭐ {dash.driver.rating}</span>
              {useMock && <span style={{ background: "rgba(255,200,0,0.2)", borderRadius: 20, padding: "4px 12px", color: "#fbbf24", fontSize: 11 }}>Demo Mode</span>}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Booked", value: dash.summary.total_booked_seats, icon: "🎫", color: "#93c5fd" },
              { label: "Trips", value: dash.summary.confirmed_trips, icon: "✅", color: "#86efac" },
              { label: "Open", value: dash.summary.open_slots, icon: "⏳", color: "#fcd34d" },
              { label: "Earnings", value: dash.summary.estimated_earnings, icon: "💰", color: "#6ee7b7", small: true },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 10px", textAlign: "center", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: s.small ? 13 : 22, color: s.color, letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION TITLE */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, animation: "fadeUp 0.5s ease forwards" }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: "#0d1f5c", letterSpacing: -0.5 }}>Today's Schedule</h2>
          <span style={{ background: "#1a3a8f", color: "white", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{dash.slots.length} slots</span>
        </div>

        {/* SLOTS */}
        {dash.slots.map((slot, idx) => {
          const booked = parseInt(slot.booked_seats);
          const pct = Math.round((booked / slot.capacity) * 100);
          const isOpen = expandedSlot === slot.id;
          const passengers = pax[slot.id] || [];
          const isLoading = paxLoading[slot.id];
          const status = booked === 0 ? "empty" : booked >= slot.capacity ? "full" : booked >= slot.capacity * 0.7 ? "busy" : "filling";
          const statusConfig = {
            empty:   { label: "No bookings", bg: "#f1f5f9", color: "#94a3b8", dot: "#cbd5e1" },
            filling: { label: "Filling up",   bg: "#fef3c7", color: "#d97706", dot: "#fbbf24" },
            busy:    { label: "Almost full",  bg: "#dcfce7", color: "#16a34a", dot: "#4ade80" },
            full:    { label: "Full",          bg: "#dbeafe", color: "#1a3a8f", dot: "#60a5fa" },
          }[status];
          const progColor = status === "empty" ? "#cbd5e1" : status === "filling" ? "#fbbf24" : status === "busy" ? "#4ade80" : "#60a5fa";
          const boardedCount = passengers.filter(p => p.status === "boarded").reduce((s, p) => s + p.seats, 0);

          return (
            <div key={slot.id} style={{ animation: `fadeUp ${0.3 + idx * 0.04}s ease forwards`, opacity: 0, background: "white", borderRadius: 18, marginBottom: 12, overflow: "hidden", boxShadow: isOpen ? "0 8px 32px rgba(26,58,143,0.15)" : "0 2px 12px rgba(26,58,143,0.06)", border: isOpen ? "1.5px solid #4a7bf7" : "1.5px solid transparent", transition: "all 0.3s" }}>

              {/* Slot header */}
              <div onClick={() => booked > 0 && onTogglePax(slot.id)} style={{ padding: "16px 20px", cursor: booked > 0 ? "pointer" : "default", display: "flex", alignItems: "center", gap: 16 }}>

                {/* Time */}
                <div style={{ background: booked > 0 ? "linear-gradient(135deg, #1a3a8f, #2952c4)" : "#f1f5f9", borderRadius: 14, padding: "10px 14px", textAlign: "center", minWidth: 64, flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: booked > 0 ? "white" : "#94a3b8", letterSpacing: -0.5 }}>{slot.departure_time.slice(0, 5)}</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#0d1f5c" }}>{booked} / {slot.capacity} seats</span>
                    <span style={{ background: statusConfig.bg, color: statusConfig.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusConfig.dot, display: "inline-block" }} />
                      {statusConfig.label}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: "#f1f5f9", borderRadius: 99, height: 6, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: progColor, borderRadius: 99, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                  </div>
                  {booked > 0 && boardedCount > 0 && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#16a34a", fontWeight: 500 }}>✅ {boardedCount} boarded</div>
                  )}
                </div>

                {/* Chevron */}
                {booked > 0 && (
                  <div style={{ color: "#94a3b8", fontSize: 18, transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</div>
                )}
              </div>

              {/* Passenger list */}
              {isOpen && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "0 20px 16px", animation: "fadeUp 0.2s ease forwards" }}>
                  {isLoading ? (
                    <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>Loading passengers...</div>
                  ) : passengers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>No passenger details available</div>
                  ) : (
                    <>
                      <div style={{ padding: "12px 0 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>Passengers</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{passengers.filter(p => p.status === "boarded").length}/{passengers.length} boarded</span>
                      </div>
                      {passengers.map(p => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: p.status === "boarded" ? "#f0fdf4" : "#f8faff", borderRadius: 12, marginBottom: 8, border: p.status === "boarded" ? "1px solid #bbf7d0" : "1px solid #e8efff", transition: "all 0.2s" }}>

                          {/* Avatar */}
                          <div style={{ width: 38, height: 38, background: p.status === "boarded" ? "linear-gradient(135deg, #16a34a, #4ade80)" : "linear-gradient(135deg, #1a3a8f, #4a7bf7)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                            {p.commuter_name.charAt(0)}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#0d1f5c", marginBottom: 2 }}>{p.commuter_name}</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>{p.booking_ref}</span>
                              <span style={{ background: "#e8efff", color: "#1a3a8f", borderRadius: 6, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>{p.seats} seat{p.seats > 1 ? "s" : ""}</span>
                            </div>
                          </div>

                          {/* Board button */}
                          {p.status === "confirmed" ? (
                            <button onClick={() => onBoard(p.id, slot.id)} disabled={boardingId === p.id}
                              style={{ background: boardingId === p.id ? "rgba(22,163,74,0.5)" : "linear-gradient(135deg, #16a34a, #4ade80)", border: "none", borderRadius: 10, color: "white", fontWeight: 700, fontSize: 13, padding: "8px 14px", cursor: boardingId === p.id ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(22,163,74,0.3)", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                              {boardingId === p.id ? "..." : "✓ Board"}
                            </button>
                          ) : (
                            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, color: "#16a34a", fontWeight: 600, fontSize: 12, padding: "8px 12px", whiteSpace: "nowrap" }}>
                              ✅ Boarded
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* FOOTER */}
        <div style={{ textAlign: "center", padding: "20px 0 10px", color: "#94a3b8", fontSize: 12 }}>
          Q-Less Driver App · {dash.date} · {dash.driver.taxi_plate}
        </div>
      </div>
    </div>
  );
}
