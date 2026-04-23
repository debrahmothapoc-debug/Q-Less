import { useState, useEffect } from "react";
import DriverApp from "./DriverApp";
const BASE = "https://qless-api-een4.onrender.com/api";
const api = {
  token: () => localStorage.getItem("ql_token"),
  setToken: (t) => t ? localStorage.setItem("ql_token", t) : localStorage.removeItem("
  async req(method, path, body) {
    const h = { "Content-Type": "application/json" };
    if (api.token()) h["Authorization"] = "Bearer " + api.token();
    const r = await fetch(BASE + path, { method, headers: h, body: body ? JSON.stringi
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Something went wrong");
    return d;
  },
  get: (p) => api.req("GET", p),
  post: (p, b) => api.req("POST", p, b),
  del: (p) => api.req("DELETE", p),
  patch: (p, b) => api.req("PATCH", p, b),
};
function Alert({ t, children }) {
  const colors = {
    i: { bg:"#e8efff", color:"#1a3a8f", border:"1px solid rgba(26,58,143,0.14)" },
    s: { bg:"#dcfce7", color:"#16a34a", border:"1px solid rgba(22,163,74,0.2)" },
    e: { bg:"#fee2e2", color:"#dc2626", border:"1px solid rgba(220,38,38,0.2)" },
  };
  const c = colors[t] || colors.i;
  return (
    <div style={{borderRadius:9,padding:"10px 13px",fontSize:12,display:"flex",alignIt
      <span>{children}</span>
</div> );
}
function Skel() {
  return (
    <div style={{background:"white",borderRadius:14,padding:16,marginBottom:12,boxShad
      <div style={{height:14,width:"55%",background:"#f0f0f0",borderRadius:7}}/>
      <div style={{height:12,width:"75%",background:"#f0f0f0",borderRadius:7}}/>
</div> );
}
import { useState, useEffect } from "react";

const BASE = "https://qless-api-een4.onrender.com/api";

const api = {
  token: () => localStorage.getItem("ql_token"),
  setToken: (t) => t ? localStorage.setItem("ql_token", t) : localStorage.removeItem("ql_token"),
  async req(method, path, body) {
    const h = { "Content-Type": "application/json" };
    if (api.token()) h["Authorization"] = "Bearer " + api.token();
    const r = await fetch(BASE + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Something went wrong");
    return d;
  },
  get: (p) => api.req("GET", p),
  post: (p, b) => api.req("POST", p, b),
  del: (p) => api.req("DELETE", p),
  patch: (p, b) => api.req("PATCH", p, b),
};

function Spin() {
  return React.createElement("span", {style:{width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"sp 0.7s linear infinite",display:"inline-block"}});
}

function Alert({ t, children }) {
  const colors = {
    i: { bg:"#e8efff", color:"#1a3a8f", border:"1px solid rgba(26,58,143,0.14)" },
    s: { bg:"#dcfce7", color:"#16a34a", border:"1px solid rgba(22,163,74,0.2)" },
     e: { bg:"#fee2e2", color:"#dc2626", border:"1px solid rgba(220,38,38,0.2)" },
  };
  const c = colors[t] || colors.i;
  return (
    <div style={{borderRadius:9,padding:"10px 13px",fontSize:12,display:"flex",alignItems:"flex-start",gap:8,marginBottom:14,lineHeight:1.5,background:c.bg,color:c.color,border:c.border}}>
      <span>{children}</span>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [view, setView] = useState("book");
  const [step, setStep] = useState(1);
  const [routes, setRoutes] = useState([]);
  const [selRoute, setSelRoute] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selSlot, setSelSlot] = useState(null);
 const [seats, setSeats] = useState(1);
  const [gName, setGName] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [done, setDone] = useState(null);
  const [myB, setMyB] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sloading, setSloading] = useState(false);
  const [err, setErr] = useState("");
  const [authTab, setAuthTab] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authRole, setAuthRole] = useState("commuter");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const bl = "#1a3a8f", blp = "#e8efff", gr = "#6b7280", grl = "#e5e7eb";
  const gn = "#16a34a", gnl = "#dcfce7", am = "#d97706";
  const sh = "0 4px 24px rgba(26,58,143,0.12)";
  const card = {background:"white",borderRadius:14,boxShadow:sh,border:"1px solid rgba(26,58,143,0.06)",marginBottom:16,overflow:"hidden"};
  const inp = {width:"100%",padding:"10px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontFamily:"sans-serif",fontSize:13,background:"white",outline:"none",boxSizing:"border-box"};

  useEffect(() => {
    const t = api.token();
    if (t) api.get("/auth/me").then(setUser).catch(() => api.setToken(null));
  }, []);

useEffect(() => {
    api.get("/routes").then(setRoutes).catch(e => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!selRoute) return;
    setSloading(true); setSelSlot(null);
    const d = new Date().toISOString().slice(0,10);
    api.get("/routes/" + selRoute + "/slots?date=" + d)
      .then(setSlots).catch(e => setErr(e.message)).finally(() => setSloading(false));
  }, [selRoute]);

  useEffect(() => {
    if (view !== "rides" || !user) return;
    setLoading(true);
    api.get("/bookings/my").then(setMyB).catch(e => setErr(e.message)).finally(() => setLoading(false));
  }, [view, user]);

  async function submitAuth() {
    setAuthErr(""); setAuthLoading(true);
    try {
      const body = authTab === "login"
        ? { phone: authPhone, password: authPass }
        : { name: authName, phone: authPhone, password: authPass, role: authRole };
      const d = await api.post(authTab === "login" ? "/auth/login" : "/auth/register", body);
      api.setToken(d.token);
      setUser(d.user);
      setShowAuth(false);
     } catch(e) { setAuthErr(e.message); }
    finally { setAuthLoading(false); }
  }

  async function book() {
    setErr(""); setLoading(true);
    try {
      const b = { time_slot_id: selSlot.id, seats };
      if (!user) { b.name = gName; b.phone = gPhone; }
      const d = await api.post("/bookings", b);
      setDone(d); setStep(4);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  async function cancel(id) {
    if (!confirm("Cancel this booking?")) return;
    try { await api.del("/bookings/" + id); setMyB(p => p.filter(b => b.id !== id)); }
    catch(e) { setErr(e.message); }
  }

  function reset() {
    setStep(1); setSelRoute(null); setSelSlot(null);
    setSlots([]); setSeats(1); setGName(""); setGPhone("");
    setDone(null); setErr("");
  }

function logout() { api.setToken(null); setUser(null); setView("book"); reset(); }

  const route = routes.find(r => r.id === selRoute);

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#f5f7ff",fontFamily:"sans-serif",color:"#0f1b4c"}}>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>

      {showAuth && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,27,76,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"white",borderRadius:18,padding:26,width:"100%",maxWidth:400,boxShadow:"0 8px 40px rgba(26,58,143,0.18)"}}>
            <div style={{fontWeight:800,fontSize:20,marginBottom:3}}>Welcome to Q-Less</div>
            <div style={{fontSize:13,color:gr,marginBottom:20}}>Sign in or create a free account</div>
            <div style={{display:"flex",background:"#f5f7ff",borderRadius:9,padding:4,marginBottom:20}}>
              {["login","register"].map(t => (
                <button key={t} onClick={() => setAuthTab(t)} style={{flex:1,padding:7,border:"none",borderRadius:7,cursor:"pointer",fontSize:13,fontWeight:500,background:authTab===t?"white":"transparent",color:authTab===t?bl:gr}}>
                  {t === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>
             {authErr && <Alert t="e">{authErr}</Alert>}
            {authTab === "register" && (
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,fontWeight:500,marginBottom:5,display:"block"}}>Full Name</label>
                <input style={inp} placeholder="e.g. Nomsa Dlamini" value={authName} onChange={e => setAuthName(e.target.value)}/>
              </div>
            )}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:500,marginBottom:5,display:"block"}}>Phone Number</label>
              <input style={inp} placeholder="e.g. 0721234567" value={authPhone} onChange={e => setAuthPhone(e.target.value)}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:500,marginBottom:5,display:"block"}}>Password</label>
              <input style={inp} type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submitAuth()}/>
            </div>
            {authTab === "register" && (
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,fontWeight:500,marginBottom:5,display:"block"}}>I am a</label>
                <select style={inp} value={authRole} onChange={e => setAuthRole(e.target.value)}>
                  <option value="commuter">Commuter</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            )}
            <button onClick={submitAuth} disabled={authLoading} style={{width:"100%",padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:bl,color:"white",marginBottom:9}}>
              {authLoading ? "Loading..." : authTab === "login" ? "Login" : "Create Account"}
            </button>
            <button onClick={() => setShowAuth(false)} style={{width:"100%",padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:blp,color:bl}}>
              Continue as Guest
             </button>
          </div>
        </div>
      )}

      <nav style={{background:bl,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:62,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(26,58,143,0.4)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}} onClick={() => { setView("book"); reset(); }}>
          <div style={{width:34,height:34,background:"white",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:bl,fontSize:13}}>QL</div>
          <div>
            <div style={{fontWeight:800,color:"white",fontSize:19}}>Q-Less</div>
            <div style={{color:"rgba(255,255,255,0.55)",fontSize:10,letterSpacing:1,textTransform:"uppercase"}}>Skip the queue</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <button onClick={() => { setView("book"); reset(); }} style={{padding:"7px 13px",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,background:view==="book"?"white":"transparent",color:view==="book"?bl:"rgba(255,255,255,0.65)"}}>Book</button>
          <button onClick={() => user ? setView("rides") : setShowAuth(true)} style={{padding:"7px 13px",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,background:view==="rides"?"white":"transparent",color:view==="rides"?bl:"rgba(255,255,255,0.65)"}}>My Rides</button>
          {user
            ? <><div style={{background:"rgba(255,255,255,0.15)",borderRadius:16,padding:"4px 10px",color:"white",fontSize:12,fontWeight:500}}>{user.name.split(" ")[0]}</div>
                <button onClick={logout} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",color:"white",borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:12}}>Logout</button></>
            : <button onClick={() => setShowAuth(true)} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",color:"white",borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:12}}>Login</button>
          }
        </div>
         </nav>

      {view === "book" && <>
        <div style={{background:"linear-gradient(135deg,#1a3a8f 0%,#2952c4 60%,#4a7bf7 100%)",padding:"36px 22px 48px"}}>
          <h1 style={{fontWeight:800,fontSize:28,color:"white",lineHeight:1.1,marginBottom:10}}>No more long queues <span style={{color:"#93c5fd"}}>at the rank</span></h1>
          <p style={{color:"rgba(255,255,255,0.72)",fontSize:13,lineHeight:1.6,marginBottom:22}}>Book your taxi seat in advance. Choose your time. Board stress-free.</p>
          <div style={{display:"flex",gap:22}}>
            {[[routes.length||5,"Live Routes"],["100%","Free"],["15","Seats/Taxi"]].map(([n,l]) => (
              <div key={l}><div style={{fontWeight:800,fontSize:22,color:"white"}}>{n}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{padding:"22px 18px",maxWidth:680,margin:"0 auto",width:"100%",flex:1}}>
          {err && <Alert t="e">{err}</Alert>}
          <div style={{display:"flex",marginBottom:22}}>
            {["Route","Time","Details","Done"].map((label,i) => {
              const n=i+1, isDone=step>n, isActive=step===n;
              return (
                <div key={label} style={{flex:1,display:"flex",alignItems:"center"}}>
                  {i>0 && <div style={{flex:1,height:2,background:isDone?bl:grl,margin:"0 6px"}}/>}
                  <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,background:isDone?bl:isActive?"#4a7bf7":grl,color:isDone||isActive?"white":gr}}>{isDone?"v":n}</div>
                  <span style={{fontSize:10,fontWeight:500,color:isActive?bl:gr,marginLeft:6,whiteSpace:"nowrap"}}>{label}</span>
                </div>
              );
            })}
          </div>

          {step===1 && (
            <div style={card}>
             <div style={{padding:"16px 20px 14px",borderBottom:"1px solid "+grl,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:blp,display:"flex",alignItems:"center",justifyContent:"center"}}>R</div>
                <div><div style={{fontWeight:700,fontSize:15}}>Choose Route</div><div style={{fontSize:12,color:gr}}>Where are you going?</div></div>
              </div>
              <div style={{padding:"16px 20px"}}>
                <Alert t="i">Booking is completely free. Pay the driver on boarding.</Alert>
                {routes.length === 0 ? <div style={{textAlign:"center",padding:20,color:gr}}>Loading routes...</div> : routes.map(r => (
                  <div key={r.id} onClick={() => setSelRoute(r.id)} style={{border:"1.5px solid "+(selRoute===r.id?bl:grl),borderRadius:11,padding:14,cursor:"pointer",marginBottom:9,background:selRoute===r.id?blp:"white"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,flexWrap:"wrap"}}>
                      <span style={{fontWeight:600,fontSize:13}}>{r.from_place}</span>
                      <span style={{color:"#4a7bf7"}}>to</span>
                      <span style={{fontWeight:600,fontSize:13}}>{r.to_place}</span>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span style={{background:blp,color:bl,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:500}}>{r.duration_min} min</span>
                      <span style={{background:blp,color:bl,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:500}}>R{r.fare_rands}</span>
                      <span style={{background:blp,color:bl,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:500}}>{r.driver_name}</span>
                      <span style={{background:blp,color:bl,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:500}}>{r.rating} stars</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setStep(2)} disabled={!selRoute} style={{width:"100%",padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:bl,color:"white",opacity:selRoute?1:0.5}}>
                  Next: Pick a Time
                </button>
              </div>
            </div>
          )}
        
         {step===2 && route && (
            <div style={card}>
              <div style={{padding:"16px 20px 14px",borderBottom:"1px solid "+grl,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:blp,display:"flex",alignItems:"center",justifyContent:"center"}}>T</div>
                <div><div style={{fontWeight:700,fontSize:15}}>Pick a Time</div><div style={{fontSize:12,color:gr}}>{route.from_place} to {route.to_place}</div></div>
              </div>
              <div style={{padding:"16px 20px"}}>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:12,fontWeight:500,marginBottom:5,display:"block"}}>Seats needed?</label>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <button onClick={() => setSeats(s=>s-1)} disabled={seats<=1} style={{width:36,height:36,borderRadius:"50%",border:"2px solid "+bl,background:"white",color:bl,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>-</button>
                    <div style={{fontWeight:800,fontSize:26,color:bl,minWidth:36,textAlign:"center"}}>{seats}</div>
                    <button onClick={() => setSeats(s=>s+1)} disabled={seats>=4} style={{width:36,height:36,borderRadius:"50%",border:"2px solid "+bl,background:"white",color:bl,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button>
                    <span style={{fontSize:12,color:gr}}>max 4</span>
                  </div>
                </div>
                <div style={{height:1,background:grl,margin:"16px 0"}}/>
                {sloading ? <div style={{textAlign:"center",padding:16,color:gr}}>Loading slots...</div> : (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                    {slots.map(s => {
                      const av=parseInt(s.available_seats), full=av<seats, sel=selSlot?.id===s.id;
                      return (
                        <div key={s.id} onClick={() => !full && setSelSlot(s)} style={{borderRadius:9,padding:"9px 4px",border:"1.5px solid "+(sel?bl:grl),cursor:full?"not-allowed":"pointer",textAlign:"center",background:sel?bl:full?grl:"white",opacity:full?0.6:1}}>
                          <div style={{fontSize:12,fontWeight:600,color:sel?"white":"inherit"}}>{s.departure_time.slice(0,5)}</div>
                          <div style={{fontSize:9,marginTop:2,color:sel?"rgba(255,255,255,0.8)":full?"#dc2626":av<=4?am:gn}}>{full?"Full":av+" left"}</div>
                        </div>
                      );
                    })}
                  </div>
                 )}
                <div style={{height:1,background:grl,margin:"16px 0"}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={() => setStep(1)} style={{padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:blp,color:bl}}>Back</button>
                  <button onClick={() => setStep(3)} disabled={!selSlot} style={{flex:1,padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:bl,color:"white",opacity:selSlot?1:0.5}}>Details</button>
                </div>
              </div>
            </div>
          )}
        {step===3 && (
            <div style={card}>
              <div style={{padding:"16px 20px 14px",borderBottom:"1px solid "+grl,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:blp,display:"flex",alignItems:"center",justifyContent:"center"}}>D</div>
                <div><div style={{fontWeight:700,fontSize:15}}>Your Details</div><div style={{fontSize:12,color:gr}}>Almost done!</div></div>
              </div>
              <div style={{padding:"16px 20px"}}>
                {user ? <Alert t="s">Logged in as {user.name}</Alert> : <>
                  <Alert t="i">Continue as guest or login for faster checkout</Alert>
                  <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:500,marginBottom:5,display:"block"}}>Full Name</label><input style={inp} placeholder="Nomsa Dlamini" value={gName} onChange={e=>setGName(e.target.value)}/></div>
                  <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:500,marginBottom:5,display:"block"}}>Phone Number</label><input style={inp} placeholder="0721234567" value={gPhone} onChange={e=>setGPhone(e.target.value)}/></div>
                </>}
                <div style={{background:blp,borderRadius:11,padding:"12px 14px",marginBottom:14}}>
                  <p style={{fontWeight:700,fontSize:13,color:bl,marginBottom:7}}>Booking Summary</p>
                  {[["Route",route?.from_place+" to "+route?.to_place],["Time",selSlot?.departure_time?.slice(0,5)],["Seats",seats+" seat"+(seats>1?"s":"")],["Driver",route?.driver_name],["Fare","R"+route?.fare_rands+" per person"]].map(([k,v]) => (
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0"}}>
                      <span style={{color:gr}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                  <div style={{marginTop:9,textAlign:"center"}}><span style={{display:"inline-flex",background:gnl,color:gn,borderRadius:16,padding:"4px 12px",fontSize:12,fontWeight:600}}>Free to book</span></div>
                </div>
                {err && <Alert t="e">{err}</Alert>}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={() => setStep(2)} style={{padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:blp,color:bl}}>Back</button>
                  <button onClick={book} disabled={loading||(!user&&(!gName||!gPhone))} style={{flex:1,padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:bl,color:"white",opacity:loading||(!user&&(!gName||!gPhone))?0.5:1}}>
                    {loading ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step===4 && done && (
            <div>
              <div style={{background:"linear-gradient(135deg,#1a3a8f 0%,#2952c4 100%)",borderRadius:14,padding:24,color:"white",textAlign:"center",marginBottom:16}}>
                <p style={{opacity:0.75,fontSize:13,marginBottom:8}}>Booking Confirmed!</p>
                <div style={{fontWeight:800,fontSize:28,letterSpacing:2,margin:"10px 0"}}>{done.booking.booking_ref}</div>
                <p style={{color:"rgba(255,255,255,0.72)",fontSize:13,marginBottom:14}}>Show this reference to your driver</p>
                <div style={{background:"rgba(255,255,255,0.1)",borderRadius:9,padding:14,textAlign:"left"}}>
                  {[["Route",done.slot.from_place+" to "+done.slot.to_place],["Time",done.slot.departure_time?.slice(0,5)],["Date",done.slot.slot_date],["Seats",done.booking.seats+" seat"+(done.booking.seats>1?"s":"")],["Pay","R"+done.slot.fare_rands+" per person"]].map(([k,v]) => (
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                      <span style={{color:"rgba(255,255,255,0.62)"}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
                 <p style={{fontSize:11,opacity:0.6,marginTop:12}}>SMS confirmation sent</p>
              </div>
              <Alert t="s">You are all set! Arrive 5 minutes early at the rank.</Alert>
              <div style={{display:"flex",gap:8}}>
                <button onClick={reset} style={{flex:1,padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:bl,color:"white"}}>Book Another Ride</button>
                {user && <button onClick={() => setView("rides")} style={{padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:blp,color:bl}}>My Rides</button>}
              </div>
            </div>
          )}
        </div>
      </>}

      {view === "rides" && <>
        <div style={{background:"linear-gradient(135deg,#1a3a8f 0%,#2952c4 60%,#4a7bf7 100%)",padding:"30px 22px 40px"}}>
          <h1 style={{fontWeight:800,fontSize:26,color:"white",marginBottom:10}}>My Rides</h1>
          <p style={{color:"rgba(255,255,255,0.72)",fontSize:13}}>Your upcoming and past bookings</p>
        </div>
        <div style={{padding:"22px 18px",maxWidth:680,margin:"0 auto",width:"100%"}}>
          {!user ? (
            <div style={{background:"white",borderRadius:14,boxShadow:sh,padding:40,textAlign:"center"}}>
              <p style={{fontWeight:700,fontSize:18,marginBottom:8}}>Login to view your rides</p>
              <button onClick={() => setShowAuth(true)} style={{padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:bl,color:"white"}}>Login</button>
            </div>
          ) : loading ? <div style={{textAlign:"center",padding:40,color:gr}}>Loading...</div>
          : myB.length === 0 ? (
            <div style={{background:"white",borderRadius:14,boxShadow:sh,padding:40,textAlign:"center"}}>
               <p style={{fontWeight:700,fontSize:18,marginBottom:8}}>No bookings yet</p>
              <button onClick={() => setView("book")} style={{padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:bl,color:"white"}}>Book a Ride</button>
            </div>
          ) : myB.map(b => (
            <div key={b.id} style={{border:"1.5px solid "+grl,borderRadius:11,padding:14,marginBottom:11,background:"white"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:bl}}>{b.booking_ref}</div>
                  <div style={{fontSize:12,color:gr,marginBottom:4}}>{b.from_place} to {b.to_place}</div>
                </div>
                <div style={{background:bl,color:"white",borderRadius:7,padding:"3px 9px",fontSize:12,fontWeight:600}}>{b.departure_time?.slice(0,5)}</div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{background:blp,color:bl,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:500}}>{b.slot_date}</span>
                <span style={{background:blp,color:bl,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:500}}>{b.seats} seat{b.seats>1?"s":""}</span>
                <span style={{background:b.status==="boarded"?gnl:blp,color:b.status==="boarded"?gn:bl,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:500}}>
                  {b.status==="confirmed"?"Confirmed":b.status==="boarded"?"Boarded":"Cancelled"}
                </span>
                {b.status==="confirmed" && (
                  <button onClick={() => cancel(b.id)} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:8,padding:"7px 13px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

