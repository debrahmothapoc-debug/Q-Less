import { useState, useEffect } from “react”;

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : “/api”;

const api = {
token: () => localStorage.getItem(“ql_token”),
setToken: (t) => t ? localStorage.setItem(“ql_token”, t) : localStorage.removeItem(“ql_token”),
async req(method, path, body) {
const h = { “Content-Type”: “application/json” };
if (api.token()) h[“Authorization”] = `Bearer ${api.token()}`;
const r = await fetch(`${API}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
const d = await r.json();
if (!r.ok) throw new Error(d.error || “Something went wrong”);
return d;
},
get: (p) => api.req(“GET”, p),
post: (p, b) => api.req(“POST”, p, b),
del: (p) => api.req(“DELETE”, p),
patch: (p, b) => api.req(“PATCH”, p, b),
};

const S = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); *,*::before,*::after{box-sizing:border-box;margin:0;padding:0} :root{--bl:#1a3a8f;--bm:#2952c4;--bl2:#4a7bf7;--bp:#e8efff;--gr:#6b7280;--gl:#e5e7eb;--tx:#0f1b4c;--gn:#16a34a;--gnl:#dcfce7;--rd:#dc2626;--rdl:#fee2e2;--am:#d97706;--aml:#fef3c7;--sh:0 4px 24px rgba(26,58,143,.12)} body{font-family:'DM Sans',sans-serif;background:#f5f7ff;color:var(--tx);min-height:100vh} .app{min-height:100vh;display:flex;flex-direction:column} .nav{background:var(--bl);padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:62px;position:sticky;top:0;z-index:100;box-shadow:0 2px 16px rgba(26,58,143,.4)} .nl{display:flex;align-items:center;gap:9px;cursor:pointer} .ni{width:34px;height:34px;background:white;border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;color:var(--bl);font-size:13px} .nt{font-family:'Syne',sans-serif;font-weight:800;color:white;font-size:19px} .ns{color:rgba(255,255,255,.55);font-size:10px;letter-spacing:1px;text-transform:uppercase} .nr{display:flex;align-items:center;gap:5px} .ntab{padding:7px 13px;border-radius:7px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,.65);background:transparent;transition:all .2s} .ntab:hover{color:white;background:rgba(255,255,255,.1)} .ntab.on{background:white;color:var(--bl)} .nbdg{background:#f59e0b;color:white;border-radius:20px;font-size:9px;font-weight:700;padding:1px 5px;margin-left:3px} .nchip{background:rgba(255,255,255,.15);border-radius:16px;padding:4px 10px;color:white;font-size:12px;font-weight:500} .nbtn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.2);color:white;border-radius:7px;padding:5px 11px;cursor:pointer;font-size:12px;font-weight:500} .hero{background:linear-gradient(135deg,var(--bl) 0%,var(--bm) 60%,var(--bl2) 100%);padding:36px 22px 48px;position:relative;overflow:hidden} .hero::before{content:'';position:absolute;top:-30px;right:-40px;width:220px;height:220px;background:rgba(255,255,255,.05);border-radius:50%} .htag{display:inline-block;background:rgba(255,255,255,.15);color:rgba(255,255,255,.9);border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:3px 13px;font-size:11px;font-weight:500;margin-bottom:14px} .htitle{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:white;line-height:1.1;margin-bottom:10px;letter-spacing:-1px} .htitle span{color:#93c5fd} .hsub{color:rgba(255,255,255,.72);font-size:13px;line-height:1.6;margin-bottom:22px} .hstats{display:flex;gap:22px} .hsn{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:white} .hsl{font-size:10px;color:rgba(255,255,255,.55);letter-spacing:.5px;text-transform:uppercase} .con{padding:22px 18px;max-width:680px;margin:0 auto;width:100%;flex:1} .card{background:white;border-radius:14px;box-shadow:var(--sh);border:1px solid rgba(26,58,143,.06);margin-bottom:16px;overflow:hidden} .ch{padding:16px 20px 14px;border-bottom:1px solid var(--gl);display:flex;align-items:center;gap:10px} .ci{width:36px;height:36px;border-radius:9px;background:var(--bp);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0} .ct{font-family:'Syne',sans-serif;font-weight:700;font-size:15px} .cs{font-size:12px;color:var(--gr);margin-top:1px} .cb{padding:16px 20px} .steps{display:flex;margin-bottom:22px} .step{flex:1;display:flex;align-items:center} .sc{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;transition:all .3s} .sc.done{background:var(--bl);color:white} .sc.active{background:var(--bl2);color:white;box-shadow:0 0 0 3px rgba(74,123,247,.2)} .sc.pend{background:var(--gl);color:var(--gr)} .slb{font-size:10px;font-weight:500;color:var(--gr);margin-left:6px;white-space:nowrap} .slb.on{color:var(--bl)} .sln{flex:1;height:2px;background:var(--gl);margin:0 6px} .sln.done{background:var(--bl)} .fg{margin-bottom:14px} .fl{font-size:12px;font-weight:500;margin-bottom:5px;display:block} .fi,.fsel{width:100%;padding:10px 12px;border-radius:9px;border:1.5px solid var(--gl);font-family:'DM Sans',sans-serif;font-size:13px;background:white;appearance:none;outline:none;transition:border-color .2s} .fi:focus,.fsel:focus{border-color:var(--bl2);box-shadow:0 0 0 3px rgba(74,123,247,.1)} .tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px} .ts{border-radius:9px;padding:9px 4px;border:1.5px solid var(--gl);cursor:pointer;text-align:center;transition:all .2s;background:white} .ts:hover:not(.full){border-color:var(--bl2);background:var(--bp)} .ts.sel{border-color:var(--bl);background:var(--bl);color:white} .ts.full{background:var(--gl);cursor:not-allowed;opacity:.6} .tst{font-size:12px;font-weight:600} .tsa{font-size:9px;margin-top:2px} .ts.sel .tsa{color:rgba(255,255,255,.8)} .ag{color:var(--gn)}.aw{color:var(--am)}.ar{color:var(--rd)} .ss{display:flex;align-items:center;gap:14px} .sb{width:36px;height:36px;border-radius:50%;border:2px solid var(--bl);background:white;color:var(--bl);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700;transition:all .15s} .sb:hover{background:var(--bl);color:white} .sb:disabled{border-color:var(--gl);color:var(--gr);cursor:not-allowed} .sc2{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:var(--bl);min-width:36px;text-align:center} .btn{padding:11px 20px;border-radius:11px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:7px} .bp{background:var(--bl);color:white;width:100%} .bp:hover{background:var(--bm);box-shadow:0 4px 14px rgba(26,58,143,.3);transform:translateY(-1px)} .bsc{background:var(--bp);color:var(--bl)} .bsc:hover{background:#d0dcff} .bdn{background:var(--rdl);color:var(--rd)} .btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important} .btn-sm{padding:7px 13px;font-size:12px;border-radius:8px} .rc{border:1.5px solid var(--gl);border-radius:11px;padding:14px;cursor:pointer;transition:all .2s;margin-bottom:9px;background:white} .rc:hover{border-color:var(--bl2);box-shadow:0 2px 10px rgba(26,58,143,.1)} .rc.sel{border-color:var(--bl);background:var(--bp)} .rt{display:flex;align-items:center;gap:8px;margin-bottom:7px} .rf,.rto{font-weight:600;font-size:13px} .ra{color:var(--bl2);font-size:16px} .rm{display:flex;gap:6px;flex-wrap:wrap} .rbdg{display:inline-flex;align-items:center;gap:3px;background:var(--bp);color:var(--bl);border-radius:5px;padding:2px 7px;font-size:11px;font-weight:500} .cbox{background:linear-gradient(135deg,var(--bl) 0%,var(--bm) 100%);border-radius:14px;padding:24px;color:white;text-align:center;margin-bottom:16px} .cref{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;letter-spacing:2px;margin:10px 0} .csub{color:rgba(255,255,255,.72);font-size:13px} .cdet{background:rgba(255,255,255,.1);border-radius:9px;padding:14px;margin:14px 0;text-align:left} .crow{display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:13px} .crow:not(:last-child){border-bottom:1px solid rgba(255,255,255,.1)} .crl{color:rgba(255,255,255,.62)} .crv{font-weight:600} .qr{width:68px;height:68px;background:white;border-radius:11px;margin:10px auto;display:flex;align-items:center;justify-content:center;font-size:30px} .dgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px} .dstat{background:white;border-radius:11px;padding:14px;border:1px solid rgba(26,58,143,.08);text-align:center;box-shadow:var(--sh)} .dsn{font-family:'Syne',sans-serif;font-weight:800;font-size:24px;color:var(--bl)} .dsl{font-size:10px;color:var(--gr);margin-top:1px;text-transform:uppercase;letter-spacing:.4px} .tc{background:white;border-radius:13px;padding:15px;box-shadow:var(--sh);border:1px solid rgba(26,58,143,.06);margin-bottom:10px} .th{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px} .tt{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;color:var(--bl)} .tst2{padding:3px 10px;border-radius:16px;font-size:11px;font-weight:600} .s-c{background:var(--gnl);color:var(--gn)} .s-f{background:var(--aml);color:var(--am)} .s-e{background:var(--gl);color:var(--gr)} .pw{background:var(--gl);border-radius:7px;height:9px;margin:9px 0;overflow:hidden} .pb{height:100%;border-radius:7px;transition:width .5s} .pg{background:linear-gradient(90deg,var(--gn),#4ade80)} .pbl{background:linear-gradient(90deg,var(--bl),var(--bl2))} .pa{background:linear-gradient(90deg,var(--am),#fbbf24)} .pxl{display:flex;flex-direction:column;gap:5px;margin-top:9px} .pxi{display:flex;align-items:center;justify-content:space-between;background:#f5f7ff;border-radius:7px;padding:7px 10px;font-size:12px} .pxn{font-weight:500} .pxr{color:var(--gr);font-size:10px;font-family:monospace} .pxs{background:var(--bp);color:var(--bl);border-radius:5px;padding:1px 7px;font-size:11px;font-weight:600} .al{border-radius:9px;padding:10px 13px;font-size:12px;display:flex;align-items:flex-start;gap:8px;margin-bottom:14px;line-height:1.5} .al-i{background:var(--bp);color:var(--bl);border:1px solid rgba(26,58,143,.14)} .al-s{background:var(--gnl);color:var(--gn);border:1px solid rgba(22,163,74,.2)} .al-e{background:var(--rdl);color:var(--rd);border:1px solid rgba(220,38,38,.2)} .mo{position:fixed;inset:0;background:rgba(15,27,76,.55);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px} .md{background:white;border-radius:18px;padding:26px;width:100%;max-width:400px;box-shadow:0 8px 40px rgba(26,58,143,.18)} .mdt{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;margin-bottom:3px} .mds{font-size:13px;color:var(--gr);margin-bottom:20px} .mtabs{display:flex;background:#f5f7ff;border-radius:9px;padding:4px;margin-bottom:20px} .mtab{flex:1;padding:7px;border:none;border-radius:7px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;background:transparent;color:var(--gr);transition:all .2s} .mtab.on{background:white;color:var(--bl);box-shadow:0 2px 7px rgba(0,0,0,.08)} .bi{border:1.5px solid var(--gl);border-radius:11px;padding:14px;margin-bottom:11px;background:white} .bt{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:9px} .br{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:var(--bl)} .btime{background:var(--bl);color:white;border-radius:7px;padding:3px 9px;font-size:12px;font-weight:600} .brt{font-size:12px;color:var(--gr);margin-bottom:7px} .bf{display:flex;gap:6px;flex-wrap:wrap;align-items:center} .div{height:1px;background:var(--gl);margin:16px 0} .stitle{font-family:'Syne',sans-serif;font-weight:700;font-size:16px;margin-bottom:14px} .fbdg{display:inline-flex;align-items:center;gap:5px;background:var(--gnl);color:var(--gn);border-radius:16px;padding:4px 12px;font-size:12px;font-weight:600;border:1px solid rgba(22,163,74,.2)} .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:sp .7s linear infinite;display:inline-block} .spin-b{border-color:rgba(26,58,143,.15);border-top-color:var(--bl)} @keyframes sp{to{transform:rotate(360deg)}} .sk{background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:200% 100%;animation:sh 1.4s infinite;border-radius:7px} @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}} .skc{background:white;border-radius:14px;padding:16px;margin-bottom:12px;box-shadow:var(--sh);display:flex;flex-direction:column;gap:9px} @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .fi2{animation:fu .3s ease forwards} @media(max-width:480px){.tgrid{grid-template-columns:repeat(3,1fr)}}`;

const Spin = ({ b }) => <span className={`spin${b?" spin-b":""}`}/>;
const Alert = ({ t=“i”, children }) => (

  <div className={`al al-${t==="i"?"i":t==="s"?"s":"e"}`}>
    <span>{t==="i"?"ℹ️":t==="s"?"✅":"❌"}</span><span>{children}</span>
  </div>
);
const Skel = () => (
  <div className="skc">
    <div className="sk" style={{height:14,width:"55%"}}/>
    <div className="sk" style={{height:12,width:"75%"}}/>
    <div className="sk" style={{height:12,width:"40%"}}/>
  </div>
);

function AuthModal({ onAuth, onClose }) {
const [tab, setTab] = useState(“login”);
const [form, setForm] = useState({ name:””, phone:””, password:””, role:“commuter” });
const [loading, setLoading] = useState(false);
const [err, setErr] = useState(””);
const set = (k, v) => setForm(f => ({ …f, [k]: v }));

async function submit() {
setErr(””); setLoading(true);
try {
const d = tab === “login”
? await api.post(”/auth/login”, { phone: form.phone, password: form.password })
: await api.post(”/auth/register”, form);
api.setToken(d.token);
onAuth(d.user);
} catch (e) { setErr(e.message); }
finally { setLoading(false); }
}

return (
<div className=“mo” onClick={e => e.target === e.currentTarget && onClose()}>
<div className="md">
<div className="mdt">Welcome to Q-Less 🚌</div>
<div className="mds">Sign in or create a free account</div>
<div className="mtabs">
<button className={`mtab ${tab==="login"?"on":""}`} onClick={() => setTab(“login”)}>Login</button>
<button className={`mtab ${tab==="register"?"on":""}`} onClick={() => setTab(“register”)}>Register</button>
</div>
{err && <Alert t="e">{err}</Alert>}
{tab===“register” && (
<div className="fg"><label className="fl">Full Name</label>
<input className=“fi” placeholder=“e.g. Nomsa Dlamini” value={form.name} onChange={e=>set(“name”,e.target.value)}/>
</div>
)}
<div className="fg"><label className="fl">Phone Number</label>
<input className=“fi” placeholder=“e.g. 0721234567” value={form.phone} onChange={e=>set(“phone”,e.target.value)}/>
</div>
<div className="fg"><label className="fl">Password</label>
<input className=“fi” type=“password” value={form.password} onChange={e=>set(“password”,e.target.value)} onKeyDown={e=>e.key===“Enter”&&submit()}/>
</div>
{tab===“register” && (
<div className="fg"><label className="fl">I am a…</label>
<select className=“fsel” value={form.role} onChange={e=>set(“role”,e.target.value)}>
<option value="commuter">Commuter (book rides)</option>
<option value="driver">Driver (manage route)</option>
</select>
</div>
)}
<button className="btn bp" onClick={submit} disabled={loading}>
{loading ? <Spin/> : tab===“login” ? “Login →” : “Create Account →”}
</button>
<button className=“btn bsc” style={{width:“100%”,marginTop:9}} onClick={onClose}>Continue as Guest</button>
</div>
</div>
);
}

export default function App() {
const [user, setUser]   = useState(null);
const [auth, setAuth]   = useState(false);
const [view, setView]   = useState(“book”);
const [step, setStep]   = useState(1);
const [routes, setRoutes] = useState([]);
const [selRoute, setSelRoute] = useState(null);
const [slots, setSlots] = useState([]);
const [selSlot, setSelSlot] = useState(null);
const [seats, setSeats] = useState(1);
const [gName, setGName] = useState(””);
const [gPhone, setGPhone] = useState(””);
const [done, setDone]   = useState(null);
const [myB, setMyB]     = useState([]);
const [dash, setDash]   = useState(null);
const [pax, setPax]     = useState({});
const [open, setOpen]   = useState(null);
const [loading, setLoading] = useState(false);
const [sloading, setSloading] = useState(false);
const [err, setErr]     = useState(””);

useEffect(() => {
const t = api.token();
if (t) api.get(”/auth/me”).then(setUser).catch(() => api.setToken(null));
}, []);

useEffect(() => { api.get(”/routes”).then(setRoutes).catch(e => setErr(e.message)); }, []);

useEffect(() => {
if (!selRoute) return;
setSloading(true); setSelSlot(null);
const d = new Date().toISOString().slice(0,10);
api.get(`/routes/${selRoute}/slots?date=${d}`).then(setSlots).catch(e=>setErr(e.message)).finally(()=>setSloading(false));
}, [selRoute]);

useEffect(() => {
if (view!==“rides”||!user) return;
setLoading(true);
api.get(”/bookings/my”).then(setMyB).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
}, [view, user]);

useEffect(() => {
if (view!==“driver”||!user||user.role!==“driver”) return;
setLoading(true);
api.get(”/driver/dashboard”).then(setDash).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
}, [view, user]);

async function book() {
setErr(””); setLoading(true);
try {
const b = { time_slot_id: selSlot.id, seats };
if (!user) { b.name=gName; b.phone=gPhone; }
const d = await api.post(”/bookings”, b);
setDone(d); setStep(4);
} catch(e) { setErr(e.message); }
finally { setLoading(false); }
}

async function cancel(id) {
if (!confirm(“Cancel this booking?”)) return;
try { await api.del(`/bookings/${id}`); setMyB(p=>p.filter(b=>b.id!==id)); }
catch(e) { setErr(e.message); }
}

async function loadPax(sid) {
if (pax[sid]) { setOpen(open===sid?null:sid); return; }
const d = await api.get(`/driver/slots/${sid}/passengers`);
setPax(p=>({…p,[sid]:d})); setOpen(sid);
}

async function board(bid, sid) {
await api.patch(`/driver/bookings/${bid}/board`);
const d = await api.get(`/driver/slots/${sid}/passengers`);
setPax(p=>({…p,[sid]:d}));
}

function reset() {
setStep(1); setSelRoute(null); setSelSlot(null);
setSlots([]); setSeats(1); setGName(””); setGPhone(””);
setDone(null); setErr(””);
}

function logout() { api.setToken(null); setUser(null); setView(“book”); reset(); }

const route = routes.find(r=>r.id===selRoute);

return (
<>
<style>{S}</style>
<div className="app">
{auth && <AuthModal onAuth={u=>{setUser(u);setAuth(false);if(u.role===“driver”)setView(“driver”);}} onClose={()=>setAuth(false)}/>}

```
    <nav className="nav">
      <div className="nl" onClick={()=>{setView("book");reset();}}>
        <div className="ni">QL</div>
        <div><div className="nt">Q-Less</div><div className="ns">Skip the queue</div></div>
      </div>
      <div className="nr">
        <button className={`ntab ${view==="book"?"on":""}`} onClick={()=>{setView("book");reset();}}>🚌 Book</button>
        <button className={`ntab ${view==="rides"?"on":""}`} onClick={()=>user?setView("rides"):setAuth(true)}>
          My Rides{myB.length>0&&<span className="nbdg">{myB.length}</span>}
        </button>
        {user?.role==="driver"&&<button className={`ntab ${view==="driver"?"on":""}`} onClick={()=>setView("driver")}>🚖 Dashboard</button>}
        {user?<><div className="nchip">{user.name.split(" ")[0]}</div><button className="nbtn" onClick={logout}>Logout</button></>
          :<button className="nbtn" onClick={()=>setAuth(true)}>Login</button>}
      </div>
    </nav>

    {view==="book"&&<>
      <div className="hero">
        <div className="htag">🇿🇦 Proudly South African</div>
        <h1 className="htitle">No more <span>long queues</span> at the rank</h1>
        <p className="hsub">Book your taxi seat in advance. Choose your time. Board stress-free.</p>
        <div className="hstats">
          <div><div className="hsn">{routes.length||5}</div><div className="hsl">Live Routes</div></div>
          <div><div className="hsn">100%</div><div className="hsl">Free</div></div>
          <div><div className="hsn">15</div><div className="hsl">Seats/Taxi</div></div>
        </div>
      </div>
      <div className="con">
        {err&&<Alert t="e">{err}</Alert>}
        <div className="steps">
          {["Route","Time","Details","Done"].map((l,i)=>{
            const n=i+1,s=step>n?"done":step===n?"active":"pend";
            return(<div key={l} className="step">
              {i>0&&<div className={`sln ${step>n?"done":""}`}/>}
              <div className={`sc ${s}`}>{step>n?"✓":n}</div>
              <span className={`slb ${s==="active"?"on":""}`}>{l}</span>
            </div>);
          })}
        </div>

        {step===1&&<div className="card fi2">
          <div className="ch"><div className="ci">🗺️</div><div><div className="ct">Choose Route</div><div className="cs">Where are you going?</div></div></div>
          <div className="cb">
            <Alert t="i">Booking is <strong>completely free</strong> — pay the driver on boarding as normal.</Alert>
            {routes.length===0?[1,2,3].map(i=><Skel key={i}/>):routes.map(r=>(
              <div key={r.id} className={`rc ${selRoute===r.id?"sel":""}`} onClick={()=>setSelRoute(r.id)}>
                <div className="rt"><span className="rf">{r.from_place}</span><span className="ra">→</span><span className="rto">{r.to_place}</span></div>
                <div className="rm">
                  <span className="rbdg">⏱ {r.duration_min}min</span>
                  <span className="rbdg">💰 R{r.fare_rands}</span>
                  <span className="rbdg">👤 {r.driver_name}</span>
                  <span className="rbdg">⭐ {r.rating}</span>
                </div>
              </div>
            ))}
            <button className="btn bp" disabled={!selRoute} onClick={()=>setStep(2)}>Next: Pick a Time →</button>
          </div>
        </div>}

        {step===2&&route&&<div className="card fi2">
          <div className="ch"><div className="ci">🕐</div><div><div className="ct">Pick a Time</div><div className="cs">{route.from_place} → {route.to_place}</div></div></div>
          <div className="cb">
            <div className="fg">
              <label className="fl">Seats needed?</label>
              <div className="ss">
                <button className="sb" disabled={seats<=1} onClick={()=>setSeats(s=>s-1)}>−</button>
                <div className="sc2">{seats}</div>
                <button className="sb" disabled={seats>=4} onClick={()=>setSeats(s=>s+1)}>+</button>
                <span style={{fontSize:12,color:"var(--gr)"}}>max 4</span>
              </div>
            </div>
            <div className="div"/>
            {sloading?<div style={{textAlign:"center",padding:16}}><Spin b/></div>
              :<div className="tgrid">{slots.map(s=>{
                const av=parseInt(s.available_seats),full=av<seats,low=av<=4&&!full;
                return(<div key={s.id} className={`ts ${full?"full":""} ${selSlot?.id===s.id?"sel":""}`} onClick={()=>!full&&setSelSlot(s)}>
                  <div className="tst">{s.departure_time.slice(0,5)}</div>
                  <div className={`tsa ${full?"ar":low?"aw":"ag"}`}>{full?"Full":`${av} left`}</div>
                </div>);
              })}</div>
            }
            <div className="div"/>
            <div style={{display:"flex",gap:8}}>
              <button className="btn bsc" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn bp" disabled={!selSlot} onClick={()=>setStep(3)}>Details →</button>
            </div>
          </div>
        </div>}

        {step===3&&<div className="card fi2">
          <div className="ch"><div className="ci">👤</div><div><div className="ct">Your Details</div><div className="cs">Almost done!</div></div></div>
          <div className="cb">
            {user?<Alert t="s">Logged in as <strong>{user.name}</strong> — you're all set.</Alert>:<>
              <Alert t="i"><button style={{background:"none",border:"none",color:"var(--bl)",cursor:"pointer",fontWeight:600,padding:0,fontSize:12}} onClick={()=>setAuth(true)}>Login</button> for faster checkout, or continue as guest</Alert>
              <div className="fg"><label className="fl">Full Name</label><input className="fi" placeholder="Nomsa Dlamini" value={gName} onChange={e=>setGName(e.target.value)}/></div>
              <div className="fg"><label className="fl">Phone Number</label><input className="fi" placeholder="0721234567" value={gPhone} onChange={e=>setGPhone(e.target.value)}/></div>
            </>}
            <div style={{background:"var(--bp)",borderRadius:11,padding:"12px 14px",marginBottom:14}}>
              <p style={{fontFamily:"Syne",fontWeight:700,fontSize:13,color:"var(--bl)",marginBottom:7}}>Booking Summary</p>
              {[["Route",`${route?.from_place} → ${route?.to_place}`],["Time",selSlot?.departure_time?.slice(0,5)],["Seats",`${seats} seat${seats>1?"s":""}`],["Driver",route?.driver_name],["Fare",`R${route?.fare_rands} p/p`]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0"}}>
                  <span style={{color:"var(--gr)"}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:9,textAlign:"center"}}><span className="fbdg">✓ Free to book — no app charges</span></div>
            </div>
            {err&&<Alert t="e">{err}</Alert>}
            <div style={{display:"flex",gap:8}}>
              <button className="btn bsc" onClick={()=>setStep(2)}>← Back</button>
              <button className="btn bp" disabled={loading||(!user&&(!gName||!gPhone))} onClick={book}>
                {loading?<><Spin/> Booking…</>:"🎫 Confirm Booking"}
              </button>
            </div>
          </div>
        </div>}

        {step===4&&done&&<div className="fi2">
          <div className="cbox">
            <div style={{fontSize:38}}>🎉</div>
            <p style={{opacity:.75,fontSize:13}}>Booking Confirmed!</p>
            <div className="cref">{done.booking.booking_ref}</div>
            <p className="csub">Show this reference to your driver when boarding</p>
            <div className="qr">📱</div>
            <div className="cdet">
              {[["Route",`${done.slot.from_place} → ${done.slot.to_place}`],["Time",done.slot.departure_time?.slice(0,5)],["Date",done.slot.slot_date],["Seats",`${done.booking.seats} seat${done.booking.seats>1?"s":""}`],["Driver",route?.driver_name],["Pay on boarding",`R${done.slot.fare_rands} per person`]].map(([k,v])=>(
                <div key={k} className="crow"><span className="crl">{k}</span><span className="crv">{v}</span></div>
              ))}
            </div>
            <p style={{fontSize:11,opacity:.6}}>SMS confirmation sent to your number ✓</p>
          </div>
          <Alert t="s"><strong>You're all set!</strong> Arrive 5 min early at the rank.</Alert>
          <div style={{display:"flex",gap:8}}>
            <button className="btn bp" onClick={reset}>Book Another Ride</button>
            {user&&<button className="btn bsc" style={{width:"auto"}} onClick={()=>setView("rides")}>My Rides</button>}
          </div>
        </div>}
      </div>
    </>}

    {view==="rides"&&<>
      <div className="hero" style={{padding:"30px 22px 40px"}}>
        <h1 className="htitle" style={{fontSize:26}}>My Rides</h1>
        <p className="hsub">Your upcoming and past Q-Less bookings</p>
      </div>
      <div className="con">
        {!user?<div className="card"><div className="cb" style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:44,marginBottom:12}}>🔒</div>
          <p style={{fontFamily:"Syne",fontWeight:700,fontSize:18,marginBottom:8}}>Login to view your rides</p>
          <button className="btn bp" style={{width:"auto"}} onClick={()=>setAuth(true)}>Login / Register</button>
        </div></div>
        :loading?[1,2].map(i=><Skel key={i}/>)
        :myB.length===0?<div className="card"><div className="cb" style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:44,marginBottom:12}}>🚌</div>
          <p style={{fontFamily:"Syne",fontWeight:700,fontSize:18,marginBottom:8}}>No bookings yet</p>
          <button className="btn bp" style={{width:"auto"}} onClick={()=>setView("book")}>Book a Ride</button>
        </div></div>
        :myB.map(b=>(
          <div className="bi fi2" key={b.id}>
            <div className="bt">
              <div><div className="br">{b.booking_ref}</div><div className="brt">{b.from_place} → {b.to_place}</div></div>
              <div className="btime">{b.departure_time?.slice(0,5)}</div>
            </div>
            <div className="bf">
              <span className="rbdg">📅 {b.slot_date}</span>
              <span className="rbdg">👤 {b.seats} seat{b.seats>1?"s":""}</span>
              <span className="rbdg">🚖 {b.driver_name}</span>
              <span className="rbdg" style={b.status==="boarded"?{background:"var(--gnl)",color:"var(--gn)"}:b.status==="cancelled"?{background:"var(--rdl)",color:"var(--rd)"}:{}}> 
                {b.status==="confirmed"?"✓ Confirmed":b.status==="boarded"?"✅ Boarded":"✕ Cancelled"}
              </span>
              {b.status==="confirmed"&&<button className="btn bdn btn-sm" onClick={()=>cancel(b.id)}>Cancel</button>}
            </div>
          </div>
        ))}
      </div>
    </>}

    {view==="driver"&&<>
      <div className="hero" style={{padding:"30px 22px 40px"}}>
        <div className="htag">🚖 Driver Portal</div>
        <h1 className="htitle" style={{fontSize:26}}>Driver Dashboard</h1>
        <p className="hsub">Today's confirmed passengers and trip overview</p>
      </div>
      <div className="con">
        {(!user||user.role!=="driver")?<div className="card"><div className="cb" style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:44,marginBottom:12}}>🚖</div>
          <p style={{fontFamily:"Syne",fontWeight:700,fontSize:18,marginBottom:8}}>Driver access only</p>
          <button className="btn bp" style={{width:"auto"}} onClick={()=>setAuth(true)}>Driver Login</button>
        </div></div>
        :loading?[1,2,3].map(i=><Skel key={i}/>)
        :dash&&<div className="fi2">
          <div className="card" style={{marginBottom:14}}>
            <div className="cb" style={{padding:"14px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:46,height:46,background:"var(--bp)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🚖</div>
                <div style={{flex:1}}>
                  <p style={{fontFamily:"Syne",fontWeight:700,fontSize:15}}>{dash.driver.name}</p>
                  <p style={{fontSize:12,color:"var(--gr)"}}>{dash.driver.route}</p>
                  <p style={{fontSize:12,color:"var(--gr)"}}>Taxi: {dash.driver.taxi_plate} · ⭐ {dash.driver.rating}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"Syne",fontWeight:800,fontSize:18,color:"var(--gn)"}}>{dash.summary.estimated_earnings}</div>
                  <div style={{fontSize:10,color:"var(--gr)"}}>est. today</div>
                </div>
              </div>
            </div>
          </div>
          <div className="dgrid">
            <div className="dstat"><div className="dsn">{dash.summary.total_booked_seats}</div><div className="dsl">Booked</div></div>
            <div className="dstat"><div className="dsn" style={{color:"var(--gn)"}}>{dash.summary.confirmed_trips}</div><div className="dsl">Trips</div></div>
            <div className="dstat"><div className="dsn" style={{color:"var(--am)"}}>{dash.summary.open_slots}</div><div className="dsl">Open</div></div>
          </div>
          <p className="stitle">Today — {dash.date}</p>
          {dash.slots.map(s=>{
            const bk=parseInt(s.booked_seats),pct=Math.round((bk/s.capacity)*100);
            const st=bk===0?"e":bk>=12?"c":"f";
            const isOpen=open===s.id,px=pax[s.id];
            return(<div className="tc" key={s.id}>
              <div className="th">
                <span className="tt">{s.departure_time.slice(0,5)}</span>
                <span className={`tst2 s-${st}`}>{st==="e"?"No bookings":st==="c"?"Almost full":"Filling up"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--gr)",marginBottom:3}}>
                <span>{bk}/{s.capacity} booked</span><span>{pct}%</span>
              </div>
              <div className="pw"><div className={`pb ${pct>=80?"pg":pct>=40?"pbl":"pa"}`} style={{width:`${pct}%`}}/></div>
              {bk>0&&<button className="btn bsc btn-sm" style={{marginTop:9}} onClick={()=>loadPax(s.id)}>
                {isOpen?"▲ Hide":"▼ View"} {bk} passenger{bk>1?"s":""}
              </button>}
              {isOpen&&px&&<div className="pxl">{px.passengers.map(p=>(
                <div className="pxi" key={p.id}>
                  <div><span className="pxn">{p.commuter_name}</span><span className="pxr" style={{marginLeft:6}}>{p.booking_ref}</span></div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span className="pxs">{p.seats}x</span>
                    {p.status==="confirmed"
                      ?<button className="btn btn-sm" style={{background:"var(--gnl)",color:"var(--gn)",padding:"3px 9px",fontSize:11}} onClick={()=>board(p.id,s.id)}>✓ Board</button>
                      :<span style={{fontSize:11,color:"var(--gn)",fontWeight:600}}>✅ Boarded</span>}
                  </div>
                </div>
              ))}</div>}
            </div>);
          })}
        </div>}
      </div>
    </>}
  </div>
</>
```

);
}
