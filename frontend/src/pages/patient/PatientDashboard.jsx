/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PATIENT = {
  name: "Akinyi Wanjiku",
  age: 28,
  condition: "Antenatal – 32 weeks",
  county: "Kisumu",
  doctor: "Dr. Amina Ochieng",
  doctorSpecialty: "Obstetrics & Gynaecology",
  phone: "+254 712 345 678",
  nextAppointment: "Tomorrow, 10:00 AM",
  kitId: "CC-KIT-00421",
  status: "warning",
};

const MOCK_VITALS = {
  heartRate: 88,
  systolic: 142,
  diastolic: 94,
  temperature: 37.2,
  spo2: 97,
  glucose: null,
  recordedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
};

const MOCK_HISTORY = Array.from({ length: 12 }, (_, i) => ({
  time: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
  heartRate: 75 + Math.round(Math.sin(i * 0.5) * 10 + (Math.random() - 0.5) * 8),
  systolic: 128 + Math.round(Math.sin(i * 0.4) * 14 + (Math.random() - 0.5) * 6),
}));

const MOCK_ALERTS = [
  { id: 1, type: "warning", msg: "Blood pressure 142/94 — slightly elevated. Please rest and avoid salt.", time: "12 min ago", read: false },
  { id: 2, type: "info", msg: "Your next antenatal check-up is tomorrow at 10:00 AM.", time: "2 hrs ago", read: false },
  { id: 3, type: "success", msg: "SpO₂ levels have been consistently normal this week.", time: "Yesterday", read: true },
];

const MOCK_MEDICATIONS = [
  { name: "Ferrous Sulphate", dose: "200mg", frequency: "Once daily", taken: true },
  { name: "Folic Acid", dose: "5mg", frequency: "Once daily", taken: true },
  { name: "Calcium Carbonate", dose: "500mg", frequency: "Twice daily", taken: false },
];

const MOCK_TIPS = [
  { icon: "", tip: "Drink at least 8 glasses of water today to support healthy blood pressure." },
  { icon: "", tip: "A 20-minute gentle walk can help regulate your heart rate." },
  { icon: "", tip: "Try deep breathing for 5 minutes to reduce stress and lower BP." },
];

const STATUS_COLOR = { critical: "#D93025", warning: "#E67700", stable: "#1D9E75", info: "#185FA5", success: "#1D9E75" };
const STATUS_BG    = { critical: "#FDECEA", warning: "#FFF3E0", stable: "#E1F5EE", info: "#EBF4FD", success: "#E1F5EE" };

const VITAL_META = [
  { id: "bp",     label: "Blood Pressure", value: v => `${v.systolic}/${v.diastolic}`, unit: "mmHg", normal: "90–140 / 60–90", icon: <BPIcon />, color: "#185FA5", bg: "#EBF4FD", alert: v => v.systolic > 140 || v.diastolic > 90 },
  { id: "hr",     label: "Heart Rate",     value: v => v.heartRate,                   unit: "bpm",  normal: "60–100",         icon: <HRIcon />,  color: "#D93025", bg: "#FDECEA", alert: v => v.heartRate > 100 || v.heartRate < 55 },
  { id: "spo2",   label: "SpO₂",           value: v => `${v.spo2}%`,                  unit: "",     normal: "≥ 95%",           icon: <SpO2Icon/>, color: "#1D9E75", bg: "#E1F5EE", alert: v => v.spo2 < 95 },
  { id: "temp",   label: "Temperature",    value: v => `${v.temperature}°C`,          unit: "",     normal: "36.1–37.5°C",     icon: <TempIcon/>, color: "#E67700", bg: "#FFF3E0", alert: v => v.temperature > 37.5 || v.temperature < 36 },
];

const NAV = [
  { id: "overview",    label: "Overview",    icon: <GridIcon /> },
  { id: "vitals",      label: "My Vitals",   icon: <ChartIcon /> },
  { id: "medications", label: "Medications", icon: <PillIcon /> },
  { id: "alerts",      label: "Alerts",      icon: <BellIcon />, badge: 2 },
  { id: "doctor",      label: "My Doctor",   icon: <DoctorIcon /> },
  { id: "ai",          label: "AI Assistant",icon: <AIIcon /> },
];

// ── Tiny sparkline SVG ────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 120, height = 36 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
      <polyline points={`0,${height} ${pts} ${width},${height}`} stroke="none"
        fill={color} opacity="0.08"/>
    </svg>
  );
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext) || {};

  const [activeNav, setActiveNav]     = useState("overview");
  const [vitals, setVitals]           = useState(MOCK_VITALS);
  const [patient, setPatient]         = useState(MOCK_PATIENT);
  const [alerts, setAlerts]           = useState(MOCK_ALERTS);
  const [meds, setMeds]               = useState(MOCK_MEDICATIONS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tipIdx, setTipIdx]           = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading]         = useState(false);
  const [aiInput, setAiInput]         = useState("");
  const [aiMessages, setAiMessages]   = useState([
    { role: "assistant", text: "Habari! Mimi ni msaidizi wako wa afya. Unaweza kuniuliza kuhusu afya yako kwa Kiswahili, Kalenjin, Kikuyu, Luo, au Luhya. / Hello! I am your health assistant. Ask me anything about your health." }
  ]);
  const [aiLoading, setAiLoading]     = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % MOCK_TIPS.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    API.get(`/vitals/${user?.id || "123"}`)
      .then(res => setVitals(res.data[res.data.length - 1] || MOCK_VITALS))
      .catch(() => {});
  }, []);

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const markRead = id => setAlerts(prev => prev.map(a => a._id === id || a.id === id ? { ...a, read: true } : a));
  const toggleMed = idx => setMeds(prev => prev.map((m, i) => i === idx ? { ...m, taken: !m.taken } : m));

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setAiLoading(true);
    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        role: "assistant",
        text: `Based on your recent readings — BP ${vitals.systolic}/${vitals.diastolic}, HR ${vitals.heartRate} bpm, SpO₂ ${vitals.spo2}% — your vitals show mild elevation. Please rest and follow your doctor's guidance. / Kulingana na takwimu zako za hivi karibuni, shinikizo lako la damu limeongezeka kidogo. Pumzika na ufuate maelekezo ya daktari wako.`
      }]);
      setAiLoading(false);
    }, 1200);
  };

  return (
    <div style={s.shell}>
      <style>{css}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? 220 : 60 }} className="cc-sidebar">
        <div style={s.sidebarTop}>
          <div style={s.logoRow}>
            <div style={s.logoMark}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="1.4"/>
                <circle cx="8" cy="8" r="2" fill="#5DCAA5"/>
              </svg>
            </div>
            {sidebarOpen && <span style={s.logoText}>CloudClinic</span>}
            <button onClick={() => setSidebarOpen(v => !v)} style={s.collapseBtn} className="cc-icon-btn">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d={sidebarOpen ? "M8 2L4 6l4 4" : "M4 2l4 4-4 4"} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Patient mini-card */}
          {sidebarOpen && (
            <div style={s.sidebarPatientCard}>
              <div style={s.sidebarAvatar}>AW</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{patient.name.split(" ")[0]}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{patient.condition}</div>
              </div>
              <div style={{ ...s.statusDot, background: STATUS_COLOR[patient.status] }} />
            </div>
          )}
        </div>

        <nav style={s.sidebarNav}>
          {NAV.map(item => {
            const active = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)}
                style={{ ...s.navItem, background: active ? "rgba(255,255,255,0.1)" : "transparent" }}
                className="cc-nav-item" title={!sidebarOpen ? item.label : ""}>
                <span style={{ color: active ? "#5DCAA5" : "rgba(255,255,255,0.4)", position: "relative", flexShrink: 0 }}>
                  {item.icon}
                  {item.badge && unreadAlerts > 0 && <span style={s.navBadge}>{unreadAlerts}</span>}
                </span>
                {sidebarOpen && (
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fff" : "rgba(255,255,255,0.45)" }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button onClick={() => { logout?.(); navigate("/login"); }} style={s.logoutBtn} className="cc-logout-btn">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9 5l3 2-3 2M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {sidebarOpen && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Sign out</span>}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div style={s.mainWrap}>

        {/* Topbar */}
        <header style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>{NAV.find(n => n.id === activeNav)?.label}</h1>
            <p style={s.pageDate}>{new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={s.kitBadge}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#1D9E75" strokeWidth="1.2"/><circle cx="5" cy="5" r="1.5" fill="#1D9E75"/></svg>
              Kit {patient.kitId}
            </div>
            <div style={s.topbarAvatar}>AW</div>
          </div>
        </header>

        <div style={s.content}>

          {/* ── OVERVIEW ── */}
          {activeNav === "overview" && (
            <div style={s.overviewGrid}>

              {/* Health tip rotating banner */}
              <div style={s.tipBanner}>
                <span style={{ fontSize: 22 }}>{MOCK_TIPS[tipIdx].icon}</span>
                <p style={s.tipText}>{MOCK_TIPS[tipIdx].tip}</p>
                <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
                  {MOCK_TIPS.map((_, i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === tipIdx ? "#1D9E75" : "rgba(29,158,117,0.2)", transition: "background 0.3s" }} />
                  ))}
                </div>
              </div>

              {/* Vitals grid */}
              <div style={s.vitalsGrid}>
                {VITAL_META.map(meta => {
                  const val = meta.value(vitals);
                  const abnormal = meta.alert(vitals);
                  return (
                    <div key={meta.id} style={{ ...s.vitalCard, border: abnormal ? `1.5px solid ${meta.color}` : "1.5px solid #f0f0f0", background: abnormal ? meta.bg : "#fff" }}
                      onClick={() => setActiveNav("vitals")} className="cc-vital-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ ...s.vitalIconBox, background: meta.bg }}>{meta.icon}</div>
                        {abnormal && <span style={s.alertPip}>⚠</span>}
                      </div>
                      <div style={{ ...s.vitalVal, color: abnormal ? meta.color : "#0d1f1a" }}>{val}</div>
                      <div style={s.vitalUnit}>{meta.unit}</div>
                      <div style={s.vitalLabel}>{meta.label}</div>
                      <div style={{ marginTop: 10 }}>
                        <Sparkline
                          data={MOCK_HISTORY.map(h => meta.id === "bp" ? h.systolic : h.heartRate)}
                          color={meta.color}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: "#ccc", marginTop: 4 }}>Normal: {meta.normal}</div>
                    </div>
                  );
                })}
              </div>

              {/* Two-col: alerts + upcoming + doctor */}
              <div style={s.twoCol}>

                {/* Active alerts */}
                <div style={s.panel}>
                  <div style={s.panelHeader}>
                    <span style={s.panelTitle}>Recent Alerts</span>
                    {unreadAlerts > 0 && <span style={s.unreadBadge}>{unreadAlerts} new</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {alerts.slice(0, 3).map(a => (
                      <div key={a.id} style={{ ...s.alertItem, opacity: a.read ? 0.55 : 1, borderLeft: `3px solid ${STATUS_COLOR[a.type]}` }}
                        onClick={() => markRead(a.id)} className="cc-alert-item">
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 14, flexShrink: 0 }}>
                            {a.type === "warning" ? "⚠️" : a.type === "success" ? "✅" : "ℹ️"}
                          </span>
                          <div>
                            <p style={s.alertMsg}>{a.msg}</p>
                            <span style={s.alertTime}>{a.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming + doctor */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Next appointment */}
                  <div style={s.panel}>
                    <div style={s.panelHeader}>
                      <span style={s.panelTitle}>Next Appointment</span>
                    </div>
                    <div style={s.appointmentCard}>
                      <div style={s.appointmentIcon}>📅</div>
                      <div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#0d1f1a" }}>{patient.nextAppointment}</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>With {patient.doctor}</div>
                      </div>
                    </div>
                  </div>

                  {/* Medication progress */}
                  <div style={s.panel}>
                    <div style={s.panelHeader}>
                      <span style={s.panelTitle}>Today's Medications</span>
                      <span style={{ fontSize: 12, color: "#1D9E75", fontWeight: 600 }}>
                        {meds.filter(m => m.taken).length}/{meds.length} taken
                      </span>
                    </div>
                    <div style={s.medProgress}>
                      <div style={{ ...s.medProgressBar, width: `${(meds.filter(m => m.taken).length / meds.length) * 100}%` }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                      {meds.map((m, i) => (
                        <div key={m.name} style={s.medItem} onClick={() => toggleMed(i)} className="cc-med-item">
                          <div style={{ ...s.medCheck, background: m.taken ? "#1D9E75" : "#f0f0f0", border: m.taken ? "none" : "1.5px solid #ddd" }}>
                            {m.taken && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: m.taken ? "#aaa" : "#0d1f1a", textDecoration: m.taken ? "line-through" : "none" }}>{m.name}</span>
                            <span style={{ fontSize: 11, color: "#bbb", marginLeft: 8 }}>{m.dose} · {m.frequency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* View full vitals CTA */}
              <div style={s.ctaBar}>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#0d1f1a" }}>View your full vitals history</div>
                  <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>Trend charts, data table, and 24-hour monitoring.</div>
                </div>
                <Link to={`/doctor/vitals/${user?.id || "123"}`} style={s.ctaBtn} className="cc-cta-btn">
                  Open Vitals Monitor →
                </Link>
              </div>
            </div>
          )}

          {/* ── MY VITALS ── */}
          {activeNav === "vitals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={s.vitalsGrid}>
                {VITAL_META.map(meta => {
                  const val = meta.value(vitals);
                  const abnormal = meta.alert(vitals);
                  return (
                    <div key={meta.id} style={{ ...s.vitalCard, border: abnormal ? `1.5px solid ${meta.color}` : "1.5px solid #f0f0f0" }}>
                      <div style={{ ...s.vitalIconBox, background: meta.bg }}>{meta.icon}</div>
                      <div style={{ ...s.vitalVal, color: abnormal ? meta.color : "#0d1f1a", marginTop: 14 }}>{val}</div>
                      <div style={s.vitalUnit}>{meta.unit}</div>
                      <div style={s.vitalLabel}>{meta.label}</div>
                      <div style={{ marginTop: 10 }}><Sparkline data={MOCK_HISTORY.map(h => meta.id === "bp" ? h.systolic : h.heartRate)} color={meta.color} /></div>
                      <div style={{ fontSize: 10, color: "#ccc", marginTop: 4 }}>Normal: {meta.normal}</div>
                      {abnormal && <div style={{ ...s.alertPip, position: "static", marginTop: 8, display: "inline-flex", gap: 4, fontSize: 11 }}>⚠ Outside normal range</div>}
                    </div>
                  );
                })}
              </div>
              <div style={s.ctaBar}>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15 }}>Full vitals history with trend charts</div>
                  <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>View 24H, 7D charts and all readings.</div>
                </div>
                <Link to={`/doctor/vitals/${user?.id || "123"}`} style={s.ctaBtn} className="cc-cta-btn">Open Monitor →</Link>
              </div>
              <div style={{ fontSize: 12, color: "#bbb", textAlign: "center" }}>
                Last reading: {new Date(vitals.recordedAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })} · Kit {patient.kitId}
              </div>
            </div>
          )}

          {/* ── MEDICATIONS ── */}
          {activeNav === "medications" && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ ...s.panel, marginBottom: 16 }}>
                <div style={s.panelHeader}>
                  <span style={s.panelTitle}>Today's Medications</span>
                  <span style={{ fontSize: 12, color: "#1D9E75", fontWeight: 600 }}>{meds.filter(m => m.taken).length}/{meds.length} taken</span>
                </div>
                <div style={s.medProgress}><div style={{ ...s.medProgressBar, width: `${(meds.filter(m => m.taken).length / meds.length) * 100}%` }} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                  {meds.map((m, i) => (
                    <div key={m.name} style={{ ...s.medItemLg, border: `1.5px solid ${m.taken ? "#c8e6d8" : "#f0f0f0"}`, background: m.taken ? "#f0faf6" : "#fff" }}
                      onClick={() => toggleMed(i)} className="cc-med-item">
                      <div style={{ ...s.medCheck, width: 22, height: 22, background: m.taken ? "#1D9E75" : "#f0f0f0", border: m.taken ? "none" : "1.5px solid #ddd" }}>
                        {m.taken && <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: m.taken ? "#aaa" : "#0d1f1a", textDecoration: m.taken ? "line-through" : "none" }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{m.dose} · {m.frequency}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: m.taken ? "#1D9E75" : "#bbb" }}>{m.taken ? "Taken ✓" : "Pending"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {activeNav === "alerts" && (
            <div style={{ maxWidth: 620 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {alerts.map(a => (
                  <div key={a.id} style={{ ...s.alertItemLg, opacity: a.read ? 0.6 : 1, borderLeft: `4px solid ${STATUS_COLOR[a.type]}` }}
                    onClick={() => markRead(a.id)} className="cc-alert-item">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ ...s.alertTypeBadge, background: STATUS_BG[a.type], color: STATUS_COLOR[a.type] }}>
                        {a.type}
                      </span>
                      <span style={{ fontSize: 11, color: "#ccc" }}>{a.time}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, margin: "10px 0 0" }}>{a.msg}</p>
                    {!a.read && <div style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>Tap to mark as read</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MY DOCTOR ── */}
          {activeNav === "doctor" && (
            <div style={{ maxWidth: 560 }}>
              <div style={s.doctorCard}>
                <div style={s.doctorAvatar}>AO</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: "#0d1f1a", marginBottom: 4 }}>{patient.doctor}</div>
                  <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>{patient.doctorSpecialty} · {patient.county} County</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button style={s.btnPrimary} className="cc-btn-primary">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="9" height="7" rx="1.5" stroke="#fff" strokeWidth="1.3"/><path d="M10 6.5l3-2v5l-3-2V6.5z" stroke="#fff" strokeWidth="1.3"/></svg>
                      Start Teleconsult
                    </button>
                    <button style={s.btnSecondary} className="cc-btn-secondary">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="9" rx="2" stroke="#185FA5" strokeWidth="1.3"/><path d="M1 6l6 3.5L13 6" stroke="#185FA5" strokeWidth="1.3"/></svg>
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ ...s.panel, marginTop: 16 }}>
                <div style={s.panelHeader}><span style={s.panelTitle}>Next Appointment</span></div>
                <div style={s.appointmentCard}>
                  <div style={s.appointmentIcon}>📅</div>
                  <div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#0d1f1a" }}>{patient.nextAppointment}</div>
                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>Antenatal monitoring check-up</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AI ASSISTANT ── */}
          {activeNav === "ai" && (
            <div style={s.aiWrap}>
              <div style={s.aiHeader}>
                <div style={s.aiAvatarBox}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#1D9E75" strokeWidth="1.5"/><path d="M6 10h8M10 6v8" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#0d1f1a" }}>CloudClinic AI Assistant</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>Responds in EN · SW · KAL · KIK · LUO · LUH</div>
                </div>
              </div>
              <div style={s.aiMessages}>
                {aiMessages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ ...s.aiBubble, background: m.role === "user" ? "#0d1f1a" : "#f4f4f4", color: m.role === "user" ? "#fff" : "#0d1f1a", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px" }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display: "flex", gap: 5, padding: "12px 16px" }}>
                    {[0,1,2].map(i => <span key={i} style={{ ...s.typingDot, animationDelay: `${i * 0.2}s` }} />)}
                  </div>
                )}
              </div>
              <div style={s.aiInputRow}>
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendAiMessage()}
                  placeholder="Ask about your health in any language…"
                  style={s.aiInput}
                  className="cc-ai-input"
                />
                <button onClick={sendAiMessage} style={s.aiSendBtn} className="cc-btn-primary" disabled={!aiInput.trim()}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div style={s.aiLangStrip}>
                {["Habari yako?", "Shinikizo langu?", "Am kotagee?", "Ruo matin'o?"].map(q => (
                  <button key={q} onClick={() => setAiInput(q)} style={s.aiQuickBtn} className="cc-ai-quick">{q}</button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Icon components ───────────────────────────────────────────────────────────
function GridIcon()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function ChartIcon()  { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 11l3-4 3 2 3-6 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function PillIcon()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="5.5" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 5.5v4" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function BellIcon()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5A4 4 0 0 0 3.5 5.5v4l-1 1.5h10L11.5 9.5v-4A4 4 0 0 0 7.5 1.5z" stroke="currentColor" strokeWidth="1.3"/><path d="M6 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function DoctorIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function AIIcon()     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5h5M7.5 5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function BPIcon()     { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1 9h3l2-4 2 8 2-5 1.5 3H17" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function HRIcon()     { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15S2 10.5 2 6.5A4.5 4.5 0 0 1 9 4a4.5 4.5 0 0 1 7 2.5C16 10.5 9 15 9 15z" stroke="#D93025" strokeWidth="1.5"/></svg>; }
function SpO2Icon()   { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#1D9E75" strokeWidth="1.4"/><path d="M9 6v3l2 1.5" stroke="#1D9E75" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function TempIcon()   { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7.5" y="2.5" width="3" height="9" rx="1.5" stroke="#E67700" strokeWidth="1.3"/><circle cx="9" cy="13.5" r="2.5" stroke="#E67700" strokeWidth="1.3"/></svg>; }

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  shell: { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f7f8fb", color: "#0d1f1a" },

  sidebar: { background: "#0d1f1a", display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0, transition: "width 0.25s ease", overflow: "hidden", zIndex: 10 },
  sidebarTop: { padding: "18px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  logoRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  logoMark: { width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText: { fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: "#fff", flex: 1, letterSpacing: -0.3 },
  collapseBtn: { background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0, flexShrink: 0, marginLeft: "auto" },
  sidebarPatientCard: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", position: "relative" },
  sidebarAvatar: { width: 32, height: 32, borderRadius: 8, background: "rgba(230,119,0,0.2)", color: "#E67700", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statusDot: { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", border: "1.5px solid #0d1f1a" },

  sidebarNav: { flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background 0.15s", whiteSpace: "nowrap" },
  navBadge: { position: "absolute", top: -4, right: -6, background: "#D93025", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 4px", lineHeight: 1.4 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", borderTop: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" },

  mainWrap: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, padding: "0 24px", background: "#fff", borderBottom: "1px solid #f0f0f0", flexShrink: 0 },
  pageTitle: { fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#0d1f1a", letterSpacing: -0.3 },
  pageDate: { fontSize: 11, color: "#bbb", marginTop: 2 },
  kitBadge: { display: "flex", alignItems: "center", gap: 5, background: "#E1F5EE", color: "#0F6E56", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 20, border: "1px solid #c8e6d8" },
  topbarAvatar: { width: 34, height: 34, borderRadius: "50%", background: "#FFF3E0", color: "#E67700", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },

  content: { flex: 1, overflowY: "auto", padding: "22px 24px" },

  overviewGrid: { display: "flex", flexDirection: "column", gap: 18 },
  tipBanner: { display: "flex", alignItems: "center", gap: 14, background: "#f0faf6", border: "1px solid #c8e6d8", borderRadius: 14, padding: "14px 18px" },
  tipText: { fontSize: 13.5, color: "#0F6E56", lineHeight: 1.6, flex: 1, fontWeight: 500 },

  vitalsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: 14 },
  vitalCard: { background: "#fff", borderRadius: 16, padding: "18px 16px", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" },
  vitalIconBox: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  vitalVal: { fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: -0.8, marginTop: 12, lineHeight: 1 },
  vitalUnit: { fontSize: 11, color: "#aaa", marginTop: 2 },
  vitalLabel: { fontSize: 12, color: "#888", marginTop: 4, fontWeight: 500 },
  alertPip: { background: "#FFF3E0", color: "#E67700", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 8 },

  twoCol: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 },
  panel: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16, padding: "18px" },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  panelTitle: { fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13.5, color: "#0d1f1a" },
  unreadBadge: { fontSize: 11, fontWeight: 700, background: "#FDECEA", color: "#D93025", padding: "2px 8px", borderRadius: 10 },

  alertItem: { background: "#fafafa", borderRadius: 10, padding: "10px 12px", paddingLeft: 10, cursor: "pointer", transition: "opacity 0.2s" },
  alertMsg: { fontSize: 12.5, color: "#444", lineHeight: 1.6, margin: 0 },
  alertTime: { fontSize: 10.5, color: "#ccc", marginTop: 4, display: "block" },
  alertItemLg: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "16px 18px 16px 16px", cursor: "pointer" },
  alertTypeBadge: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: 0.5 },

  appointmentCard: { display: "flex", alignItems: "center", gap: 12 },
  appointmentIcon: { fontSize: 28 },

  medProgress: { height: 4, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", marginTop: 8 },
  medProgressBar: { height: "100%", background: "#1D9E75", borderRadius: 4, transition: "width 0.4s" },
  medItem: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "4px 0" },
  medItemLg: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, cursor: "pointer", transition: "background 0.15s" },
  medCheck: { width: 18, height: 18, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" },

  ctaBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d1f1a", borderRadius: 16, padding: "18px 22px", gap: 16, flexWrap: "wrap" },
  ctaBtn: { background: "#1D9E75", color: "#fff", padding: "10px 22px", borderRadius: 24, fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", transition: "background 0.2s" },

  doctorCard: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16, padding: "24px", display: "flex", alignItems: "flex-start", gap: 18 },
  doctorAvatar: { width: 56, height: 56, borderRadius: 16, background: "#EBF4FD", color: "#185FA5", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, background: "#0F6E56", color: "#fff", padding: "9px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 6, background: "#EBF4FD", color: "#185FA5", padding: "9px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },

  aiWrap: { display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", maxWidth: 640 },
  aiHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "14px 18px", background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14 },
  aiAvatarBox: { width: 40, height: 40, borderRadius: 12, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  aiMessages: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "4px 0 16px", minHeight: 0 },
  aiBubble: { maxWidth: "82%", padding: "12px 16px", fontSize: 13.5, lineHeight: 1.7 },
  typingDot: { width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", animation: "cc-bounce 1.2s infinite", display: "inline-block" },
  aiInputRow: { display: "flex", gap: 10, marginTop: "auto", paddingTop: 12 },
  aiInput: { flex: 1, padding: "12px 16px", border: "1.5px solid #e5e7eb", borderRadius: 24, fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", background: "#fff" },
  aiSendBtn: { width: 44, height: 44, borderRadius: "50%", background: "#0F6E56", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
  aiLangStrip: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" },
  aiQuickBtn: { fontSize: 12, fontWeight: 600, color: "#0F6E56", background: "#f0faf6", border: "1px solid #c8e6d8", borderRadius: 16, padding: "5px 12px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@700;800&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
  .cc-nav-item:hover { background: rgba(255,255,255,0.06) !important; }
  .cc-vital-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.07); }
  .cc-alert-item:hover { opacity: 0.85 !important; }
  .cc-med-item:hover { opacity: 0.8; }
  .cc-cta-btn:hover { background: #0a5240 !important; }
  .cc-btn-primary:hover { opacity: 0.88; }
  .cc-ai-input:focus { border-color: #0F6E56 !important; box-shadow: 0 0 0 3px rgba(15,110,86,0.1); }
  .cc-ai-quick:hover { background: #e1f5ee !important; }
  .cc-logout-btn:hover span { color: rgba(255,255,255,0.7) !important; }
  @keyframes cc-spin { to { transform: rotate(360deg); } }
  @keyframes cc-bounce { 0%,80%,100%{transform:scale(0);opacity:0.4} 40%{transform:scale(1);opacity:1} }
  @media (max-width: 900px) {
    div[style*="gridTemplateColumns: 1.2fr 1fr"] { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 600px) {
    div[style*="gridTemplateColumns: repeat(auto-fit,minmax(185px"] { grid-template-columns: 1fr 1fr !important; }
  }
`;