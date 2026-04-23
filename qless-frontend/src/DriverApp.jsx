 import { useState, useEffect } from "react";
const API = "https://qless-api-een4.onrender.com/api";
const api = {
  token: () => localStorage.getItem("ql_token"),
  setToken: (t) => t ? localStorage.setItem("ql_token", t) : localStorage.removeItem("
  async req(method, path, body) {
    const h = { "Content-Type": "application/json" };
    if (api.token()) h["Authorization"] = "Bearer " + api.token();
    const r = await fetch(API + path, { method, headers: h, body: body ? JSON.stringif
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
  driver: { name: "Sipho Dlamini", taxi_plate: "GP 34-56 AB", route: "Soweto (Bara) →
  summary: { total_booked_seats: 47, confirmed_trips: 8, open_slots: 6, estimated_earn
  date: new Date().toISOString().slice(0, 10),
  slots: [
    { id: "s1", departure_time: "05:00:00", capacity: 15, booked_seats: 0, booking_cou
    { id: "s2", departure_time: "05:30:00", capacity: 15, booked_seats: 3, booking_cou
    { id: "s3", departure_time: "06:00:00", capacity: 15, booked_seats: 7, booking_cou
    { id: "s4", departure_time: "06:30:00", capacity: 15, booked_seats: 12, booking_co
    { id: "s5", departure_time: "07:00:00", capacity: 15, booked_seats: 15, booking_co
    { id: "s6", departure_time: "07:30:00", capacity: 15, booked_seats: 10, booking_co
    { id: "s7", departure_time: "08:00:00", capacity: 15, booked_seats: 0, booking_cou
    { id: "s8", departure_time: "15:00:00", capacity: 15, booked_seats: 5, booking_cou
    { id: "s9", departure_time: "15:30:00", capacity: 15, booked_seats: 8, booking_cou
    { id: "s10", departure_time: "16:00:00", capacity: 15, booked_seats: 14, booking_c
    { id: "s11", departure_time: "16:30:00", capacity: 15, booked_seats: 15, booking_c
    { id: "s12", departure_time: "17:00:00", capacity: 15, booked_seats: 2, booking_co
], };
const MOCK_PAX = {
  s3: [{ id: "b1", booking_ref: "QL-A3K2", commuter_name: "Nomsa Dlamini", phone: "072
  s4: [{ id: "b4", booking_ref: "QL-D2QR", commuter_name: "Kagiso Sithole", phone: "07
ql_toke
y(body)
Johanne
ings: "
nt: 0 }
nt: 1 }
nt: 3 }
unt: 5
unt: 6
unt: 4
nt: 0 }
nt: 2 }
nt: 3 }
ount: 6
ount: 7
unt: 1
***4567
3***442
   s5: [{ id: "b8", booking_ref: "QL-H4AB", commuter_name: "Tumi Mthembu", phone: "084*
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
      api.get("/auth/me").then(u => { setUser(u); setScreen("dashboard"); loadDash();
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
**3344"
}).catc

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
    if (pax[slotId]) { setExpandedSlot(expandedSlot === slotId ? null : slotId); retur
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
      setPax(p => ({ ...p, [slotId]: p[slotId].map(px => px.id === bookingId ? { ...px
    } finally { setBoardingId(null); }
  }
  function logout() { api.setToken(null); setUser(null); setDash(null); setScreen("log
  const totalBoarded = dash ? dash.slots.reduce((sum, s) => { const p = pax[s.id] || [
  if (screen === "login") return <LoginScreen phone={phone} setPhone={setPhone} passwo
  if (!dash) return <LoadingScreen />;
  return <Dashboard user={user} dash={dash} expandedSlot={expandedSlot} pax={pax} paxL
}
// ── LOGIN ─────────────────────────────────────────────────
function LoginScreen({ phone, setPhone, password, setPassword, loading, error, onLogin
n; }
, statu
in"); s
]; retu
rd={pas
oading=
}) {

   return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%,
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translat
      {/* Logo */}
      <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: 32, text
<div style={{ width: 80, height: 80, background: "linear-gradient(135deg, #4a7 <spanstyle={{fontSize:36}}> </span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 32, color: "white", letterSpacing: -1
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 3,
</div>
      {/* Card */}
      <div style={{ animation: "fadeUp 0.5s ease forwards", background: "rgba(255,255,
        <h2 style={{ color: "white", fontWeight: 700, fontSize: 22, marginBottom: 6 }}
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 28 }}>
        {error && <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 50
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0
            style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,25
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 50
          <input type="password" value={password} onChange={e => setPassword(e.target.
            style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,25
        </div>
        <button onClick={onLogin} disabled={loading}
          style={{ width: "100%", padding: "14px", background: loading ? "rgba(74,123,
          {loading ? "Signing in..." : "Sign In →"}
</button>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12,
      </div>
</div> );
}
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%,
      <div style={{ textAlign: "center", color: "white" }}>
  #1a3a8
eY(-8px
Align:
bf7, #1
 }}>Q-L
textTra
255,0.0
>Welcom
Sign in
rgba(2
0, disp
7110000
5,0.08)
0, disp
value)}
5,0.08)
247,0.5
margin
#1a3a8

         <div style={{ fontSize: 48, marginBottom: 16, animation: "float 1s ease-in-out
        <p style={{ opacity: 0.6 }}>Loading dashboard...</p>
      </div>
</div> );
}
// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ user, dash, expandedSlot, pax, paxLoading, boardingId, totalBoard
  const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeri
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "system-ui, s
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;trans
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar{width:0}
`}</style>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0d1f5c 0%, #1a3a8f 60%, #295
        <div style={{ maxWidth: 700, margin: "0 auto", height: 64, display: "flex", al
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.15)",
            <div>
              <div style={{ fontWeight: 800, color: "white", fontSize: 17, letterSpaci
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacin
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 20, padd
              {user?.name?.split(" ")[0]}
            </div>
            <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.1)", b
              Logout
            </button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* HERO STATS */}
        <div style={{ background: "linear-gradient(135deg, #1a3a8f 0%, #2952c4 100%)",
<div style={{ marginBottom: 20 }}>
infini
ed, onT
c", mon
ans-ser
form:tr
2c4 100
ignItem
border
ng: -0. g: 0.5
ing: "6
order:
border

     <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, letterSpacing: 1
    <h1 style={{ color: "white", fontWeight: 800, fontSize: 26, letterSpacing:
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8
      <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, p
      <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, p
      {useMock && <span style={{ background: "rgba(255,200,0,0.2)", borderRadi
    </div>
  </div>
  {/* Stat cards */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1
{[
{label:"Booked",value:dash.summary.total_booked_seats,icon:" ",c {label:"Trips",value:dash.summary.confirmed_trips,icon:" ",color {label:"Open",value:dash.summary.open_slots,icon:" ",color:"#fc {label:"Earnings",value:dash.summary.estimated_earnings,icon:" ",
    ].map(s => (
      <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderR
        <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
        <div style={{ fontWeight: 800, fontSize: s.small ? 13 : 22, color: s.c
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransf
</div> ))}
  </div>
</div>
{/* SECTION TITLE */}
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-be
  <h2 style={{ fontWeight: 800, fontSize: 20, color: "#0d1f5c", letterSpacing:
  <span style={{ background: "#1a3a8f", color: "white", borderRadius: 20, padd
</div>
{/* SLOTS */}
{dash.slots.map((slot, idx) => {
  const booked = parseInt(slot.booked_seats);
  const pct = Math.round((booked / slot.capacity) * 100);
  const isOpen = expandedSlot === slot.id;
  const passengers = pax[slot.id] || [];
  const isLoading = paxLoading[slot.id];
  const status = booked === 0 ? "empty" : booked >= slot.capacity ? "full" : b
  const statusConfig = {
    empty:   { label: "No bookings", bg: "#f1f5f9", color: "#94a3b8", dot: "#c
    filling: { label: "Filling up",   bg: "#fef3c7", color: "#d97706", dot: "#
    busy:    { label: "Almost full",  bg: "#dcfce7", color: "#16a34a", dot: "#
    full:    { label: "Full",          bg: "#dbeafe", color: "#1a3a8f", dot: "
  }[status];
  const progColor = status === "empty" ? "#cbd5e1" : status === "filling" ? "#
   , textT -0.5,
}}>
adding:
adding:
us: 20,
0 }}>
olor:
: "#86
d34d"
color
adius:
olor, l
orm: "u
tween",
 -0.5 }
ing: "4
ooked >
bd5e1"
fbbf24"
4ade80"
#60a5fa
fbbf24"
 " e } :

 const boardedCount = passengers.filter(p => p.status === "boarded").reduce((
return (
  <div key={slot.id} style={{ animation: `fadeUp ${0.3 + idx * 0.04}s ease f
    {/* Slot header */}
    <div onClick={() => booked > 0 && onTogglePax(slot.id)} style={{ padding
      {/* Time */}
      <div style={{ background: booked > 0 ? "linear-gradient(135deg, #1a3a8
        <div style={{ fontWeight: 800, fontSize: 18, color: booked > 0 ? "wh
      </div>
      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginB
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0d1f5c" }}>
          <span style={{ background: statusConfig.bg, color: statusConfig.co
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgro
            {statusConfig.label}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ background: "#f1f5f9", borderRadius: 99, height: 6, ov
          <div style={{ width: pct + "%", height: "100%", background: progCo
        </div>
        {booked > 0 && boardedCount > 0 && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#16a34a", fontWe
)} </div>
      {/* Chevron */}
      {booked > 0 && (
        <div style={{ color: "#94a3b8", fontSize: 18, transition: "transform
      )}
</div>
    {/* Passenger list */}
    {isOpen && (
      <div style={{ borderTop: "1px solid #f1f5f9", padding: "0 20px 16px",
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 20, color: "#94a3b8",
        ) : passengers.length === 0 ? (
<div style={{ textAlign: "center", padding: 20, color: "#94a3b8", ):(
          <>
            <div style={{ padding: "12px 0 8px", display: "flex", justifyCon
s, p) =
orwards
: "16px
f, #295 ite" :
ottom:
{booked
lor, bo
und: st
erflow:
lor, bo
ight: 5
0.3s",
animati
fontSiz
fontSiz
tent: "

                     <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8"
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{passengers.f
                  </div>
                  {passengers.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center"
                      {/* Avatar */}
                      <div style={{ width: 38, height: 38, background: p.status ==
                        {p.commuter_name.charAt(0)}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#0d1f
                        <div style={{ display: "flex", gap: 8, alignItems: "center
                          <span style={{ fontFamily: "monospace", fontSize: 11, co
                          <span style={{ background: "#e8efff", color: "#1a3a8f",
                        </div>
</div>
                      {/* Board button */}
                      {p.status === "confirmed" ? (
<button onClick={() => onBoard(p.id, slot.id)} disabled={b style={{ background: boardingId === p.id ? "rgba(22,163, {boardingId === p.id ? "..." : "✓ Board"}
</button> ):(
                        <div style={{ background: "#f0fdf4", border: "1px solid #b
                             Boarded
</div> )}
</div> ))}
</> )}
</div> )}
</div> );
})}
    {/* FOOTER */}
    <div style={{ textAlign: "center", padding: "20px 0 10px", color: "#94a3b8", f
      Q-Less Driver App · {dash.date} · {dash.driver.taxi_plate}
    </div>
  </div>
</div>
 , lette
ilter(p
, gap:
= "boar
5c", ma
" }}>
lor: "#
borderR
oarding
74,0.5)
bf7d0",
ontSize

 
