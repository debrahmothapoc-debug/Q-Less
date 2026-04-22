import { useState, useEffect, useCallback, useRef } from “react”;

// ─── API CLIENT ───────────────────────────────────────────────────────────────
const API_BASE = “http://localhost:5000/api”; // ← change to your deployed URL in production

const api = {
_token: null,

setToken(t) { this._token = t; if (t) localStorage.setItem(“ql_token”, t); else localStorage.removeItem(“ql_token”); },
getToken() { return this._token || localStorage.getItem(“ql_token”); },

async request(method, path, body) {
const headers = { “Content-Type”: “application/json” };
const token = this.getToken();
if (token) headers[“Authorization”] = `Bearer ${token}`;
const res = await fetch(`${API_BASE}${path}`, {
method,
headers,
body: body ? JSON.stringify(body) : undefined,
});
const data = await res.json();
if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || “Something went wrong”);
return data;
},

get:    (path)        => api.request(“GET”,    path),
post:   (path, body)  => api.request(“POST”,   path, body),
delete: (path)        => api.request(“DELETE”, path),
patch:  (path, body)  => api.request(“PATCH”,  path, body),
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
@import url(‘https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap’);

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
–blue: #1a3a8f; –blue-mid: #2952c4; –blue-light: #4a7bf7;
–blue-pale: #e8efff; –white: #fff; –off-white: #f5f7ff;
–gray: #6b7280; –gray-light: #e5e7eb; –text: #0f1b4c;
–green: #16a34a; –green-light: #dcfce7;
–red: #dc2626;   –red-light: #fee2e2;
–amber: #d97706; –amber-light: #fef3c7;
–shadow: 0 4px 24px rgba(26,58,143,0.12);
–shadow-lg: 0 8px 40px rgba(26,58,143,0.18);
}

body { font-family: ‘DM Sans’, sans-serif; background: var(–off-white); color: var(–text); min-height: 100vh; }
.app  { min-height: 100vh; display: flex; flex-direction: column; }

/* NAV */
.nav { background: var(–blue); padding: 0 24px; display: flex; align-items: center;
justify-content: space-between; height: 64px; position: sticky; top: 0; z-index: 100;
box-shadow: 0 2px 20px rgba(26,58,143,0.3); }
.nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.nav-logo-icon { width: 36px; height: 36px; background: white; border-radius: 10px;
display: flex; align-items: center; justify-content: center;
font-family: ‘Syne’, sans-serif; font-weight: 800; color: var(–blue); font-size: 14px; }
.nav-logo-text { font-family: ‘Syne’, sans-serif; font-weight: 800; color: white; font-size: 20px; letter-spacing: -0.5px; }
.nav-logo-sub  { color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase; }
.nav-right { display: flex; align-items: center; gap: 6px; }
.nav-tabs  { display: flex; gap: 4px; }
.nav-tab   { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
font-family: ‘DM Sans’, sans-serif; font-size: 14px; font-weight: 500;
color: rgba(255,255,255,0.7); background: transparent; transition: all 0.2s; }
.nav-tab:hover  { color: white; background: rgba(255,255,255,0.1); }
.nav-tab.active { background: white; color: var(–blue); }
.nav-badge { background: #f59e0b; color: white; border-radius: 20px;
font-size: 10px; font-weight: 700; padding: 2px 7px; margin-left: 6px; }
.nav-user { display: flex; align-items: center; gap: 8px;
background: rgba(255,255,255,0.1); border-radius: 20px; padding: 6px 12px; }
.nav-user-name { color: white; font-size: 13px; font-weight: 500; }
.nav-user-role { color: rgba(255,255,255,0.6); font-size: 11px; }
.nav-btn-sm { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
color: white; border-radius: 8px; padding: 6px 12px; cursor: pointer;
font-size: 13px; font-weight: 500; transition: all 0.2s; }
.nav-btn-sm:hover { background: rgba(255,255,255,0.25); }

/* HERO */
.hero { background: linear-gradient(135deg, var(–blue) 0%, var(–blue-mid) 60%, var(–blue-light) 100%);
padding: 48px 24px 60px; position: relative; overflow: hidden; }
.hero::before { content:’’; position:absolute; top:-40px; right:-60px;
width:300px; height:300px; background:rgba(255,255,255,0.05); border-radius:50%; }
.hero::after  { content:’’; position:absolute; bottom:-80px; left:30%;
width:400px; height:200px; background:rgba(255,255,255,0.03); border-radius:50%; }
.hero-tag { display:inline-block; background:rgba(255,255,255,0.15); color:rgba(255,255,255,0.9);
border:1px solid rgba(255,255,255,0.2); border-radius:20px; padding:4px 14px;
font-size:12px; font-weight:500; letter-spacing:0.5px; margin-bottom:16px; }
.hero-title { font-family:‘Syne’,sans-serif; font-weight:800;
font-size:clamp(26px,5vw,40px); color:white; line-height:1.1;
margin-bottom:12px; letter-spacing:-1px; }
.hero-title span { color:#93c5fd; }
.hero-sub   { color:rgba(255,255,255,0.75); font-size:15px; max-width:480px; line-height:1.6; margin-bottom:28px; }
.hero-stats { display:flex; gap:24px; flex-wrap:wrap; }
.hero-stat  { text-align:center; }
.hero-stat-num   { font-family:‘Syne’,sans-serif; font-weight:800; font-size:24px; color:white; }
.hero-stat-label { font-size:11px; color:rgba(255,255,255,0.6); letter-spacing:0.5px; text-transform:uppercase; }

/* CONTENT */
.content { padding: 28px 20px; max-width: 700px; margin: 0 auto; width: 100%; flex: 1; }

/* CARDS */
.card { background:white; border-radius:16px; box-shadow:var(–shadow);
border:1px solid rgba(26,58,143,0.06); margin-bottom:20px; overflow:hidden; }
.card-header { padding:20px 24px 16px; border-bottom:1px solid var(–gray-light);
display:flex; align-items:center; gap:12px; }
.card-icon  { width:40px; height:40px; border-radius:10px; background:var(–blue-pale);
display:flex; align-items:center; justify-content:center; font-size:18px; }
.card-title { font-family:‘Syne’,sans-serif; font-weight:700; font-size:17px; color:var(–text); }
.card-sub   { font-size:13px; color:var(–gray); margin-top:2px; }
.card-body  { padding:20px 24px; }

/* STEP INDICATOR */
.steps { display:flex; gap:0; margin-bottom:28px; }
.step  { flex:1; display:flex; align-items:center; }
.step-circle { width:28px; height:28px; border-radius:50%; display:flex; align-items:center;
justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; transition:all 0.3s; }
.step-circle.done    { background:var(–blue); color:white; }
.step-circle.active  { background:var(–blue-light); color:white; box-shadow:0 0 0 4px rgba(74,123,247,0.2); }
.step-circle.pending { background:var(–gray-light); color:var(–gray); }
.step-label        { font-size:11px; font-weight:500; color:var(–gray); margin-left:8px; white-space:nowrap; }
.step-label.active { color:var(–blue); }
.step-line      { flex:1; height:2px; background:var(–gray-light); margin:0 8px; }
.step-line.done { background:var(–blue); }

/* FORM */
.form-group  { margin-bottom:18px; }
.form-label  { font-size:13px; font-weight:500; color:var(–text); margin-bottom:6px; display:block; }
.form-input, .form-select { width:100%; padding:11px 14px; border-radius:10px;
border:1.5px solid var(–gray-light); font-family:‘DM Sans’,sans-serif;
font-size:14px; color:var(–text); background:white; appearance:none;
transition:border-color 0.2s, box-shadow 0.2s; outline:none; }
.form-input:focus, .form-select:focus { border-color:var(–blue-light); box-shadow:0 0 0 3px rgba(74,123,247,0.12); }
.form-hint { font-size:12px; color:var(–gray); margin-top:4px; }
.form-error { font-size:12px; color:var(–red); margin-top:4px; }

/* TIME SLOTS */
.time-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.time-slot { border-radius:10px; padding:10px 6px; border:1.5px solid var(–gray-light);
cursor:pointer; text-align:center; transition:all 0.2s; background:white; font-family:‘DM Sans’,sans-serif; }
.time-slot:hover:not(.full) { border-color:var(–blue-light); background:var(–blue-pale); }
.time-slot.selected { border-color:var(–blue); background:var(–blue); color:white; }
.time-slot.full { background:var(–gray-light); cursor:not-allowed; opacity:0.6; }
.time-slot-time  { font-size:13px; font-weight:600; }
.time-slot-avail { font-size:10px; margin-top:2px; }
.time-slot.selected .time-slot-avail { color:rgba(255,255,255,0.8); }
.avail-good { color:var(–green); } .avail-low { color:var(–amber); } .avail-none { color:var(–red); }

/* SEAT SELECTOR */
.seat-selector { display:flex; align-items:center; gap:16px; }
.seat-btn { width:40px; height:40px; border-radius:50%; border:2px solid var(–blue);
background:white; color:var(–blue); font-size:20px; cursor:pointer;
display:flex; align-items:center; justify-content:center; font-weight:700; transition:all 0.15s; }
.seat-btn:hover { background:var(–blue); color:white; }
.seat-btn:disabled { border-color:var(–gray-light); color:var(–gray); cursor:not-allowed; }
.seat-btn:disabled:hover { background:white; color:var(–gray); }
.seat-count { font-family:‘Syne’,sans-serif; font-weight:800; font-size:28px; color:var(–blue); min-width:40px; text-align:center; }

/* BUTTONS */
.btn { padding:13px 24px; border-radius:12px; border:none; cursor:pointer;
font-family:‘DM Sans’,sans-serif; font-weight:600; font-size:15px;
transition:all 0.2s; display:inline-flex; align-items:center; justify-content:center; gap:8px; }
.btn-primary   { background:var(–blue); color:white; width:100%; }
.btn-primary:hover { background:var(–blue-mid); box-shadow:0 4px 16px rgba(26,58,143,0.3); transform:translateY(-1px); }
.btn-secondary { background:var(–blue-pale); color:var(–blue); }
.btn-secondary:hover { background:#d0dcff; }
.btn-danger    { background:var(–red-light); color:var(–red); }
.btn-danger:hover { background:#fecaca; }
.btn:disabled  { opacity:0.5; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
.btn-sm { padding:8px 16px; font-size:13px; border-radius:8px; }

/* ROUTE CARD */
.route-card { border:1.5px solid var(–gray-light); border-radius:12px; padding:16px;
cursor:pointer; transition:all 0.2s; margin-bottom:10px; background:white; }
.route-card:hover    { border-color:var(–blue-light); box-shadow:0 2px 12px rgba(26,58,143,0.1); }
.route-card.selected { border-color:var(–blue); background:var(–blue-pale); }
.route-top  { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.route-from { font-weight:600; font-size:14px; }
.route-arrow { color:var(–blue-light); font-size:18px; }
.route-to   { font-weight:600; font-size:14px; }
.route-meta { display:flex; gap:8px; flex-wrap:wrap; }
.route-badge { display:inline-flex; align-items:center; gap:4px; background:var(–blue-pale);
color:var(–blue); border-radius:6px; padding:3px 8px; font-size:12px; font-weight:500; }

/* CONFIRM BOX */
.confirm-box { background:linear-gradient(135deg,var(–blue) 0%,var(–blue-mid) 100%);
border-radius:16px; padding:28px; color:white; text-align:center; margin-bottom:20px; }
.confirm-ref { font-family:‘Syne’,sans-serif; font-weight:800; font-size:32px;
letter-spacing:2px; margin:12px 0; }
.confirm-sub { color:rgba(255,255,255,0.75); font-size:14px; }
.confirm-detail { background:rgba(255,255,255,0.1); border-radius:10px; padding:16px; margin:16px 0; text-align:left; }
.confirm-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:14px; }
.confirm-row:not(:last-child) { border-bottom:1px solid rgba(255,255,255,0.1); }
.confirm-row-label { color:rgba(255,255,255,0.65); }
.confirm-row-val   { font-weight:600; }
.qr-box { width:80px; height:80px; background:white; border-radius:12px;
margin:12px auto; display:flex; align-items:center; justify-content:center; font-size:36px; }

/* DRIVER DASHBOARD */
.dash-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
.dash-stat { background:white; border-radius:12px; padding:16px;
border:1px solid rgba(26,58,143,0.08); text-align:center; box-shadow:var(–shadow); }
.dash-stat-num   { font-family:‘Syne’,sans-serif; font-weight:800; font-size:28px; color:var(–blue); }
.dash-stat-label { font-size:11px; color:var(–gray); margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }
.trip-card { background:white; border-radius:14px; padding:18px;
box-shadow:var(–shadow); border:1px solid rgba(26,58,143,0.06); margin-bottom:12px; }
.trip-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.trip-time   { font-family:‘Syne’,sans-serif; font-weight:800; font-size:22px; color:var(–blue); }
.trip-status { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
.status-confirmed { background:var(–green-light); color:var(–green); }
.status-filling   { background:var(–amber-light); color:var(–amber); }
.status-empty     { background:var(–gray-light);  color:var(–gray); }
.progress-bar-wrap { background:var(–gray-light); border-radius:8px; height:10px; margin:10px 0; overflow:hidden; }
.progress-bar { height:100%; border-radius:8px; transition:width 0.5s; }
.prog-green { background:linear-gradient(90deg,var(–green),#4ade80); }
.prog-blue  { background:linear-gradient(90deg,var(–blue),var(–blue-light)); }
.prog-amber { background:linear-gradient(90deg,var(–amber),#fbbf24); }
.commuter-list { display:flex; flex-direction:column; gap:6px; margin-top:10px; }
.commuter-item { display:flex; align-items:center; justify-content:space-between;
background:var(–off-white); border-radius:8px; padding:8px 12px; font-size:13px; }
.commuter-name  { font-weight:500; }
.commuter-ref   { color:var(–gray); font-size:11px; font-family:monospace; }
.commuter-seats { background:var(–blue-pale); color:var(–blue); border-radius:6px; padding:2px 8px; font-size:12px; font-weight:600; }

/* ALERTS */
.alert { border-radius:10px; padding:12px 16px; font-size:13px;
display:flex; align-items:flex-start; gap:10px; margin-bottom:16px; }
.alert-info    { background:var(–blue-pale); color:var(–blue);  border:1px solid rgba(26,58,143,0.15); }
.alert-success { background:var(–green-light); color:var(–green); border:1px solid rgba(22,163,74,0.2); }
.alert-error   { background:var(–red-light);  color:var(–red);  border:1px solid rgba(220,38,38,0.2); }

/* AUTH MODAL */
.modal-overlay { position:fixed; inset:0; background:rgba(15,27,76,0.5);
display:flex; align-items:center; justify-content:center; z-index:200; padding:20px; }
.modal { background:white; border-radius:20px; padding:32px; width:100%; max-width:400px;
box-shadow:var(–shadow-lg); }
.modal-title { font-family:‘Syne’,sans-serif; font-weight:800; font-size:22px;
color:var(–text); margin-bottom:4px; }
.modal-sub { font-size:14px; color:var(–gray); margin-bottom:24px; }
.modal-tabs { display:flex; background:var(–off-white); border-radius:10px; padding:4px; margin-bottom:24px; }
.modal-tab  { flex:1; padding:8px; border:none; border-radius:8px; cursor:pointer;
font-family:‘DM Sans’,sans-serif; font-size:14px; font-weight:500; background:transparent; color:var(–gray); transition:all 0.2s; }
.modal-tab.active { background:white; color:var(–blue); box-shadow:0 2px 8px rgba(0,0,0,0.08); }

/* LOADING */
.spinner { width:20px; height:20px; border:2px solid rgba(255,255,255,0.3);
border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
.spinner-blue { border-color:rgba(26,58,143,0.2); border-top-color:var(–blue); }
@keyframes spin { to { transform:rotate(360deg); } }
.skeleton { background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* MISC */
.divider  { height:1px; background:var(–gray-light); margin:20px 0; }
.flex     { display:flex; } .justify-between { justify-content:space-between; }
.items-center { align-items:center; } .gap-2 { gap:8px; }
.section-title { font-family:‘Syne’,sans-serif; font-weight:700; font-size:18px;
color:var(–text); margin-bottom:16px; }
.free-badge { display:inline-flex; align-items:center; gap:6px; background:var(–green-light);
color:var(–green); border-radius:20px; padding:5px 14px; font-size:13px; font-weight:600;
border:1px solid rgba(22,163,74,0.2); }
.booking-item { border:1.5px solid var(–gray-light); border-radius:12px; padding:16px;
margin-bottom:12px; background:white; }
.booking-top  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
.booking-ref  { font-family:‘Syne’,sans-serif; font-weight:700; font-size:16px; color:var(–blue); }
.booking-time-chip { background:var(–blue); color:white; border-radius:8px; padding:4px 10px; font-size:13px; font-weight:600; }
.booking-route  { font-size:13px; color:var(–gray); margin-bottom:8px; }
.booking-footer { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

@media (max-width:480px) {
.time-grid { grid-template-columns:repeat(3,1fr); }
.dash-grid { grid-template-columns:repeat(3,1fr); }
.nav-tabs  { display:none; }
.hero { padding:32px 20px 44px; }
}
`;

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Spinner({ blue }) {
return <span className={`spinner${blue ? " spinner-blue" : ""}`} />;
}

function Alert({ type = “info”, children }) {
const icons = { info: “ℹ️”, success: “✅”, error: “❌” };
return <div className={`alert alert-${type}`}><span>{icons[type]}</span><span>{children}</span></div>;
}

function SkeletonCard() {
return (
<div className="card" style={{marginBottom:12}}>
<div className=“card-body” style={{display:“flex”,flexDirection:“column”,gap:10}}>
<div className=“skeleton” style={{height:18,width:“60%”}} />
<div className=“skeleton” style={{height:14,width:“80%”}} />
<div className=“skeleton” style={{height:14,width:“40%”}} />
</div>
</div>
);
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onAuth, onClose }) {
const [tab, setTab] = useState(“login”);
const [form, setForm] = useState({ name:””, phone:””, password:””, role:“commuter” });
const [loading, setLoading] = useState(false);
const [error, setError] = useState(””);

const set = (k, v) => setForm(f => ({ …f, [k]: v }));

async function submit() {
setError(””); setLoading(true);
try {
const data = tab === “login”
? await api.post(”/auth/login”,    { phone: form.phone, password: form.password })
: await api.post(”/auth/register”, form);
api.setToken(data.token);
onAuth(data.user, data.token);
} catch (e) {
setError(e.message);
} finally {
setLoading(false);
}
}

return (
<div className=“modal-overlay” onClick={e => e.target === e.currentTarget && onClose()}>
<div className="modal">
<div className="modal-title">Welcome to Q-Less 🚌</div>
<div className="modal-sub">Sign in or create a free account</div>
<div className="modal-tabs">
<button className={`modal-tab ${tab==="login"?"active":""}`} onClick={()=>setTab(“login”)}>Login</button>
<button className={`modal-tab ${tab==="register"?"active":""}`} onClick={()=>setTab(“register”)}>Register</button>
</div>
{error && <Alert type="error">{error}</Alert>}
{tab === “register” && (
<div className="form-group">
<label className="form-label">Full Name</label>
<input className=“form-input” placeholder=“e.g. Nomsa Dlamini” value={form.name} onChange={e=>set(“name”,e.target.value)} />
</div>
)}
<div className="form-group">
<label className="form-label">Phone Number</label>
<input className=“form-input” placeholder=“e.g. 0721234567” value={form.phone} onChange={e=>set(“phone”,e.target.value)} />
</div>
<div className="form-group">
<label className="form-label">Password</label>
<input className=“form-input” type=“password” placeholder={tab===“register”?“Min 6 characters”:””} value={form.password} onChange={e=>set(“password”,e.target.value)}
onKeyDown={e=>e.key===“Enter”&&submit()} />
</div>
{tab === “register” && (
<div className="form-group">
<label className="form-label">I am a…</label>
<select className=“form-select” value={form.role} onChange={e=>set(“role”,e.target.value)}>
<option value="commuter">Commuter (book rides)</option>
<option value="driver">Driver (manage my route)</option>
</select>
</div>
)}
<button className="btn btn-primary" onClick={submit} disabled={loading}>
{loading ? <Spinner /> : tab===“login” ? “Login” : “Create Account”}
</button>
<button className=“btn btn-secondary” style={{width:“100%”,marginTop:10}} onClick={onClose}>
Continue as Guest
</button>
</div>
</div>
);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function QlessApp() {
// Auth
const [user, setUser]           = useState(null);
const [showAuth, setShowAuth]   = useState(false);

// Navigation
const [view, setView]           = useState(“commuter”); // commuter | mybookings | driver

// Booking flow
const [step, setStep]           = useState(1);
const [routes, setRoutes]       = useState([]);
const [selectedRoute, setSelectedRoute] = useState(null);
const [slots, setSlots]         = useState([]);
const [selectedSlot, setSelectedSlot]   = useState(null);
const [seats, setSeats]         = useState(1);
const [name, setName]           = useState(””);
const [phone, setPhone]         = useState(””);
const [confirmedBooking, setConfirmedBooking] = useState(null);

// My bookings
const [myBookings, setMyBookings]   = useState([]);

// Driver
const [driverDash, setDriverDash]   = useState(null);
const [expandedSlot, setExpandedSlot] = useState(null);
const [passengers, setPassengers]   = useState({});

// UI states
const [loading, setLoading]   = useState(false);
const [error, setError]       = useState(””);
const [slotsLoading, setSlotsLoading] = useState(false);

// ── Boot: restore session ──────────────────────────────
useEffect(() => {
const token = api.getToken();
if (!token) return;
api.get(”/auth/me”)
.then(u => setUser(u))
.catch(() => api.setToken(null));
}, []);

// ── Load routes on mount ───────────────────────────────
useEffect(() => {
api.get(”/routes”)
.then(setRoutes)
.catch(e => setError(e.message));
}, []);

// ── Load time slots when route selected ───────────────
useEffect(() => {
if (!selectedRoute) return;
setSlotsLoading(true);
setSelectedSlot(null);
const today = new Date().toISOString().slice(0, 10);
api.get(`/routes/${selectedRoute}/slots?date=${today}`)
.then(setSlots)
.catch(e => setError(e.message))
.finally(() => setSlotsLoading(false));
}, [selectedRoute]);

// ── Load my bookings ───────────────────────────────────
useEffect(() => {
if (view !== “mybookings” || !user) return;
setLoading(true);
api.get(”/bookings/my”)
.then(setMyBookings)
.catch(e => setError(e.message))
.finally(() => setLoading(false));
}, [view, user]);

// ── Load driver dashboard ──────────────────────────────
useEffect(() => {
if (view !== “driver” || !user || user.role !== “driver”) return;
setLoading(true);
api.get(”/driver/dashboard”)
.then(setDriverDash)
.catch(e => setError(e.message))
.finally(() => setLoading(false));
}, [view, user]);

// ── Handle booking submission ──────────────────────────
async function handleBook() {
setError(””); setLoading(true);
try {
const body = { time_slot_id: selectedSlot.id, seats };
if (!user) { body.name = name; body.phone = phone; }
const data = await api.post(”/bookings”, body);
setConfirmedBooking(data);
setStep(4);
} catch (e) {
setError(e.message);
} finally {
setLoading(false);
}
}

// ── Cancel a booking ───────────────────────────────────
async function handleCancel(bookingId) {
if (!confirm(“Cancel this booking?”)) return;
try {
await api.delete(`/bookings/${bookingId}`);
setMyBookings(prev => prev.filter(b => b.id !== bookingId));
} catch (e) {
setError(e.message);
}
}

// ── Load passengers for a driver slot ─────────────────
async function loadPassengers(slotId) {
if (passengers[slotId]) { setExpandedSlot(expandedSlot === slotId ? null : slotId); return; }
try {
const data = await api.get(`/driver/slots/${slotId}/passengers`);
setPassengers(prev => ({ …prev, [slotId]: data }));
setExpandedSlot(slotId);
} catch (e) { setError(e.message); }
}

// ── Board a passenger ─────────────────────────────────
async function boardPassenger(bookingId, slotId) {
try {
await api.patch(`/driver/bookings/${bookingId}/board`);
// Refresh passengers for that slot
const data = await api.get(`/driver/slots/${slotId}/passengers`);
setPassengers(prev => ({ …prev, [slotId]: data }));
} catch (e) { setError(e.message); }
}

function resetBooking() {
setStep(1); setSelectedRoute(null); setSelectedSlot(null);
setSlots([]); setSeats(1); setName(””); setPhone(””);
setConfirmedBooking(null); setError(””);
}

function logout() {
api.setToken(null); setUser(null);
setView(“commuter”); resetBooking();
}

const route = routes.find(r => r.id === selectedRoute);

// ── RENDER ─────────────────────────────────────────────
return (
<>
<style>{styles}</style>
<div className="app">

```
    {/* AUTH MODAL */}
    {showAuth && (
      <AuthModal
        onAuth={(u) => { setUser(u); setShowAuth(false); if (u.role === "driver") setView("driver"); }}
        onClose={() => setShowAuth(false)}
      />
    )}

    {/* NAV */}
    <nav className="nav">
      <div className="nav-logo" onClick={() => { setView("commuter"); resetBooking(); }}>
        <div className="nav-logo-icon">QL</div>
        <div>
          <div className="nav-logo-text">Q-Less</div>
          <div className="nav-logo-sub">Skip the queue</div>
        </div>
      </div>
      <div className="nav-right">
        <div className="nav-tabs">
          <button className={`nav-tab ${view==="commuter"?"active":""}`}
            onClick={() => { setView("commuter"); resetBooking(); }}>🚌 Book</button>
          <button className={`nav-tab ${view==="mybookings"?"active":""}`}
            onClick={() => user ? setView("mybookings") : setShowAuth(true)}>
            My Rides {myBookings.length > 0 && <span className="nav-badge">{myBookings.length}</span>}
          </button>
          {user?.role === "driver" && (
            <button className={`nav-tab ${view==="driver"?"active":""}`}
              onClick={() => setView("driver")}>🚖 Dashboard</button>
          )}
        </div>
        {user ? (
          <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8}}>
            <div className="nav-user">
              <div>
                <div className="nav-user-name">{user.name.split(" ")[0]}</div>
                <div className="nav-user-role">{user.role}</div>
              </div>
            </div>
            <button className="nav-btn-sm" onClick={logout}>Logout</button>
          </div>
        ) : (
          <button className="nav-btn-sm" style={{marginLeft:8}} onClick={() => setShowAuth(true)}>Login</button>
        )}
      </div>
    </nav>

    {/* ════════════════════════════════════════════════ */}
    {/*  COMMUTER BOOKING FLOW                          */}
    {/* ════════════════════════════════════════════════ */}
    {view === "commuter" && (
      <>
        <div className="hero">
          <div className="hero-tag">🇿🇦 Proudly South African</div>
          <h1 className="hero-title">No more <span>long queues</span> at the rank</h1>
          <p className="hero-sub">Book your taxi seat in advance. Choose your time. Board stress-free.</p>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-num">{routes.length || 5}</div><div className="hero-stat-label">Live Routes</div></div>
            <div className="hero-stat"><div className="hero-stat-num">100%</div><div className="hero-stat-label">Free to Book</div></div>
            <div className="hero-stat"><div className="hero-stat-num">15</div><div className="hero-stat-label">Seats / Taxi</div></div>
          </div>
        </div>

        <div className="content">
          {error && <Alert type="error">{error}</Alert>}

          {/* Step indicator */}
          <div className="steps">
            {["Route","Time","Details","Done"].map((label, i) => {
              const num = i + 1;
              const state = step > num ? "done" : step === num ? "active" : "pending";
              return (
                <div key={label} className="step">
                  {i > 0 && <div className={`step-line ${step > num ? "done" : ""}`} />}
                  <div className={`step-circle ${state}`}>{step > num ? "✓" : num}</div>
                  <span className={`step-label ${state==="active"?"active":""}`}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Choose Route ── */}
          {step === 1 && (
            <div className="card">
              <div className="card-header">
                <div className="card-icon">🗺️</div>
                <div><div className="card-title">Choose Your Route</div>
                <div className="card-sub">Select where you're travelling today</div></div>
              </div>
              <div className="card-body">
                <Alert type="info">
                  Q-Less is <strong>completely free</strong> for commuters. Pay the driver as normal when you board.
                </Alert>
                {routes.length === 0
                  ? [1,2,3].map(i => <SkeletonCard key={i} />)
                  : routes.map(r => (
                    <div key={r.id}
                      className={`route-card ${selectedRoute===r.id?"selected":""}`}
                      onClick={() => setSelectedRoute(r.id)}>
                      <div className="route-top">
                        <span className="route-from">{r.from_place}</span>
                        <span className="route-arrow">→</span>
                        <span className="route-to">{r.to_place}</span>
                      </div>
                      <div className="route-meta">
                        <span className="route-badge">⏱ {r.duration_min} min</span>
                        <span className="route-badge">💰 R{r.fare_rands}</span>
                        <span className="route-badge">👤 {r.driver_name}</span>
                        <span className="route-badge">⭐ {r.rating}</span>
                      </div>
                    </div>
                  ))
                }
                <button className="btn btn-primary" disabled={!selectedRoute}
                  onClick={() => setStep(2)}>Next: Choose Time →</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Choose Time Slot ── */}
          {step === 2 && route && (
            <div className="card">
              <div className="card-header">
                <div className="card-icon">🕐</div>
                <div><div className="card-title">Choose Your Time Slot</div>
                <div className="card-sub">{route.from_place} → {route.to_place}</div></div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">How many seats do you need?</label>
                  <div className="seat-selector">
                    <button className="seat-btn" disabled={seats<=1} onClick={() => setSeats(s=>s-1)}>−</button>
                    <div className="seat-count">{seats}</div>
                    <button className="seat-btn" disabled={seats>=4} onClick={() => setSeats(s=>s+1)}>+</button>
                    <span style={{fontSize:13,color:"var(--gray)"}}>seat{seats>1?"s":""} (max 4)</span>
                  </div>
                </div>
                <div className="divider" />
                <p className="form-label" style={{marginBottom:12}}>Available time slots:</p>
                {slotsLoading
                  ? <div style={{textAlign:"center",padding:20}}><Spinner blue /></div>
                  : slots.length === 0
                  ? <Alert type="info">No slots available for today on this route.</Alert>
                  : (
                    <div className="time-grid">
                      {slots.map(s => {
                        const avail = parseInt(s.available_seats);
                        const isFull = avail < seats;
                        const isLow  = avail <= 4 && !isFull;
                        return (
                          <div key={s.id}
                            className={`time-slot ${isFull?"full":""} ${selectedSlot?.id===s.id?"selected":""}`}
                            onClick={() => !isFull && setSelectedSlot(s)}>
                            <div className="time-slot-time">{s.departure_time.slice(0,5)}</div>
                            <div className={`time-slot-avail ${isFull?"avail-none":isLow?"avail-low":"avail-good"}`}>
                              {isFull ? "Full" : `${avail} left`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                }
                <div className="divider" />
                <div style={{display:"flex",gap:10}}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" disabled={!selectedSlot} onClick={() => setStep(3)}>
                    Next: Your Details →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Details ── */}
          {step === 3 && (
            <div className="card">
              <div className="card-header">
                <div className="card-icon">👤</div>
                <div><div className="card-title">Your Details</div>
                <div className="card-sub">Almost done — just need your info</div></div>
              </div>
              <div className="card-body">
                {user ? (
                  <Alert type="success">Logged in as <strong>{user.name}</strong> — your details are pre-filled.</Alert>
                ) : (
                  <>
                    <Alert type="info">
                      Booking as guest. <button style={{background:"none",border:"none",color:"var(--blue)",cursor:"pointer",fontWeight:600,padding:0}} onClick={() => setShowAuth(true)}>Login for faster checkout</button>
                    </Alert>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" placeholder="e.g. Nomsa Dlamini" value={name} onChange={e=>setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" placeholder="e.g. 0721234567" value={phone} onChange={e=>setPhone(e.target.value)} />
                      <p className="form-hint">You'll receive an SMS confirmation</p>
                    </div>
                  </>
                )}
                <div className="divider" />
                {/* Summary */}
                <div style={{background:"var(--blue-pale)",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
                  <p style={{fontFamily:"Syne",fontWeight:700,fontSize:14,color:"var(--blue)",marginBottom:8}}>Booking Summary</p>
                  {[
                    ["Route",   `${route?.from_place} → ${route?.to_place}`],
                    ["Time",    selectedSlot?.departure_time?.slice(0,5)],
                    ["Seats",   `${seats} seat${seats>1?"s":""}`],
                    ["Driver",  route?.driver_name],
                    ["Taxi",    route?.taxi_plate],
                    ["Fare",    `R${route?.fare_rands} p/p (pay driver on boarding)`],
                  ].map(([k, v]) => (
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0"}}>
                      <span style={{color:"var(--gray)"}}>{k}</span>
                      <span style={{fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                  <div style={{marginTop:10,textAlign:"center"}}>
                    <span className="free-badge">✓ Free to book — no app charges</span>
                  </div>
                </div>
                {error && <Alert type="error">{error}</Alert>}
                <div style={{display:"flex",gap:10}}>
                  <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary"
                    disabled={loading || (!user && (!name || !phone))}
                    onClick={handleBook}>
                    {loading ? <><Spinner /> Booking…</> : "🎫 Confirm Booking"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Confirmation ── */}
          {step === 4 && confirmedBooking && (
            <>
              <div className="confirm-box">
                <div style={{fontSize:40}}>🎉</div>
                <p style={{opacity:0.8,fontSize:14}}>Booking Confirmed!</p>
                <div className="confirm-ref">{confirmedBooking.booking.booking_ref}</div>
                <p className="confirm-sub">Show this reference to your driver when boarding</p>
                <div className="qr-box">📱</div>
                <div className="confirm-detail">
                  {[
                    ["Route",     `${confirmedBooking.slot.from_place} → ${confirmedBooking.slot.to_place}`],
                    ["Time",      confirmedBooking.slot.departure_time?.slice(0,5)],
                    ["Date",      confirmedBooking.slot.slot_date],
                    ["Seats",     `${confirmedBooking.booking.seats} seat${confirmedBooking.booking.seats>1?"s":""}`],
                    ["Driver",    route?.driver_name],
                    ["Taxi",      route?.taxi_plate],
                    ["Pay on boarding", `R${confirmedBooking.slot.fare_rands} per person`],
                  ].map(([k, v]) => (
                    <div key={k} className="confirm-row">
                      <span className="confirm-row-label">{k}</span>
                      <span className="confirm-row-val">{v}</span>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:12,opacity:0.65}}>SMS confirmation sent to your number</p>
              </div>
              <Alert type="success">
                <strong>You're all set!</strong> Please arrive at the rank 5 minutes before your slot.
              </Alert>
              <div style={{display:"flex",gap:10}}>
                <button className="btn btn-primary" onClick={resetBooking}>Book Another Ride</button>
                {user && (
                  <button className="btn btn-secondary" style={{width:"auto"}} onClick={() => setView("mybookings")}>
                    View My Rides
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </>
    )}

    {/* ════════════════════════════════════════════════ */}
    {/*  MY BOOKINGS                                    */}
    {/* ════════════════════════════════════════════════ */}
    {view === "mybookings" && (
      <>
        <div className="hero" style={{padding:"32px 24px 40px"}}>
          <h1 className="hero-title" style={{fontSize:28}}>My Rides</h1>
          <p className="hero-sub">All your upcoming and past Q-Less bookings</p>
        </div>
        <div className="content">
          {!user ? (
            <div className="card">
              <div className="card-body" style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:48,marginBottom:12}}>🔒</div>
                <p style={{fontFamily:"Syne",fontWeight:700,fontSize:18,marginBottom:8}}>Login to view your rides</p>
                <button className="btn btn-primary" style={{width:"auto"}} onClick={()=>setShowAuth(true)}>Login / Register</button>
              </div>
            </div>
          ) : loading ? (
            [1,2,3].map(i => <SkeletonCard key={i} />)
          ) : myBookings.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:48,marginBottom:12}}>🚌</div>
                <p style={{fontFamily:"Syne",fontWeight:700,fontSize:18,marginBottom:8}}>No bookings yet</p>
                <p style={{color:"var(--gray)",fontSize:14,marginBottom:20}}>Book your first ride and skip the queue!</p>
                <button className="btn btn-primary" style={{width:"auto"}} onClick={()=>setView("commuter")}>Book a Ride</button>
              </div>
            </div>
          ) : myBookings.map(b => (
            <div className="booking-item" key={b.id}>
              <div className="booking-top">
                <div>
                  <div className="booking-ref">{b.booking_ref}</div>
                  <div className="booking-route">{b.from_place} → {b.to_place}</div>
                </div>
                <div className="booking-time-chip">{b.departure_time?.slice(0,5)}</div>
              </div>
              <div className="booking-footer">
                <span className="route-badge">📅 {b.slot_date}</span>
                <span className="route-badge">👤 {b.seats} seat{b.seats>1?"s":""}</span>
                <span className="route-badge">🚖 {b.driver_name}</span>
                <span className={`route-badge ${b.status==="cancelled"?"":""}` } style={b.status==="cancelled"?{background:"var(--red-light)",color:"var(--red)"}:b.status==="boarded"?{background:"var(--green-light)",color:"var(--green)"}:{}}>
                  {b.status === "confirmed" ? "✓ Confirmed" : b.status === "boarded" ? "✅ Boarded" : "✕ Cancelled"}
                </span>
                {b.status === "confirmed" && (
                  <button className="btn btn-danger btn-sm" onClick={()=>handleCancel(b.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {/* ════════════════════════════════════════════════ */}
    {/*  DRIVER DASHBOARD                               */}
    {/* ════════════════════════════════════════════════ */}
    {view === "driver" && (
      <>
        <div className="hero" style={{padding:"32px 24px 40px"}}>
          <div className="hero-tag">🚖 Driver Portal</div>
          <h1 className="hero-title" style={{fontSize:28}}>Driver Dashboard</h1>
          <p className="hero-sub">Today's confirmed passengers and trip overview</p>
        </div>
        <div className="content">
          {!user || user.role !== "driver" ? (
            <div className="card">
              <div className="card-body" style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:48,marginBottom:12}}>🚖</div>
                <p style={{fontFamily:"Syne",fontWeight:700,fontSize:18,marginBottom:8}}>Driver access only</p>
                <p style={{color:"var(--gray)",fontSize:14,marginBottom:20}}>Login with a driver account to view your dashboard</p>
                <button className="btn btn-primary" style={{width:"auto"}} onClick={()=>setShowAuth(true)}>Driver Login</button>
              </div>
            </div>
          ) : loading ? (
            [1,2,3].map(i => <SkeletonCard key={i} />)
          ) : driverDash ? (
            <>
              {/* Driver info card */}
              <div className="card" style={{marginBottom:16}}>
                <div className="card-body" style={{padding:"16px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:50,height:50,background:"var(--blue-pale)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🚖</div>
                    <div style={{flex:1}}>
                      <p style={{fontFamily:"Syne",fontWeight:700,fontSize:16}}>{driverDash.driver.name}</p>
                      <p style={{fontSize:13,color:"var(--gray)"}}>{driverDash.driver.route}</p>
                      <p style={{fontSize:13,color:"var(--gray)"}}>Taxi: {driverDash.driver.taxi_plate} · ⭐ {driverDash.driver.rating}</p>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"Syne",fontWeight:800,fontSize:18,color:"var(--green)"}}>{driverDash.summary.estimated_earnings}</div>
                      <div style={{fontSize:11,color:"var(--gray)"}}>est. today</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary stats */}
              <div className="dash-grid">
                <div className="dash-stat">
                  <div className="dash-stat-num">{driverDash.summary.total_booked_seats}</div>
                  <div className="dash-stat-label">Booked Seats</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-num" style={{color:"var(--green)"}}>{driverDash.summary.confirmed_trips}</div>
                  <div className="dash-stat-label">With Bookings</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-num" style={{color:"var(--amber)"}}>{driverDash.summary.open_slots}</div>
                  <div className="dash-stat-label">Open Slots</div>
                </div>
              </div>

              {/* Slots */}
              <p className="section-title">Today's Schedule — {driverDash.date}</p>
              {driverDash.slots.map(s => {
                const booked = parseInt(s.booked_seats);
                const pct    = Math.round((booked / s.capacity) * 100);
                const status = booked === 0 ? "empty" : booked >= 12 ? "confirmed" : "filling";
                const isOpen = expandedSlot === s.id;
                const pax    = passengers[s.id];
                return (
                  <div className="trip-card" key={s.id}>
                    <div className="trip-header">
                      <span className="trip-time">{s.departure_time.slice(0,5)}</span>
                      <span className={`trip-status status-${status}`}>
                        {status==="empty"?"No bookings":status==="confirmed"?"Almost full":"Filling up"}
                      </span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--gray)",marginBottom:4}}>
                      <span>{booked} / {s.capacity} seats booked</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className={`progress-bar ${pct>=80?"prog-green":pct>=40?"prog-blue":"prog-amber"}`}
                        style={{width:`${pct}%`}} />
                    </div>
                    {booked > 0 && (
                      <button className="btn btn-secondary btn-sm" style={{marginTop:10}}
                        onClick={() => loadPassengers(s.id)}>
                        {isOpen ? "▲ Hide passengers" : `▼ View ${booked} passenger${booked>1?"s":""}`}
                      </button>
                    )}
                    {isOpen && pax && (
                      <div className="commuter-list">
                        {pax.passengers.map(p => (
                          <div className="commuter-item" key={p.id}>
                            <div>
                              <span className="commuter-name">{p.commuter_name}</span>
                              <span className="commuter-ref" style={{marginLeft:8}}>{p.booking_ref}</span>
                            </div>
                            <div style={{display:"flex",gap:8,alignItems:"center"}}>
                              <span className="commuter-seats">{p.seats} seat{p.seats>1?"s":""}</span>
                              {p.status === "confirmed" && (
                                <button className="btn btn-sm"
                                  style={{background:"var(--green-light)",color:"var(--green)",padding:"4px 10px",fontSize:12}}
                                  onClick={() => boardPassenger(p.id, s.id)}>
                                  ✓ Board
                                </button>
                              )}
                              {p.status === "boarded" && (
                                <span style={{fontSize:12,color:"var(--green)",fontWeight:600}}>✅ Boarded</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <Alert type="error">Could not load dashboard. Please try again.</Alert>
          )}
        </div>
      </>
    )}

  </div>
</>
```

);
}
