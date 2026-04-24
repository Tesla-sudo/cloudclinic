import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const SPECIALTIES = [
  "General Practice","Internal Medicine","Obstetrics & Gynaecology",
  "Paediatrics","Cardiology","Endocrinology","Surgery","Orthopaedics",
  "Ophthalmology","Dermatology","Psychiatry","Radiology","Anaesthesiology",
  "Emergency Medicine","Family Medicine","Oncology","Urology","Neurology",
  "Pulmonology","Nephrology"
];

const STEPS = ["Account", "Credentials", "Placement"];

export default function RegisterDoctor() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    kmpdcPin: "", specialty: "", county: "", hospital: ""
  });

  const [counties, setCounties] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    API.get("/hospitals/counties")
      .then(res => setCounties(res.data))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setError("");
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCounty = async (county) => {
    setError("");
    setForm(prev => ({ ...prev, county, hospital: "" }));
    setHospitals([]);
    if (!county) return;
    setHospitalsLoading(true);
    try {
      const res = await API.get(`/hospitals?county=${county}`);
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHospitalsLoading(false);
    }
  };

  const stepFields = [
    ["name", "email", "phone", "password"],
    ["kmpdcPin", "specialty"],
    ["county", "hospital"],
  ];

  const canProceed = stepFields[step].every(f => form[f] !== "");

  const next = () => { if (canProceed) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const submit = async () => {
    if (!canProceed) return;
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/doctor/register", form);
      navigate("/login", { state: { registered: true, role: "doctor" } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* Left panel */}
      <div style={styles.panel} className="cc-panel">
        <Link to="/" style={styles.logo}>
          <span style={styles.logoDot} />
          CloudClinic
        </Link>

        <div style={styles.panelContent}>
          <div style={styles.panelBadge}>For Doctors</div>
          <h2 style={styles.panelTitle}>
            Extend your<br />reach across<br />
            <span style={{ color: "#85B7EB" }}>47 counties.</span>
          </h2>
          <p style={styles.panelSub}>
            Join Kenya's network of accredited doctors monitoring patients remotely — with real-time IoT vitals delivered to your dashboard.
          </p>

          <div style={styles.panelFeatures}>
            {[
              { icon: "", text: "Real-time patient vitals dashboard" },
              { icon: "", text: "Priority-ranked alert inbox" },
              { icon: "", text: "One-click WebRTC teleconsultation" },
              { icon: "", text: "Medication & follow-up scheduling" },
              { icon: "", text: "Postpartum & neonatal tracker" },
            ].map(f => (
              <div key={f.text} style={styles.panelFeatureItem}>
                <span style={{ fontSize: 15 }}>{f.icon}</span>
                <span style={styles.panelFeatureText}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={styles.kmpdcNote}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="7" cy="7" r="6" stroke="#85B7EB" strokeWidth="1.4"/>
              <path d="M7 6v4M7 4.5v.5" stroke="#85B7EB" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span>Your KMPDC PIN is verified against the national practitioner registry before approval.</span>
          </div>
        </div>

        <p style={styles.panelFooter}>
          Already registered?{" "}
          <Link to="/login" style={{ color: "#85B7EB", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>

      {/* Form side */}
      <div style={styles.formSide}>
        <div style={styles.card}>

          {/* Step indicators */}
          <div style={styles.stepRow}>
            {STEPS.map((s, i) => (
              <div key={s} style={styles.stepItem}>
                <div style={{
                  ...styles.stepCircle,
                  background: i <= step ? "#185FA5" : "#f0f0f0",
                  color: i <= step ? "#fff" : "#bbb",
                }}>
                  {i < step
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    : <span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  }
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: i === step ? "#185FA5" : "#bbb", marginTop: 5 }}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div style={{ ...styles.stepLine, background: i < step ? "#185FA5" : "#e8e8e8" }} />
                )}
              </div>
            ))}
          </div>

          <h2 style={styles.cardTitle}>
            {["Create your account", "Your credentials", "Your placement"][step]}
          </h2>
          <p style={styles.subtext}>
            {[
              "Start with your basic login details.",
              "Verify your medical credentials.",
              "Select your county and affiliated hospital.",
            ][step]}
          </p>

          <div style={styles.fields}>

            {/* STEP 0 — Account */}
            {step === 0 && <>
              <Field label="Full Name" required>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="Dr. Kibet Mutai"
                  style={styles.input} className="cc-input" />
              </Field>
              <Field label="Email Address" required>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="doctor@hospital.ke"
                  style={styles.input} className="cc-input" />
              </Field>
              <Field label="Phone Number" required hint="For patient alert notifications">
                <div style={{ position: "relative" }}>
                  <span style={styles.phonePrefix}>+254</span>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="7XX XXX XXX"
                    style={{ ...styles.input, paddingLeft: 60 }}
                    className="cc-input" />
                </div>
              </Field>
              <Field label="Password" required>
                <div style={{ position: "relative" }}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password} onChange={handleChange}
                    placeholder="At least 8 characters"
                    style={{ ...styles.input, paddingRight: 44 }}
                    className="cc-input"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="#888" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="#888" strokeWidth="1.4"/><path d="M2 2l12 12" stroke="#888" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="#888" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="#888" strokeWidth="1.4"/></svg>
                    }
                  </button>
                </div>
              </Field>
            </>}

            {/* STEP 1 — Credentials */}
            {step === 1 && <>
              <Field label="KMPDC PIN" required hint="e.g. DR12345">
                <div style={{ position: "relative" }}>
                  <span style={styles.inputPrefix}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1" y="5" width="12" height="8" rx="2" stroke="#888" strokeWidth="1.3"/>
                      <path d="M4 5V4a3 3 0 0 1 6 0v1" stroke="#888" strokeWidth="1.3"/>
                      <circle cx="7" cy="9" r="1.2" fill="#888"/>
                    </svg>
                  </span>
                  <input name="kmpdcPin" value={form.kmpdcPin} onChange={handleChange}
                    placeholder="DR12345"
                    style={{ ...styles.input, paddingLeft: 40, textTransform: "uppercase", letterSpacing: 1 }}
                    className="cc-input" />
                </div>
              </Field>

              <Field label="Specialty" required>
                <select name="specialty" value={form.specialty} onChange={handleChange}
                  style={styles.select} className="cc-input">
                  <option value="">Select your specialty</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <div style={styles.infoCard}>
                <div style={styles.infoCardTitle}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="6" stroke="#185FA5" strokeWidth="1.3"/>
                    <path d="M7 6.5v3M7 4v.5" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  KMPDC Verification
                </div>
                <p style={styles.infoCardText}>
                  Your PIN will be cross-referenced with the Kenya Medical Practitioners and Dentists Council registry. This typically takes under 24 hours. You'll receive an email confirmation once approved.
                </p>
              </div>
            </>}

            {/* STEP 2 — Placement */}
            {step === 2 && <>
              <Field label="County" required hint="Where you primarily practice">
                <select
                  value={form.county}
                  onChange={(e) => handleCounty(e.target.value)}
                  style={styles.select} className="cc-input"
                >
                  <option value="">Select your county</option>
                  {counties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Affiliated Hospital" required>
                <div style={{ position: "relative" }}>
                  <select
                    name="hospital"
                    value={form.hospital}
                    onChange={e => setForm(prev => ({ ...prev, hospital: e.target.value }))}
                    style={{ ...styles.select, opacity: !form.county ? 0.5 : 1 }}
                    className="cc-input"
                    disabled={!form.county || hospitalsLoading}
                  >
                    <option value="">
                      {hospitalsLoading ? "Loading hospitals…" : !form.county ? "Select county first" : "Select hospital"}
                    </option>
                    {hospitals.map(h => <option key={h._id} value={h.name}>{h.name}</option>)}
                  </select>
                  {hospitalsLoading && (
                    <span style={{ position: "absolute", right: 36, top: "50%", transform: "translateY(-50%)" }}>
                      <span style={{ ...styles.spinner, borderTopColor: "#185FA5", width: 13, height: 13 }} />
                    </span>
                  )}
                </div>
              </Field>

              {/* Summary */}
              <div style={styles.summaryBox}>
                <div style={styles.summaryTitle}>Registration summary</div>
                <div style={styles.summaryGrid}>
                  {[
                    ["Name", form.name],
                    ["Email", form.email],
                    ["Phone", form.phone ? `+254 ${form.phone}` : "—"],
                    ["KMPDC PIN", form.kmpdcPin || "—"],
                    ["Specialty", form.specialty || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={styles.summaryRow}>
                      <span style={styles.summaryKey}>{k}</span>
                      <span style={styles.summaryVal}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>}

          </div>

          {error && (
            <div style={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#A32D2D" strokeWidth="1.4"/>
                <path d="M7 4v3M7 9.5v.5" stroke="#A32D2D" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <div style={styles.btnRow}>
            {step > 0 && (
              <button onClick={back} style={styles.btnBack} className="cc-btn-back">
                ← Back
              </button>
            )}
            {step < 2
              ? <button onClick={next} disabled={!canProceed}
                  style={{ ...styles.btnPrimary, flex: 1, opacity: canProceed ? 1 : 0.45, cursor: canProceed ? "pointer" : "not-allowed" }}
                  className="cc-btn-primary">
                  Continue →
                </button>
              : <button onClick={submit} disabled={loading || !canProceed}
                  style={{ ...styles.btnPrimary, flex: 1, opacity: (loading || !canProceed) ? 0.7 : 1, cursor: (loading || !canProceed) ? "not-allowed" : "pointer" }}
                  className="cc-btn-primary">
                  {loading
                    ? <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                        <span style={styles.spinner} /> Submitting application…
                      </span>
                    : "Submit application →"
                  }
                </button>
            }
          </div>

          <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", marginTop: 20, lineHeight: 1.7 }}>
            By registering you agree to CloudClinic's terms of service &amp; medical practitioner guidelines.{" "}
            Registering as a patient instead?{" "}
            <Link to="/register-patient" style={{ color: "#185FA5", fontWeight: 600, textDecoration: "none" }}>
              Register here
            </Link>.
          </p>

        </div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
        {label}
        {required && <span style={{ color: "#185FA5", marginLeft: 2 }}>*</span>}
        {hint && <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f5f8ff",
  },
  panel: {
    width: 360,
    flexShrink: 0,
    background: "#0c1a2e",
    padding: "40px 36px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
  },
  logo: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 800,
    fontSize: 20,
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 48,
  },
  logoDot: {
    width: 8, height: 8,
    borderRadius: "50%",
    background: "#378ADD",
    display: "inline-block",
  },
  panelContent: { flex: 1 },
  panelBadge: {
    display: "inline-block",
    background: "rgba(55,138,221,0.15)",
    color: "#85B7EB",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    padding: "5px 12px",
    borderRadius: 20,
    marginBottom: 20,
  },
  panelTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 30,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.25,
    letterSpacing: -1,
    marginBottom: 16,
  },
  panelSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.75,
    marginBottom: 32,
  },
  panelFeatures: { display: "flex", flexDirection: "column", gap: 13 },
  panelFeatureItem: { display: "flex", alignItems: "center", gap: 12 },
  panelFeatureText: { fontSize: 13.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 },
  kmpdcNote: {
    display: "flex", gap: 8, alignItems: "flex-start",
    marginTop: 28,
    background: "rgba(55,138,221,0.08)",
    border: "1px solid rgba(55,138,221,0.2)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 12.5,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.65,
  },
  panelFooter: { fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 40 },

  formSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    overflowY: "auto",
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    border: "1px solid #e8edf5",
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: 36,
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  stepCircle: {
    width: 28, height: 28,
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1,
    transition: "background 0.3s",
  },
  stepLine: {
    position: "absolute",
    top: 14,
    left: "calc(50% + 14px)",
    right: "calc(-50% + 14px)",
    height: 1.5,
    transition: "background 0.3s",
  },
  cardTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    color: "#0c1a2e",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtext: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 1.6,
    marginBottom: 28,
  },
  fields: {},
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
    outline: "none",
    background: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  select: {
    width: "100%",
    padding: "12px 40px 12px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
    outline: "none",
    background: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    cursor: "pointer",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0,
  },
  phonePrefix: {
    position: "absolute", left: 0, top: 0, bottom: 0,
    display: "flex", alignItems: "center",
    padding: "0 14px",
    fontSize: 13, fontWeight: 700, color: "#555",
    borderRight: "1.5px solid #e5e7eb",
    background: "#f9fafb",
    borderRadius: "10px 0 0 10px",
    zIndex: 1,
    pointerEvents: "none",
  },
  inputPrefix: {
    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
    display: "flex", alignItems: "center",
    pointerEvents: "none", zIndex: 1,
  },
  infoCard: {
    background: "#EBF4FD",
    border: "1px solid #B5D4F4",
    borderRadius: 12,
    padding: "14px 16px",
    marginTop: 4,
  },
  infoCardTitle: {
    display: "flex", alignItems: "center", gap: 7,
    fontSize: 13, fontWeight: 700, color: "#185FA5",
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 13, color: "#378ADD", lineHeight: 1.7,
  },
  summaryBox: {
    background: "#EBF4FD",
    border: "1px solid #B5D4F4",
    borderRadius: 12,
    padding: "16px 20px",
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 11, fontWeight: 700, color: "#185FA5",
    textTransform: "uppercase", letterSpacing: 0.8,
    marginBottom: 12,
  },
  summaryGrid: { display: "flex", flexDirection: "column", gap: 9 },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  summaryKey: { fontSize: 13, color: "#6b7280", fontWeight: 500 },
  summaryVal: { fontSize: 13, color: "#0c1a2e", fontWeight: 600 },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#FCEBEB",
    border: "1px solid #F7C1C1",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13, color: "#A32D2D",
    marginBottom: 16, lineHeight: 1.5,
  },
  btnRow: { display: "flex", gap: 10, marginTop: 8 },
  btnPrimary: {
    display: "block",
    background: "#185FA5",
    color: "#fff",
    padding: "13px 28px",
    borderRadius: 30,
    fontSize: 15,
    fontWeight: 700,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "center",
    transition: "background 0.2s, transform 0.1s",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnBack: {
    background: "transparent",
    color: "#6b7280",
    padding: "13px 20px",
    borderRadius: 30,
    fontSize: 14,
    fontWeight: 600,
    border: "1.5px solid #e5e7eb",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    transition: "border-color 0.2s, color 0.2s",
  },
  spinner: {
    width: 15, height: 15,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "cc-spin 0.7s linear infinite",
    display: "inline-block",
    flexShrink: 0,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@700;800&display=swap');
  .cc-input:focus { border-color: #185FA5 !important; box-shadow: 0 0 0 3px rgba(24,95,165,0.1) !important; }
  .cc-btn-primary:hover:not(:disabled) { background: #0C447C !important; transform: translateY(-1px); }
  .cc-btn-back:hover { border-color: #9ca3af !important; color: #374151 !important; }
  @keyframes cc-spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) { .cc-panel { display: none !important; } }
`;