/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
import { Line } from "react-chartjs-2";
// eslint-disable-next-line no-unused-vars
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, Filler
);

// ── Mock data for demo ────────────────────────────────────────────────────────
const generateMockVitals = (n = 24) => {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => ({
    _id: `v${i}`,
    recordedAt: new Date(now - (n - 1 - i) * 30 * 60 * 1000).toISOString(),
    heartRate: 72 + Math.round(Math.sin(i * 0.4) * 8 + (Math.random() - 0.5) * 6),
    temperature: parseFloat((36.6 + Math.sin(i * 0.3) * 0.4 + (Math.random() - 0.5) * 0.2).toFixed(1)),
    systolic: 120 + Math.round(Math.sin(i * 0.5) * 12 + (Math.random() - 0.5) * 8),
    diastolic: 80 + Math.round(Math.sin(i * 0.5) * 8 + (Math.random() - 0.5) * 5),
    spo2: parseFloat((97.5 + Math.sin(i * 0.2) * 1.5 + (Math.random() - 0.5) * 0.5).toFixed(1)),
    glucose: i % 4 === 0 ? 90 + Math.round(Math.random() * 60) : null,
  }));
};

const MOCK_PATIENT = {
  name: "Akinyi Wanjiku",
  age: 28,
  condition: "Antenatal – 32 weeks",
  county: "Kisumu",
  avatar: "AW",
  status: "warning",
  phone: "+254 712 345 678",
};

const VITAL_CONFIGS = [
  {
    id: "heartRate",
    label: "Heart Rate",
    unit: "bpm",
    color: "#D93025",
    fill: "rgba(217,48,37,0.08)",
    normal: [60, 100],
    icon: <HeartRateIcon />,
    format: v => `${v} bpm`,
  },
  {
    id: "systolic",
    label: "Systolic BP",
    unit: "mmHg",
    color: "#185FA5",
    fill: "rgba(24,95,165,0.08)",
    normal: [90, 140],
    icon: <BPIcon />,
    format: v => `${v} mmHg`,
  },
  {
    id: "temperature",
    label: "Temperature",
    unit: "°C",
    color: "#E67700",
    fill: "rgba(230,119,0,0.08)",
    normal: [36.1, 37.5],
    icon: <TempIcon />,
    format: v => `${v}°C`,
  },
  {
    id: "spo2",
    label: "SpO₂",
    unit: "%",
    color: "#1D9E75",
    fill: "rgba(29,158,117,0.08)",
    normal: [95, 100],
    icon: <SpO2Icon />,
    format: v => `${v}%`,
  },
];

const RANGES = [
  { label: "6H", hours: 6 },
  { label: "12H", hours: 12 },
  { label: "24H", hours: 24 },
  { label: "7D", hours: 168 },
];

const STATUS_COLOR = { critical: "#D93025", warning: "#E67700", stable: "#1D9E75" };
const STATUS_BG    = { critical: "#FDECEA", warning: "#FFF3E0", stable: "#E1F5EE" };

export default function PatientVitalsChart({ patientId: propId }) {
  const { patientId: paramId } = useParams();
  const navigate = useNavigate();
  const patientId = propId || paramId || "123";

  const [vitals, setVitals] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [patient, setPatient] = useState(MOCK_PATIENT);
  const [loading, setLoading] = useState(true);
  const [activeVital, setActiveVital] = useState("heartRate");
  const [activeRange, setActiveRange] = useState("24H");
  const [activeTab, setActiveTab] = useState("chart"); // "chart" | "table"

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      API.get(`/vitals/${patientId}`)
        .then(res => { setVitals(res.data); setLoading(false); })
        .catch(() => { setVitals(generateMockVitals(24)); setLoading(false); });
    }, 600);
    return () => clearTimeout(timer);
  }, [patientId]);

  const config = VITAL_CONFIGS.find(c => c.id === activeVital);

  const filteredVitals = (() => {
    const hrs = RANGES.find(r => r.label === activeRange)?.hours || 24;
    const cutoff = Date.now() - hrs * 60 * 60 * 1000;
    return vitals.filter(v => new Date(v.recordedAt).getTime() >= cutoff);
  })();

  const latest = filteredVitals[filteredVitals.length - 1] || {};
  const latestVal = latest[activeVital];
  const isAbnormal = latestVal && (latestVal < config.normal[0] || latestVal > config.normal[1]);

  // Trend: compare last two readings
  const prev = filteredVitals[filteredVitals.length - 2]?.[activeVital];
  const trend = latestVal && prev ? (latestVal > prev ? "↑" : latestVal < prev ? "↓" : "→") : "—";
  const trendColor = trend === "↑"
    ? (["heartRate","systolic","temperature"].includes(activeVital) ? "#D93025" : "#1D9E75")
    : trend === "↓"
    ? (["spo2"].includes(activeVital) ? "#D93025" : "#1D9E75")
    : "#aaa";

  const chartData = {
    labels: filteredVitals.map(v =>
      new Date(v.recordedAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })
    ),
    datasets: [
      {
        label: config.label,
        data: filteredVitals.map(v => v[activeVital]),
        borderColor: config.color,
        backgroundColor: config.fill,
        borderWidth: 2,
        pointRadius: filteredVitals.length > 20 ? 2 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: config.color,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0d1f1a",
        titleColor: "rgba(255,255,255,0.6)",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: ctx => ` ${ctx.raw} ${config.unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#bbb", font: { size: 11, family: "'DM Sans',sans-serif" }, maxRotation: 0, maxTicksLimit: 8 },
        border: { display: false },
      },
      y: {
        grid: { color: "#f0f0f0", drawBorder: false },
        ticks: { color: "#bbb", font: { size: 11, family: "'DM Sans',sans-serif" }, padding: 8 },
        border: { display: false },
        suggestedMin: config.normal[0] * 0.88,
        suggestedMax: config.normal[1] * 1.08,
      },
    },
  };

  // Summary stats
  const vals = filteredVitals.map(v => v[activeVital]).filter(Boolean);
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  const min = vals.length ? Math.min(...vals).toFixed(1) : "—";
  const max = vals.length ? Math.max(...vals).toFixed(1) : "—";

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ── Topbar ── */}
      <header style={s.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate(-1)} style={s.backBtn} className="cc-back-btn" title="Back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <Link to="/" style={s.logo}>
            <span style={s.logoDot} />
            CloudClinic
          </Link>
        </div>
        <div style={s.topbarRight}>
          <button style={s.topbarBtn} className="cc-topbar-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3.1 3.1l1.4 1.4M9.5 9.5l1.4 1.4M3.1 10.9l1.4-1.4M9.5 4.5l1.4-1.4" stroke="#555" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Export PDF
          </button>
          <button style={s.topbarBtn} className="cc-topbar-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="4" width="9" height="7" rx="1.5" stroke="#555" strokeWidth="1.3"/>
              <path d="M10 6.5l3-2v5l-3-2V6.5z" stroke="#555" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            Teleconsult
          </button>
        </div>
      </header>

      <div style={s.body}>

        {/* ── LEFT: Patient + Vital selector ── */}
        <aside style={s.sidebar}>

          {/* Patient card */}
          <div style={s.patientCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ ...s.avatar, background: STATUS_BG[patient.status], color: STATUS_COLOR[patient.status] }}>
                {patient.avatar}
              </div>
              <div>
                <div style={s.patientName}>{patient.name}</div>
                <div style={s.patientMeta}>{patient.age} yrs · {patient.county}</div>
              </div>
            </div>
            <div style={{ ...s.conditionBadge, background: STATUS_BG[patient.status], color: STATUS_COLOR[patient.status] }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[patient.status] }} />
              {patient.condition}
            </div>
            <div style={s.patientDetail}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="#ccc" strokeWidth="1.2"/><path d="M1 4.5l5 3 5-3" stroke="#ccc" strokeWidth="1.2"/></svg>
              {patient.phone}
            </div>
          </div>

          {/* Vital selector */}
          <div style={s.sectionLabel}>Select Vital</div>
          <div style={s.vitalSelector}>
            {VITAL_CONFIGS.map(cfg => {
              const v = latest[cfg.id];
              const abnormal = v && (v < cfg.normal[0] || v > cfg.normal[1]);
              const active = activeVital === cfg.id;
              return (
                <button
                  key={cfg.id}
                  onClick={() => setActiveVital(cfg.id)}
                  style={{
                    ...s.vitalSelectorItem,
                    border: active ? `1.5px solid ${cfg.color}` : "1.5px solid #f0f0f0",
                    background: active ? `${cfg.fill}` : "#fff",
                  }}
                  className="cc-vital-item"
                >
                  <div style={{ ...s.vitalSelectorIcon, background: active ? `${cfg.fill}` : "#f7f7f7" }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? cfg.color : "#555" }}>{cfg.label}</div>
                    {v !== undefined && v !== null
                      ? <div style={{ fontSize: 15, fontWeight: 800, color: abnormal ? "#D93025" : "#0d1f1a", fontFamily: "'Sora',sans-serif", letterSpacing: -0.3 }}>
                          {cfg.format(v)}
                        </div>
                      : <div style={{ fontSize: 12, color: "#ccc" }}>—</div>
                    }
                  </div>
                  {abnormal && (
                    <span style={s.abnormalDot} title="Outside normal range">!</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Normal range reference */}
          <div style={s.normalRange}>
            <div style={s.sectionLabel}>Normal Range</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>Min</span>
              <span style={{ fontSize: 12, color: "#aaa" }}>Max</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0d1f1a", fontFamily: "'Sora',sans-serif" }}>
                {config.normal[0]} {config.unit}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0d1f1a", fontFamily: "'Sora',sans-serif" }}>
                {config.normal[1]} {config.unit}
              </span>
            </div>
            <div style={s.rangeBar}>
              {latestVal && (
                <div style={{
                  ...s.rangeMarker,
                  left: `${Math.min(100, Math.max(0, ((latestVal - config.normal[0] * 0.88) / (config.normal[1] * 1.12 - config.normal[0] * 0.88)) * 100))}%`,
                  background: isAbnormal ? "#D93025" : "#1D9E75",
                }} title={`Current: ${latestVal}`} />
              )}
            </div>
          </div>
        </aside>

        {/* ── RIGHT: Chart area ── */}
        <main style={s.main}>

          {/* Chart header */}
          <div style={s.chartHeader}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 32, fontWeight: 800, color: isAbnormal ? "#D93025" : "#0d1f1a", letterSpacing: -1 }}>
                  {loading ? "—" : latestVal != null ? config.format(latestVal) : "—"}
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, color: trendColor }}>{trend}</span>
              </div>
              <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>
                {config.label} · Latest reading {latest.recordedAt ? new Date(latest.recordedAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {RANGES.map(r => (
                <button key={r.label} onClick={() => setActiveRange(r.label)}
                  style={{ ...s.rangeBtn, background: activeRange === r.label ? "#0d1f1a" : "#f4f4f4", color: activeRange === r.label ? "#fff" : "#555" }}
                  className="cc-range-btn">
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary stats strip */}
          <div style={s.statsStrip}>
            {[
              { label: "Average", value: `${avg} ${config.unit}`, color: "#185FA5" },
              { label: "Minimum", value: `${min} ${config.unit}`, color: "#1D9E75" },
              { label: "Maximum", value: `${max} ${config.unit}`, color: "#D93025" },
              { label: "Readings", value: vals.length, color: "#854F0B" },
            ].map(stat => (
              <div key={stat.label} style={s.statItem}>
                <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div style={s.tabRow}>
            {["chart", "table"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ ...s.tabBtn, borderBottom: activeTab === t ? `2px solid #0d1f1a` : "2px solid transparent", color: activeTab === t ? "#0d1f1a" : "#aaa", fontWeight: activeTab === t ? 700 : 400 }}>
                {t === "chart" ? "📈 Trend Chart" : "📋 Data Table"}
              </button>
            ))}
          </div>

          {/* CHART */}
          {activeTab === "chart" && (
            <div style={s.chartWrap}>
              {loading ? (
                <div style={s.loadingState}>
                  <div style={s.loadingSpinner} />
                  <span style={{ fontSize: 13, color: "#aaa" }}>Loading vitals…</span>
                </div>
              ) : filteredVitals.length === 0 ? (
                <div style={s.loadingState}>
                  <span style={{ fontSize: 13, color: "#aaa" }}>No readings in this time range.</span>
                </div>
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          )}

          {/* TABLE */}
          {activeTab === "table" && (
            <div style={s.tableWrap}>
              <div style={s.tableHead}>
                <span>Time</span>
                <span>Heart Rate</span>
                <span>Systolic BP</span>
                <span>Temperature</span>
                <span>SpO₂</span>
                <span>Glucose</span>
              </div>
              {[...filteredVitals].reverse().map((v, i) => {
                const hr_abn = v.heartRate < 60 || v.heartRate > 100;
                const bp_abn = v.systolic < 90 || v.systolic > 140;
                const tp_abn = v.temperature < 36.1 || v.temperature > 37.5;
                const sp_abn = v.spo2 < 95;
                return (
                  <div key={v._id || i} style={{ ...s.tableRow, background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {new Date(v.recordedAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{ ...s.tableCell, color: hr_abn ? "#D93025" : "#0d1f1a", fontWeight: hr_abn ? 700 : 400 }}>{v.heartRate} bpm</span>
                    <span style={{ ...s.tableCell, color: bp_abn ? "#D93025" : "#0d1f1a", fontWeight: bp_abn ? 700 : 400 }}>{v.systolic}/{v.diastolic} mmHg</span>
                    <span style={{ ...s.tableCell, color: tp_abn ? "#D93025" : "#0d1f1a", fontWeight: tp_abn ? 700 : 400 }}>{v.temperature}°C</span>
                    <span style={{ ...s.tableCell, color: sp_abn ? "#D93025" : "#0d1f1a", fontWeight: sp_abn ? 700 : 400 }}>{v.spo2}%</span>
                    <span style={{ ...s.tableCell, color: "#888" }}>{v.glucose ? `${v.glucose} mg/dL` : "—"}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* All vitals multi-chart toggle */}
          <div style={s.allVitalsSection}>
            <div style={s.sectionLabel}>All Vitals Snapshot</div>
            <div style={s.allVitalsGrid}>
              {VITAL_CONFIGS.map(cfg => {
                const val = latest[cfg.id];
                const abnormal = val && (val < cfg.normal[0] || val > cfg.normal[1]);
                return (
                  <div key={cfg.id} style={{ ...s.snapshotCard, border: abnormal ? `1.5px solid ${cfg.color}` : "1.5px solid #f0f0f0" }}
                    onClick={() => setActiveVital(cfg.id)} className="cc-snapshot-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ ...s.snapshotIcon, background: `${cfg.fill}` }}>{cfg.icon}</div>
                      {abnormal && <span style={{ ...s.abnormalDot, position: "static" }}>!</span>}
                    </div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: abnormal ? cfg.color : "#0d1f1a", letterSpacing: -0.5, marginTop: 10 }}>
                      {val != null ? cfg.format(val) : "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{cfg.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

// ── Icon components ───────────────────────────────────────────────────────────
function HeartRateIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13S2 9 2 5.5A4 4 0 0 1 8 3.4 4 4 0 0 1 14 5.5C14 9 8 13 8 13z" stroke="#D93025" strokeWidth="1.5"/></svg>;
}
function BPIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8h2.5l2-4 2 8 2-5 1.5 3H15" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function TempIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="6.5" y="2" width="3" height="8" rx="1.5" stroke="#E67700" strokeWidth="1.3"/><circle cx="8" cy="12" r="2.5" stroke="#E67700" strokeWidth="1.3"/></svg>;
}
function SpO2Icon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#1D9E75" strokeWidth="1.4"/><path d="M8 5v3l2 1.5" stroke="#1D9E75" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#f7f8fb", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#0d1f1a", display: "flex", flexDirection: "column" },

  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, padding: "0 24px", background: "#fff", borderBottom: "1px solid #f0f0f0", flexShrink: 0 },
  logo: { fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#0d1f1a", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 },
  logoDot: { width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", display: "inline-block" },
  backBtn: { width: 34, height: 34, borderRadius: 8, background: "#f4f4f4", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" },
  topbarRight: { display: "flex", gap: 10 },
  topbarBtn: { display: "flex", alignItems: "center", gap: 6, background: "#f4f4f4", border: "1px solid #e8e8e8", color: "#555", fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background 0.15s" },

  body: { display: "flex", flex: 1, overflow: "hidden" },

  sidebar: { width: 260, flexShrink: 0, background: "#fff", borderRight: "1px solid #f0f0f0", padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 },
  patientCard: { background: "#f9fffe", border: "1px solid #e1f5ee", borderRadius: 14, padding: "16px" },
  avatar: { width: 44, height: 44, borderRadius: 12, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  patientName: { fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: "#0d1f1a" },
  patientMeta: { fontSize: 12, color: "#aaa", marginTop: 2 },
  conditionBadge: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12, marginBottom: 10 },
  patientDetail: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#aaa", marginTop: 4 },

  sectionLabel: { fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: 1 },
  vitalSelector: { display: "flex", flexDirection: "column", gap: 8 },
  vitalSelectorItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: "#fff", textAlign: "left", position: "relative", transition: "border-color 0.15s, background 0.15s" },
  vitalSelectorIcon: { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  abnormalDot: { position: "absolute", top: 6, right: 8, width: 16, height: 16, borderRadius: "50%", background: "#D93025", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },

  normalRange: { background: "#f9f9f9", borderRadius: 12, padding: "14px" },
  rangeBar: { height: 6, background: "#e8e8e8", borderRadius: 3, marginTop: 10, position: "relative", overflow: "visible" },
  rangeMarker: { position: "absolute", top: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.3s" },

  main: { flex: 1, overflowY: "auto", padding: "24px" },
  chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  rangeBtn: { fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", transition: "background 0.15s, color 0.15s", fontFamily: "'DM Sans',sans-serif" },

  statsStrip: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 },
  statItem: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: "12px 16px" },
  statValue: { fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: "#aaa", marginTop: 4 },

  tabRow: { display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", marginBottom: 20 },
  tabBtn: { fontSize: 13, padding: "10px 18px", background: "none", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "color 0.15s, border-color 0.15s" },

  chartWrap: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16, padding: "20px", height: 320, marginBottom: 24 },
  loadingState: { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 },
  loadingSpinner: { width: 28, height: 28, border: "2.5px solid #e8e8e8", borderTopColor: "#1D9E75", borderRadius: "50%", animation: "cc-spin 0.7s linear infinite" },

  tableWrap: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16, overflow: "hidden", marginBottom: 24 },
  tableHead: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr 1fr 1fr 1fr", gap: 8, padding: "10px 16px", background: "#f9f9f9", borderBottom: "1px solid #f0f0f0", fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr 1fr 1fr 1fr", gap: 8, padding: "11px 16px", borderBottom: "1px solid #f7f7f7", alignItems: "center" },
  tableCell: { fontSize: 13 },

  allVitalsSection: { marginTop: 4 },
  allVitalsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginTop: 12 },
  snapshotCard: { background: "#fff", borderRadius: 14, padding: "14px 16px", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" },
  snapshotIcon: { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@700;800&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
  .cc-vital-item:hover { opacity: 0.85; }
  .cc-snapshot-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.07); }
  .cc-range-btn:hover { opacity: 0.8; }
  .cc-back-btn:hover { background: #e8e8e8 !important; }
  .cc-topbar-btn:hover { background: #ebebeb !important; }
  @keyframes cc-spin { to { transform: rotate(360deg); } }
  @media (max-width: 900px) {
    div[style*="width: 260px"] { display: none; }
    div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: repeat(2,1fr) !important; }
    div[style*="gridTemplateColumns: 1.2fr 1fr 1.2fr"] { grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr !important; font-size: 11px !important; }
  }
`;