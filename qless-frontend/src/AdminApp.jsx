import { useState, useEffect } from "react";

const API = "https://qless-api-een4.onrender.com/api";
const ADMIN_PIN = "QL-ADMIN-2026";

const api = {
  token: () => localStorage.getItem("ql_admin_token"),
  setToken: (t) => t ? localStorage.setItem("ql_admin_token", t) : localStorage.removeItem("ql_admin_token"),
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

// ── STYLES ────────────────────────────────────────────────
const BL  = "#1a3a8f";
const BLP = "#e8efff";
const GN  = "#16a34a";
const GNL = "#dcfce7";
const RD  = "#dc2626";
const RDL = "#fee2e2";
const GR  = "#6b7280";
const INK = "#0d1f5c";

function Tag({ children, color = BL, bg = BLP }) {
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, color = BL, disabled, small, outline }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: outline ? "white" : disabled ? "#e5e7eb" : color,
        color: outline ? color : disabled ? GR : "white",
        border: outline ? `1.5px solid ${color}` : "none",
        borderRadius: 10, padding: small ? "7px 14px" : "11px 20px",
        fontSize: small ? 12 : 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s", fontFamily: "sans-serif",
      }}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: INK, display: "block", marginBottom: 5 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "sans-serif", outline: "none", boxSizing: "border-box" }}
      />
      {hint && <div style={{ fontSize: 11, color: GR, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: INK, display: "block", marginBottom: 5 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "sans-serif", outline: "none", background: "white", boxSizing: "border-box" }}>
        {children}
      </select>
    </div>
  );
}

function Alert({ type, children }) {
  const cfg = {
    e: { bg: RDL, color: RD },
    s: { bg: GNL, color: GN },
    i: { bg: BLP, color: BL },
  }[type] || { bg: BLP, color: BL };
  return (
    <div style={{ background: cfg.bg, color: cfg.color, borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
      {children}
    </div>
  );
}

// ── PIN LOGIN ─────────────────────────────────────────────
function PinLogin({ onLogin }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  function attempt() {
    if (pin === ADMIN_PIN) { onLogin(); }
    else { setErr("Incorrect admin PIN. Please try again."); setPin(""); }
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, #0a1628 0%, #1a3a8f 50%, #0d2660 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 36, width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
        <div style={{ fontWeight: 800, fontSize: 24, color: "white", marginBottom: 6 }}>Q-Less Admin</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 28 }}>Driver Management Portal</div>
        {err && <Alert type="e">{err}</Alert>}
        <input
          type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="Enter admin PIN"
          style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "white", fontSize: 15, outline: "none", marginBottom: 14, boxSizing: "border-box", fontFamily: "sans-serif" }}
        />
        <button onClick={attempt}
          style={{ width: "100%", padding: 14, background: BL, border: "none", borderRadius: 12, color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Access Admin Panel →
        </button>
        <div style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          Hint: QL-ADMIN-2026
        </div>
      </div>
    </div>
  );
}

// ── DRIVER CARD ───────────────────────────────────────────
function DriverCard({ driver, onDeactivate }) {
  const [expanding, setExpanding] = useState(false);

  return (
    <div style={{ background: "white", borderRadius: 14, padding: 18, boxShadow: "0 2px 12px rgba(26,58,143,0.08)", border: "1.5px solid #e8efff", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Avatar */}
        <div style={{ width: 46, height: 46, background: driver.is_active !== false ? `linear-gradient(135deg, ${BL}, #4a7bf7)` : "#e5e7eb", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
          {(driver.name || "D").charAt(0).toUpperCase()}
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{driver.name}</div>
          <div style={{ fontSize: 12, color: GR, marginTop: 2 }}>{driver.phone}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <Tag>{driver.taxi_plate || "No plate"}</Tag>
            <Tag color={GN} bg={GNL}>{driver.route_name || "No route"}</Tag>
            {driver.is_active === false && <Tag color={RD} bg={RDL}>Deactivated</Tag>}
          </div>
        </div>
        {/* Actions */}
        {driver.is_active !== false && (
          <Btn small outline color={RD} onClick={() => onDeactivate(driver)}>Deactivate</Btn>
        )}
      </div>
    </div>
  );
}

// ── CREATE DRIVER FORM ────────────────────────────────────
function CreateDriverForm({ routes, onCreated }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [plate, setPlate] = useState("");
  const [routeId, setRouteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  async function create() {
    setErr(""); setSuccess("");
    if (!name || !phone || !password || !plate || !routeId) {
      setErr("Please fill in all fields."); return;
    }
    if (phone.length < 10) { setErr("Phone number must be at least 10 digits."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      // Register user as driver
      await api.post("/admin/drivers", { 
  name, 
  phone, 
  password, 
  taxi_plate: plate, 
  route_id: parseInt(routeId) 
});
      setSuccess(`✅ Driver account created for ${name}! They can now login with ${phone} and their password.`);
      setName(""); setPhone(""); setPassword(""); setPlate(""); setRouteId("");
      onCreated();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(26,58,143,0.08)", border: "1px solid rgba(26,58,143,0.06)" }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: INK, marginBottom: 6 }}>➕ Create New Driver Account</div>
      <div style={{ fontSize: 13, color: GR, marginBottom: 20 }}>Fill in the details below. The driver will use their phone number and password to login.</div>

      {err && <Alert type="e">{err}</Alert>}
      {success && <Alert type="s">{success}</Alert>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Input label="Full Name" value={name} onChange={setName} placeholder="e.g. Sipho Dlamini" />
        <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="e.g. 0711234567" hint="This is their login username" />
        <Input label="Password" value={password} onChange={setPassword} placeholder="Min 6 characters" type="password" hint="Share this with the driver securely" />
        <Input label="Taxi Plate" value={plate} onChange={setPlate} placeholder="e.g. GP 12-34 AB" />
      </div>

      <Select label="Assign Route" value={routeId} onChange={setRouteId}>
        <option value="">-- Select a route --</option>
        {routes.map(r => (
          <option key={r.id} value={r.id}>{r.from_place} → {r.to_place}</option>
        ))}
      </Select>

      <Btn onClick={create} disabled={loading} color={GN}>
        {loading ? "Creating account..." : "Create Driver Account"}
      </Btn>
    </div>
  );
}

// ── MAIN ADMIN PANEL ──────────────────────────────────────
function AdminPanel() {
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("drivers"); // drivers | create
  const [err, setErr] = useState("");
  const [deactivating, setDeactivating] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load routes always
      const r = await api.get("/routes");
      setRoutes(r);
      // Try to load drivers (may need admin endpoint)
      try {
        const d = await api.get("/admin/drivers");
        setDrivers(d);
      } catch {
        // If admin endpoint doesn't exist yet, show empty state
        setDrivers([]);
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deactivate(driver) {
    if (!confirm(`Deactivate ${driver.name}? They won't be able to login.`)) return;
    setDeactivating(driver.id);
    try {
      await api.patch(`/admin/drivers/${driver.id}/deactivate`);
      setDrivers(d => d.map(dr => dr.id === driver.id ? { ...dr, is_active: false } : dr));
    } catch (e) {
      alert("Could not deactivate: " + e.message);
    } finally {
      setDeactivating(null);
    }
  }

  const active = drivers.filter(d => d.is_active !== false);
  const inactive = drivers.filter(d => d.is_active === false);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, #0d1f5c 0%, ${BL} 60%, #2952c4 100%)`, padding: "0 20px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px rgba(13,31,92,0.4)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
            <div>
              <div style={{ fontWeight: 800, color: "white", fontSize: 17 }}>Q-Less Admin</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 0.5 }}>DRIVER MANAGEMENT</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Tag color="white" bg="rgba(255,255,255,0.15)">{active.length} Active Drivers</Tag>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 40px", animation: "fadeUp 0.4s ease forwards" }}>

        {err && <Alert type="e">{err}</Alert>}

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Drivers", value: drivers.length, icon: "👨🏾‍💼", color: BL, bg: BLP },
            { label: "Active", value: active.length, icon: "✅", color: GN, bg: GNL },
            { label: "Routes", value: routes.length, icon: "🗺️", color: "#7c3aed", bg: "#f5f3ff" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", borderRadius: 14, padding: "16px", textAlign: "center", boxShadow: "0 2px 12px rgba(26,58,143,0.07)" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 26, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: GR, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", background: "white", borderRadius: 12, padding: 4, marginBottom: 20, boxShadow: "0 2px 8px rgba(26,58,143,0.06)" }}>
          {[["drivers", "👥 All Drivers"], ["create", "➕ Create Driver"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === id ? BL : "transparent", color: tab === id ? "white" : GR, transition: "all 0.2s", fontFamily: "sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* DRIVERS TAB */}
        {tab === "drivers" && (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: GR }}>Loading drivers...</div>
            ) : drivers.length === 0 ? (
              <div style={{ background: "white", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 2px 16px rgba(26,58,143,0.07)" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>👨🏾‍💼</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: INK, marginBottom: 8 }}>No drivers yet</div>
                <div style={{ fontSize: 14, color: GR, marginBottom: 20 }}>Create your first driver account to get started</div>
                <Btn onClick={() => setTab("create")} color={GN}>➕ Create First Driver</Btn>
              </div>
            ) : (
              <>
                {active.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: GR, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Active Drivers ({active.length})</div>
                    {active.map(d => <DriverCard key={d.id} driver={d} onDeactivate={deactivate} />)}
                  </>
                )}
                {inactive.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: GR, letterSpacing: 1, textTransform: "uppercase", margin: "20px 0 10px" }}>Deactivated ({inactive.length})</div>
                    {inactive.map(d => <DriverCard key={d.id} driver={d} onDeactivate={deactivate} />)}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* CREATE TAB */}
        {tab === "create" && (
          <CreateDriverForm routes={routes} onCreated={() => { loadData(); setTab("drivers"); }} />
        )}

        {/* INSTRUCTIONS */}
        <div style={{ background: BLP, borderRadius: 14, padding: 18, marginTop: 24, borderLeft: `4px solid ${BL}` }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: BL, marginBottom: 10 }}>📋 How to onboard a new driver</div>
          {[
            "Create their account here with their name, phone number, password, taxi plate and route",
            "Share their phone number and password with them securely (WhatsApp or in person)",
            "They go to qless-frontend.onrender.com → tap Login → enter their details",
            "They'll automatically see the Driver Dashboard with their bookings",
            "Their passengers can now book their specific taxi on their route",
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: "#374151" }}>
              <span style={{ fontWeight: 700, color: BL, flexShrink: 0 }}>{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* DEMO NOTE */}
        <div style={{ background: "#fff8e1", borderRadius: 14, padding: 18, marginTop: 14, borderLeft: "4px solid #d97706" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#d97706", marginBottom: 6 }}>⚠️ Backend Note</div>
          <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
            The Create Driver feature calls your live API. The driver list requires a backend <code style={{ background: "#fde68a", padding: "1px 5px", borderRadius: 4 }}>/admin/drivers</code> endpoint which we'll add to your server.js. Until then, you can still create accounts — they just won't appear in the list above automatically.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────
export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <PinLogin onLogin={() => setAuthed(true)} />;
  return <AdminPanel />;
}
