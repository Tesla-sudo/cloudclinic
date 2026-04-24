/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

// ── Mock data for skeleton / demo state ──────────────────────────────────────
const MOCK_PATIENTS = [
  { _id: "1", name: "Akinyi Wanjiku", age: 28, condition: "Antenatal – 32wks", county: "Kisumu", status: "critical", lastReading: "2 min ago", avatar: "AW" },
  { _id: "2", name: "Mwangi Josphat", age: 54, condition: "Hypertension", county: "Nyeri", status: "warning", lastReading: "18 min ago", avatar: "MJ" },
  { _id: "3", name: "Fatuma Hassan", age: 41, condition: "Type 2 Diabetes", county: "Mombasa", status: "stable", lastReading: "1 hr ago", avatar: "FH" },
  { _id: "4", name: "Kibet Rotich", age: 67, condition: "Post-cardiac surgery", county: "Eldoret", status: "stable", lastReading: "3 hrs ago", avatar: "KR" },
  { _id: "5", name: "Grace Otieno", age: 35, condition: "Postnatal – Day 12", county: "Homa Bay", status: "warning", lastReading: "45 min ago", avatar: "GO" },
  { _id: "6", name: "Abdullahi Omar", age: 48, condition: "COPD", county: "Garissa", status: "stable", lastReading: "6 hrs ago", avatar: "AO" },
];

const MOCK_VITALS = {
  "1": { bp: "148/96", hr: 94, spo2: 97, temp: 37.4, glucose: null, trend: "up" },
  "2": { bp: "162/104", hr: 88, spo2: 96, temp: 36.9, glucose: 120, trend: "up" },
  "3": { bp: "128/82", hr: 76, spo2: 98, temp: 36.6, glucose: 210, trend: "up" },
  "4": { bp: "118/74", hr: 68, spo2: 99, temp: 36.7, glucose: null, trend: "stable" },
  "5": { bp: "136/88", hr: 82, spo2: 98, temp: 37.1, glucose: null, trend: "down" },
  "6": { bp: "124/78", hr: 74, spo2: 93, temp: 36.8, glucose: null, trend: "stable" },
};

const ALERTS = [
  { id: 1, patient: "Akinyi Wanjiku", type: "critical", msg: "BP 148/96 — above safe antenatal threshold", time: "2 min ago" },
  { id: 2, patient: "Mwangi Josphat", type: "urgent", msg: "BP consistently elevated for 3 readings", time: "18 min ago" },
  { id: 3, patient: "Grace Otieno", type: "urgent", msg: "SpO₂ dipped to 95% briefly", time: "45 min ago" },
  { id: 4, patient: "Fatuma Hassan", type: "routine", msg: "Glucose 210 mg/dL — post-meal reading", time: "1 hr ago" },
];

const STATUS_COLOR = { critical: "#D93025", warning: "#E67700", stable: "#1D9E75" };
const STATUS_BG   = { critical: "#FDECEA", warning: "#FFF3E0", stable: "#E1F5EE" };

const NAV_ITEMS = [
  { id: "overview",      icon: GridIcon,      label: "Overview" },
  { id: "patients",      icon: UsersIcon,     label: "Patients" },
  { id: "alerts",        icon: BellIcon,      label: "Alerts",   badge: 3 },
  { id: "teleconsult",   icon: VideoIcon,     label: "Teleconsult" },
  { id: "medications",   icon: PillIcon,      label: "Medications" },
  { id: "postpartum",    icon: HeartIcon,     label: "Postpartum" },
  { id: "reports",       icon: ChartIcon,     label: "Reports" },
  { id: "settings",      icon: SettingsIcon,  label: "Settings" },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [vitals, setVitals] = useState(MOCK_VITALS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patientSearch, setPatientSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [alertDismissed, setAlertDismissed] = useState([]);

  const pv = vitals[selectedPatient?._id] || {};

  const filteredPatients = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                        p.condition.toLowerCase().includes(patientSearch.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeAlerts = ALERTS.filter(a => !alertDismissed.includes(a.id));

  return (
    <div style={s.shell}>
      <style>{css}</style>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? 240 : 64 }} className="cc-sidebar">

        {/* Logo */}
        <div style={s.sidebarLogo}>
          <div style={s.logoMark}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#fff" strokeWidth="1.5"/>
              <path d="M9 5v4l3 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="2" fill="#5DCAA5"/>
            </svg>
          </div>
          {sidebarOpen && (
            <span style={s.logoText}>CloudClinic</span>
          )}
          <button onClick={() => setSidebarOpen(v => !v)} style={s.collapseBtn} className="cc-icon-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d={sidebarOpen ? "M9 2L4 7l5 5" : "M5 2l5 5-5 5"} stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={s.sidebarNav}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)}
                style={{ ...s.navItem, background: active ? "rgba(255,255,255,0.1)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.45)" }}
                className="cc-nav-item" title={!sidebarOpen ? item.label : ""}>
                <span style={{ position: "relative", flexShrink: 0 }}>
                  <Icon size={17} color={active ? "#5DCAA5" : "rgba(255,255,255,0.45)"} />
                  {item.badge && <span style={s.navBadge}>{item.badge}</span>}
                </span>
                {sidebarOpen && <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 400 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Doctor profile */}
        {sidebarOpen && (
          <div style={s.sidebarProfile}>
            <div style={s.profileAvatar}>DR</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Dr. Kibet M.</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>General Practitioner</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN AREA ───────────────────────────────────── */}
      <div style={s.mainArea}>

        {/* ── TOPBAR ── */}
        <header style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>
              {NAV_ITEMS.find(n => n.id === activeNav)?.label}
            </h1>
            <p style={s.pageDate}>{new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={s.topbarSearch}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6" cy="6" r="4.5" stroke="#aaa" strokeWidth="1.4"/>
                <path d="M10 10l2.5 2.5" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input placeholder="Search patients…" style={s.topbarSearchInput} className="cc-search" />
            </div>
            <div style={s.alertDot}>
              <BellIcon size={17} color="#555" />
              {activeAlerts.length > 0 && <span style={s.alertDotBadge}>{activeAlerts.length}</span>}
            </div>
            <div style={s.topbarAvatar}>DR</div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div style={s.content}>

          {/* ── OVERVIEW ── */}
          {activeNav === "overview" && (
            <div style={s.overviewGrid}>

              {/* Stat cards */}
              <div style={s.statRow}>
                {[
                  { label: "Total Patients", value: patients.length, color: "#185FA5", bg: "#EBF4FD", icon: <UsersIcon size={18} color="#185FA5"/> },
                  { label: "Critical Alerts", value: activeAlerts.filter(a=>a.type==="critical").length, color: "#D93025", bg: "#FDECEA", icon: <BellIcon size={18} color="#D93025"/> },
                  { label: "Stable Patients", value: patients.filter(p=>p.status==="stable").length, color: "#1D9E75", bg: "#E1F5EE", icon: <HeartIcon size={18} color="#1D9E75"/> },
                  { label: "Pending Consults", value: 2, color: "#E67700", bg: "#FFF3E0", icon: <VideoIcon size={18} color="#E67700"/> },
                ].map(stat => (
                  <div key={stat.label} style={s.statCard}>
                    <div style={{ ...s.statIcon, background: stat.bg }}>{stat.icon}</div>
                    <div>
                      <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                      <div style={s.statLabel}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Two-col: alerts + selected patient */}
              <div style={s.twoCol}>

                {/* Alert inbox */}
                <div style={s.panel}>
                  <div style={s.panelHeader}>
                    <span style={s.panelTitle}>Alert Inbox</span>
                    <span style={{ fontSize: 12, color: "#aaa" }}>{activeAlerts.length} active</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {activeAlerts.length === 0 && (
                      <div style={{ padding: "20px 0", textAlign: "center", color: "#aaa", fontSize: 13 }}>
                        All clear — no active alerts.
                      </div>
                    )}
                    {activeAlerts.map(alert => (
                      <div key={alert.id} style={{ ...s.alertItem, borderLeft: `3px solid ${STATUS_COLOR[alert.type === "critical" ? "critical" : alert.type === "urgent" ? "warning" : "stable"]}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span style={{ ...s.alertBadge, background: STATUS_BG[alert.type === "critical" ? "critical" : alert.type === "urgent" ? "warning" : "stable"], color: STATUS_COLOR[alert.type === "critical" ? "critical" : alert.type === "urgent" ? "warning" : "stable"] }}>
                              {alert.type}
                            </span>
                            <div style={s.alertPatient}>{alert.patient}</div>
                            <div style={s.alertMsg}>{alert.msg}</div>
                          </div>
                          <button onClick={() => setAlertDismissed(d => [...d, alert.id])} style={s.dismissBtn} title="Dismiss">×</button>
                        </div>
                        <div style={s.alertTime}>{alert.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected patient vitals */}
                <div style={s.panel}>
                  <div style={s.panelHeader}>
                    <span style={s.panelTitle}>Live Vitals</span>
                    <span style={{ ...s.statusPill, background: STATUS_BG[selectedPatient.status], color: STATUS_COLOR[selectedPatient.status] }}>
                      {selectedPatient.status}
                    </span>
                  </div>
                  <div style={s.patientMeta}>
                    <div style={{ ...s.avatarLg, background: selectedPatient.status === "critical" ? "#FDECEA" : selectedPatient.status === "warning" ? "#FFF3E0" : "#E1F5EE", color: STATUS_COLOR[selectedPatient.status] }}>
                      {selectedPatient.avatar}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: "#0d1f1a" }}>{selectedPatient.name}</div>
                      <div style={{ fontSize: 13, color: "#888" }}>{selectedPatient.condition} · {selectedPatient.county}</div>
                      <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>Last reading: {selectedPatient.lastReading}</div>
                    </div>
                  </div>
                  <div style={s.vitalsGrid}>
                    {[
                      { label: "Blood Pressure", value: pv.bp || "—", unit: "mmHg", icon: <BPIcon/>, alert: selectedPatient.status === "critical" },
                      { label: "Heart Rate", value: pv.hr || "—", unit: "bpm", icon: <HeartRateIcon/>, alert: false },
                      { label: "SpO₂", value: pv.spo2 ? `${pv.spo2}%` : "—", unit: "", icon: <SpO2Icon/>, alert: pv.spo2 < 95 },
                      { label: "Temperature", value: pv.temp ? `${pv.temp}°C` : "—", unit: "", icon: <TempIcon/>, alert: pv.temp > 38 },
                      ...(pv.glucose ? [{ label: "Blood Glucose", value: `${pv.glucose}`, unit: "mg/dL", icon: <GlucoseIcon/>, alert: pv.glucose > 180 }] : []),
                    ].map(v => (
                      <div key={v.label} style={{ ...s.vitalCard, border: v.alert ? "1.5px solid #F7C1C1" : "1.5px solid #f0f0f0", background: v.alert ? "#FFFAFA" : "#fff" }}>
                        <div style={s.vitalIcon}>{v.icon}</div>
                        <div style={{ ...s.vitalValue, color: v.alert ? "#D93025" : "#0d1f1a" }}>{v.value}</div>
                        <div style={s.vitalUnit}>{v.unit}</div>
                        <div style={s.vitalLabel}>{v.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button onClick={() => navigate(`/doctor/vitals/${selectedPatient._id}`)} style={s.btnPrimary} className="cc-btn-primary">
                      Full Vitals History →
                    </button>
                    <button style={s.btnSecondary} className="cc-btn-secondary">
                      <VideoIcon size={14} color="#185FA5"/> Teleconsult
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── PATIENTS ── */}
          {activeNav === "patients" && (
            <div>
              <div style={s.tableControls}>
                <div style={s.searchBox}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="#aaa" strokeWidth="1.4"/>
                    <path d="M10 10l2.5 2.5" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <input value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
                    placeholder="Search by name or condition…" style={s.searchInput} className="cc-search" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["all","critical","warning","stable"].map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)}
                      style={{ ...s.filterChip, background: filterStatus === f ? "#0d1f1a" : "#f4f4f4", color: filterStatus === f ? "#fff" : "#555" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div style={s.patientTable}>
                <div style={s.tableHeader}>
                  <span>Patient</span><span>Condition</span><span>County</span><span>Status</span><span>Last Reading</span><span>Actions</span>
                </div>
                {filteredPatients.map(p => (
                  <div key={p._id} style={s.tableRow} className="cc-table-row" onClick={() => { setSelectedPatient(p); setActiveNav("overview"); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ ...s.avatarSm, background: STATUS_BG[p.status], color: STATUS_COLOR[p.status] }}>{p.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#0d1f1a" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#aaa" }}>{p.age} yrs</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: "#555" }}>{p.condition}</span>
                    <span style={{ fontSize: 13, color: "#888" }}>{p.county}</span>
                    <span style={{ ...s.statusPill, background: STATUS_BG[p.status], color: STATUS_COLOR[p.status] }}>{p.status}</span>
                    <span style={{ fontSize: 12, color: "#aaa" }}>{p.lastReading}</span>
                    <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/doctor/vitals/${p._id}`)} style={s.actionBtn} className="cc-action-btn">Vitals</button>
                      <button style={{ ...s.actionBtn, background: "#EBF4FD", color: "#185FA5" }} className="cc-action-btn">Consult</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {activeNav === "alerts" && (
            <div style={{ maxWidth: 680 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ALERTS.map(alert => (
                  <div key={alert.id} style={{ ...s.alertItemLg, borderLeft: `4px solid ${STATUS_COLOR[alert.type === "critical" ? "critical" : alert.type === "urgent" ? "warning" : "stable"]}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ ...s.alertBadge, background: STATUS_BG[alert.type === "critical" ? "critical" : alert.type === "urgent" ? "warning" : "stable"], color: STATUS_COLOR[alert.type === "critical" ? "critical" : alert.type === "urgent" ? "warning" : "stable"], fontSize: 12 }}>
                        {alert.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: "#bbb" }}>{alert.time}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0d1f1a", marginBottom: 4 }}>{alert.patient}</div>
                    <div style={{ fontSize: 13.5, color: "#555", lineHeight: 1.6, marginBottom: 14 }}>{alert.msg}</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button style={s.btnPrimary} className="cc-btn-primary" onClick={() => navigate(`/doctor/vitals/1`)}>View Vitals</button>
                      <button style={s.btnSecondary} className="cc-btn-secondary"><VideoIcon size={13} color="#185FA5"/> Teleconsult</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PLACEHOLDER SECTIONS ── */}
          {["teleconsult","medications","postpartum","reports","settings"].includes(activeNav) && (
            <div style={s.placeholder}>
              <div style={s.placeholderIcon}>
                {activeNav === "teleconsult" && <VideoIcon size={36} color="#bbb"/>}
                {activeNav === "medications" && <PillIcon size={36} color="#bbb"/>}
                {activeNav === "postpartum" && <HeartIcon size={36} color="#bbb"/>}
                {activeNav === "reports" && <ChartIcon size={36} color="#bbb"/>}
                {activeNav === "settings" && <SettingsIcon size={36} color="#bbb"/>}
              </div>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: "#0d1f1a", marginBottom: 8 }}>
                {NAV_ITEMS.find(n => n.id === activeNav)?.label}
              </h3>
              <p style={{ fontSize: 14, color: "#aaa", maxWidth: 340, textAlign: "center", lineHeight: 1.7 }}>
                This module is part of the CloudClinic doctor dashboard. Connect your backend to unlock full functionality.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── PATIENT SIDEBAR (right) ─────────────────────── */}
      <aside style={s.patientSidebar}>
        <div style={s.patientSidebarHeader}>
          <span style={s.panelTitle}>Patients</span>
          <span style={{ fontSize: 12, color: "#aaa" }}>{patients.length} total</span>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={s.sidebarSearch}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#ccc" strokeWidth="1.4"/>
              <path d="M10 10l2.5 2.5" stroke="#ccc" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input placeholder="Filter…" value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              style={s.sidebarSearchInput} className="cc-search" />
          </div>
        </div>
        <div style={s.patientList}>
          {filteredPatients.map(p => {
            const selected = selectedPatient?._id === p._id;
            return (
              <div key={p._id}
                onClick={() => { setSelectedPatient(p); setActiveNav("overview"); }}
                style={{ ...s.patientListItem, background: selected ? "#f0faf6" : "transparent", borderLeft: selected ? "3px solid #1D9E75" : "3px solid transparent" }}
                className="cc-patient-item"
              >
                <div style={{ ...s.avatarSm, background: STATUS_BG[p.status], color: STATUS_COLOR[p.status], flexShrink: 0 }}>
                  {p.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0d1f1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.condition}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[p.status], flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: STATUS_COLOR[p.status], fontWeight: 600 }}>{p.status}</span>
                    <span style={{ fontSize: 10, color: "#ccc" }}>· {p.lastReading}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

    </div>
  );
}

// ── Icon Components ───────────────────────────────────────────────────────────
function GridIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/></svg>;
}
function UsersIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="3" stroke={color} strokeWidth="1.4"/><path d="M1 14c0-3 2.2-5 5-5s5 2 5 5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><path d="M11 3c1.5.5 2.5 2 2.5 3.5M13 11c1 .8 2 2 2 3" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function BellIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v4l-1 1.5h11L12.5 10V6A4.5 4.5 0 0 0 8 1.5z" stroke={color} strokeWidth="1.4"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke={color} strokeWidth="1.4"/></svg>;
}
function VideoIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="2" stroke={color} strokeWidth="1.4"/><path d="M11 7l4-2v6l-4-2V7z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/></svg>;
}
function PillIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="4" rx="2" stroke={color} strokeWidth="1.4"/><path d="M8 6v4" stroke={color} strokeWidth="1.4"/></svg>;
}
function HeartIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 13S2 9 2 5.5A3.5 3.5 0 0 1 8 3.8 3.5 3.5 0 0 1 14 5.5C14 9 8 13 8 13z" stroke={color} strokeWidth="1.4"/></svg>;
}
function ChartIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M2 12l3-4 3 2 3-6 3 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SettingsIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function BPIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 10h3l2-6 2 12 2-8 2 4h3" stroke="#185FA5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function HeartRateIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 16S3 11 3 6.5A4 4 0 0 1 10 4a4 4 0 0 1 7 2.5C17 11 10 16 10 16z" stroke="#D93025" strokeWidth="1.6"/></svg>;
}
function SpO2Icon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#1D9E75" strokeWidth="1.6"/><path d="M10 6v4l3 2" stroke="#1D9E75" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function TempIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="8.5" y="3" width="3" height="10" rx="1.5" stroke="#E67700" strokeWidth="1.4"/><circle cx="10" cy="14.5" r="2.5" stroke="#E67700" strokeWidth="1.4"/></svg>;
}
function GlucoseIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 10h8M10 6v8" stroke="#854F0B" strokeWidth="1.6" strokeLinecap="round"/><circle cx="10" cy="10" r="7" stroke="#854F0B" strokeWidth="1.4"/></svg>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  shell: { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f7f8fb", color: "#0d1f1a" },

  sidebar: { background: "#0d1f1a", display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0, transition: "width 0.25s ease", overflow: "hidden", zIndex: 10 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "20px 16px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", minHeight: 64 },
  logoMark: { width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText: { fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", flex: 1, letterSpacing: -0.3 },
  collapseBtn: { background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0, marginLeft: "auto", flexShrink: 0 },
  sidebarNav: { flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap" },
  navBadge: { position: "absolute", top: -4, right: -6, background: "#D93025", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 4px", lineHeight: 1.4 },
  sidebarProfile: { padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 },
  profileAvatar: { width: 32, height: 32, borderRadius: "50%", background: "rgba(29,158,117,0.25)", color: "#5DCAA5", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  mainArea: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 64, background: "#fff", borderBottom: "1px solid #f0f0f0", flexShrink: 0 },
  pageTitle: { fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: "#0d1f1a", letterSpacing: -0.3 },
  pageDate: { fontSize: 12, color: "#bbb", marginTop: 2 },
  topbarSearch: { display: "flex", alignItems: "center", gap: 8, background: "#f7f7f7", border: "1px solid #ebebeb", borderRadius: 20, padding: "7px 14px" },
  topbarSearchInput: { background: "none", border: "none", outline: "none", fontSize: 13, color: "#444", width: 160, fontFamily: "'DM Sans',sans-serif" },
  alertDot: { position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#f7f7f7", cursor: "pointer" },
  alertDotBadge: { position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "#D93025", border: "1.5px solid #fff" },
  topbarAvatar: { width: 36, height: 36, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },

  content: { flex: 1, overflowY: "auto", padding: "24px" },

  overviewGrid: { display: "flex", flexDirection: "column", gap: 20 },
  statRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 },
  statCard: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statValue: { fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: -1, lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#aaa", marginTop: 4 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 },
  panel: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16, padding: "20px" },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  panelTitle: { fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#0d1f1a" },

  alertItem: { background: "#fafafa", borderRadius: 10, padding: "12px 14px", paddingLeft: 12 },
  alertItemLg: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "20px 20px 20px 18px" },
  alertBadge: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: 0.5, display: "inline-block", marginBottom: 5 },
  alertPatient: { fontWeight: 600, fontSize: 13, color: "#0d1f1a" },
  alertMsg: { fontSize: 12.5, color: "#666", lineHeight: 1.5, marginTop: 2 },
  alertTime: { fontSize: 11, color: "#ccc", marginTop: 8 },
  dismissBtn: { background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 18, lineHeight: 1, padding: "0 4px", flexShrink: 0 },

  patientMeta: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" },
  avatarLg: { width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 },
  avatarSm: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 },
  vitalsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 10 },
  vitalCard: { borderRadius: 12, padding: "12px 10px", textAlign: "center", transition: "transform 0.15s" },
  vitalIcon: { display: "flex", justifyContent: "center", marginBottom: 6 },
  vitalValue: { fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: -0.5 },
  vitalUnit: { fontSize: 10, color: "#aaa", marginTop: 1 },
  vitalLabel: { fontSize: 10.5, color: "#888", marginTop: 4 },
  statusPill: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, textTransform: "uppercase", letterSpacing: 0.4 },

  tableControls: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #ebebeb", borderRadius: 10, padding: "9px 14px", flex: 1, maxWidth: 340 },
  searchInput: { background: "none", border: "none", outline: "none", fontSize: 13, color: "#444", flex: 1, fontFamily: "'DM Sans',sans-serif" },
  filterChip: { fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", textTransform: "capitalize", transition: "background 0.15s" },
  patientTable: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16, overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1.2fr 1.5fr", gap: 12, padding: "12px 20px", background: "#f9f9f9", borderBottom: "1px solid #f0f0f0", fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1.2fr 1.5fr", gap: 12, padding: "14px 20px", borderBottom: "1px solid #f7f7f7", alignItems: "center", cursor: "pointer" },
  actionBtn: { fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "#E1F5EE", color: "#0F6E56", transition: "opacity 0.15s" },

  patientSidebar: { width: 240, flexShrink: 0, background: "#fff", borderLeft: "1px solid #f0f0f0", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" },
  patientSidebarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px 16px", borderBottom: "1px solid #f0f0f0" },
  sidebarSearch: { display: "flex", alignItems: "center", gap: 7, background: "#f7f7f7", borderRadius: 8, padding: "7px 10px" },
  sidebarSearchInput: { background: "none", border: "none", outline: "none", fontSize: 12, color: "#444", flex: 1, fontFamily: "'DM Sans',sans-serif" },
  patientList: { flex: 1, overflowY: "auto" },
  patientListItem: { display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", transition: "background 0.15s", borderLeft: "3px solid transparent" },

  btnPrimary: { background: "#185FA5", color: "#fff", padding: "9px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background 0.2s" },
  btnSecondary: { display: "flex", alignItems: "center", gap: 6, background: "#EBF4FD", color: "#185FA5", padding: "9px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },

  placeholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 },
  placeholderIcon: { width: 72, height: 72, borderRadius: 20, background: "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@700;800&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
  .cc-nav-item:hover { background: rgba(255,255,255,0.07) !important; color: rgba(255,255,255,0.75) !important; }
  .cc-table-row:hover { background: #f9fffe !important; }
  .cc-patient-item:hover { background: #f9fffe !important; }
  .cc-btn-primary:hover { background: #0C447C !important; }
  .cc-action-btn:hover { opacity: 0.8; }
  .cc-search:focus { outline: none; }
  @media (max-width: 1100px) {
    div[style*="width: 240px"][style*="borderLeft"] { display: none; }
  }
  @media (max-width: 768px) {
    div[style*="gridTemplateColumns: 1fr 1.4fr"] { grid-template-columns: 1fr !important; }
  }
`;