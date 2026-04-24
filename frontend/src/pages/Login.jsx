/* eslint-disable no-dupe-keys */
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient"); // "patient" | "doctor"

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async () => {
    if (!form.email || !form.password) {
      setError("Please enter both your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      login(res.data);
      const userRole = res.data.user.role;
      if (userRole === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ── Left: brand panel ── */}
      <div style={s.panel} className="cc-panel">
        {/* subtle grid pattern */}
        <div style={s.panelGrid} aria-hidden />

        <Link to="/" style={s.logo}>
          <span style={s.logoDot} />
          CloudClinic
        </Link>

        <div style={s.panelBody}>
          <div style={s.tagline}>
            <div style={s.taglinePulse} />
            Live health monitoring — Kenya
          </div>

          <h2 style={s.panelHeading}>
            Your patients<br />are waiting<br />
            <span style={{ color: "#5DCAA5" }}>for you.</span>
          </h2>

          <p style={s.panelSub}>
            Sign in to view real-time vitals, respond to alerts, and connect with patients across 47 counties.
          </p>

          {/* Mini stats */}
          <div style={s.miniStats}>
            {[
              { value: "6", label: "Active patients now" },
              { value: "3", label: "Unread alerts" },
              { value: "2", label: "Consults pending" },
            ].map(stat => (
              <div key={stat.label} style={s.miniStat}>
                <span style={s.miniStatValue}>{stat.value}</span>
                <span style={s.miniStatLabel}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={s.testimonial}>
            <div style={s.testimonialQuote}>"</div>
            <p style={s.testimonialText}>
              CloudClinic lets me manage triple the patients I used to see in-clinic, with better outcomes.
            </p>
            <div style={s.testimonialAuthor}>
              <div style={s.testimonialAvatar}>KM</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Dr. Kibet M.</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>GP, Uasin Gishu County</div>
              </div>
            </div>
          </div>
        </div>

        <p style={s.panelFooter}>
          New to CloudClinic?{" "}
          <Link to="/register-patient" style={{ color: "#5DCAA5", fontWeight: 600, textDecoration: "none" }}>
            Create an account
          </Link>
        </p>
      </div>

      {/* ── Right: login form ── */}
      <div style={s.formSide}>
        <div style={s.card}>

          {/* Role toggle */}
          <div style={s.roleToggle}>
            {["patient", "doctor"].map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  ...s.roleBtn,
                  background: role === r ? "#fff" : "transparent",
                  color: role === r ? "#0d1f1a" : "#aaa",
                  boxShadow: role === r ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
                }}
                className="cc-role-btn"
              >
                {r === "patient"
                  ? <><PatientIcon active={role === r}/> Patient</>
                  : <><DoctorIcon active={role === r}/> Doctor</>
                }
              </button>
            ))}
          </div>

          <h2 style={s.cardTitle}>Welcome back</h2>
          <p style={s.cardSub}>
            Sign in to your {role === "doctor" ? "doctor" : "patient"} account.
          </p>

          {/* Email */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Email address</label>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="3" width="12" height="8" rx="2" stroke="#bbb" strokeWidth="1.3"/>
                  <path d="M1 5l6 4 6-4" stroke="#bbb" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                style={s.input}
                className="cc-input"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div style={s.fieldGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <label style={s.label}>Password</label>
              <a href="#" style={{ fontSize: 12, color: "#0F6E56", fontWeight: 600, textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#bbb" strokeWidth="1.3"/>
                  <path d="M4 6V5a3 3 0 1 1 6 0v1" stroke="#bbb" strokeWidth="1.3"/>
                  <circle cx="7" cy="9.5" r="1" fill="#bbb"/>
                </svg>
              </span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Your password"
                style={{ ...s.input, paddingRight: 44 }}
                className="cc-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={s.eyeBtn}
              >
                {showPassword
                  ? <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="#aaa" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="#aaa" strokeWidth="1.4"/><path d="M2 2l12 12" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="#aaa" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="#aaa" strokeWidth="1.4"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="6" stroke="#A32D2D" strokeWidth="1.4"/>
                <path d="M7 4v3M7 9.5v.5" stroke="#A32D2D" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            style={{ ...s.btnPrimary, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            className="cc-btn-primary"
          >
            {loading
              ? <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span style={s.spinner} /> Signing in…
                </span>
              : `Sign in as ${role === "doctor" ? "Doctor" : "Patient"} →`
            }
          </button>

          {/* Divider */}
          <div style={s.divider}>
            <span style={s.dividerLine} />
            <span style={s.dividerText}>New to CloudClinic?</span>
            <span style={s.dividerLine} />
          </div>

          {/* Register links */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/register-patient" style={s.registerLink} className="cc-register-link">
              <PatientIcon active={false} /> Register as Patient
            </Link>
            <Link to="/register-doctor" style={s.registerLink} className="cc-register-link">
              <DoctorIcon active={false} /> Register as Doctor
            </Link>
          </div>

          {/* Language strip */}
          <div style={s.langStrip}>
            {["EN", "SW", "KAL", "KIK", "LUO"].map(l => (
              <span key={l} style={s.langChip}>{l}</span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

function PatientIcon({ active }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="5" r="3" stroke={active ? "#0F6E56" : "#bbb"} strokeWidth="1.4"/>
      <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={active ? "#0F6E56" : "#bbb"} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function DoctorIcon({ active }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="5" r="3" stroke={active ? "#185FA5" : "#bbb"} strokeWidth="1.4"/>
      <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={active ? "#185FA5" : "#bbb"} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M10 9v3M8.5 10.5h3" stroke={active ? "#185FA5" : "#bbb"} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    background: "#f7fcfa",
  },
  panel: {
    width: 400,
    flexShrink: 0,
    background: "#0d1f1a",
    padding: "40px 40px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    position: "relative",
    overflow: "hidden",
  },
  panelGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(circle, rgba(29,158,117,0.06) 1px, transparent 1px)`,
    backgroundSize: "28px 28px",
    pointerEvents: "none",
  },
  logo: {
    fontFamily: "'Sora',sans-serif",
    fontWeight: 800,
    fontSize: 20,
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 56,
    position: "relative",
    zIndex: 1,
  },
  logoDot: {
    width: 8, height: 8,
    borderRadius: "50%",
    background: "#1D9E75",
    display: "inline-block",
  },
  panelBody: { flex: 1, position: "relative", zIndex: 1 },
  tagline: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(29,158,117,0.12)",
    border: "1px solid rgba(29,158,117,0.2)",
    color: "#5DCAA5",
    fontSize: 11, fontWeight: 700,
    letterSpacing: 0.8, textTransform: "uppercase",
    padding: "5px 12px", borderRadius: 20,
    marginBottom: 24,
  },
  taglinePulse: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#1D9E75",
    animation: "cc-pulse 2s infinite",
  },
  panelHeading: {
    fontFamily: "'Sora',sans-serif",
    fontSize: 36,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.2,
    letterSpacing: -1.2,
    marginBottom: 16,
  },
  panelSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.75,
    marginBottom: 36,
    maxWidth: 300,
  },
  miniStats: {
    display: "flex", gap: 0,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "20px 0",
    marginBottom: 32,
  },
  miniStat: {
    flex: 1, textAlign: "center",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  miniStatValue: {
    display: "block",
    fontFamily: "'Sora',sans-serif",
    fontSize: 24, fontWeight: 800,
    color: "#1D9E75", letterSpacing: -0.5,
  },
  miniStatLabel: {
    display: "block",
    fontSize: 10.5, color: "rgba(255,255,255,0.35)",
    marginTop: 4, lineHeight: 1.4,
  },
  testimonial: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "20px",
  },
  testimonialQuote: {
    fontFamily: "'Sora',sans-serif",
    fontSize: 40, fontWeight: 800,
    color: "rgba(29,158,117,0.4)",
    lineHeight: 0.8, marginBottom: 10,
  },
  testimonialText: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7,
    fontStyle: "italic",
    marginBottom: 16,
  },
  testimonialAuthor: { display: "flex", alignItems: "center", gap: 10 },
  testimonialAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(29,158,117,0.2)",
    color: "#5DCAA5",
    fontSize: 11, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  panelFooter: {
    fontSize: 13, color: "rgba(255,255,255,0.35)",
    marginTop: 40, position: "relative", zIndex: 1,
  },

  formSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    border: "1px solid #ebebeb",
  },
  roleToggle: {
    display: "flex",
    background: "#f4f4f4",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 32,
  },
  roleBtn: {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "9px 16px",
    borderRadius: 9,
    border: "none",
    cursor: "pointer",
    fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans',sans-serif",
    transition: "all 0.2s",
  },
  cardTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: 24, fontWeight: 800,
    color: "#0d1f1a", letterSpacing: -0.5,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 14, color: "#9ca3af",
    lineHeight: 1.6, marginBottom: 28,
  },
  fieldGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
    display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 38px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14, color: "#111827",
    outline: "none",
    background: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans',sans-serif",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0,
  },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#FCEBEB", border: "1px solid #F7C1C1",
    borderRadius: 10, padding: "10px 14px",
    fontSize: 13, color: "#A32D2D",
    marginBottom: 16, lineHeight: 1.5,
  },
  btnPrimary: {
    width: "100%",
    background: "#0F6E56", color: "#fff",
    padding: "14px 28px", borderRadius: 30,
    fontSize: 15, fontWeight: 700,
    border: "none",
    fontFamily: "'DM Sans',sans-serif",
    letterSpacing: 0.1,
    transition: "background 0.2s, transform 0.1s",
    marginBottom: 24,
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12,
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, background: "#f0f0f0" },
  dividerText: { fontSize: 12, color: "#ccc", whiteSpace: "nowrap" },
  registerLink: {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    background: "#f7f7f7", border: "1.5px solid #ebebeb",
    color: "#555", fontSize: 13, fontWeight: 600,
    padding: "10px 14px", borderRadius: 12,
    textDecoration: "none",
    transition: "border-color 0.2s, background 0.2s",
  },
  langStrip: {
    display: "flex", justifyContent: "center", gap: 12,
    marginTop: 24, paddingTop: 20,
    borderTop: "1px solid #f5f5f5",
  },
  langChip: { fontSize: 11, color: "#ccc", fontWeight: 600, letterSpacing: 0.5 },
  spinner: {
    width: 15, height: 15,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "cc-spin 0.7s linear infinite",
    display: "inline-block", flexShrink: 0,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@700;800&display=swap');
  * { box-sizing: border-box; }
  .cc-input:focus { border-color: #0F6E56 !important; box-shadow: 0 0 0 3px rgba(15,110,86,0.1) !important; }
  .cc-btn-primary:hover:not(:disabled) { background: #0a5240 !important; transform: translateY(-1px); }
  .cc-register-link:hover { border-color: #ccc !important; background: #f0f0f0 !important; }
  .cc-role-btn:hover { opacity: 0.85; }
  @keyframes cc-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
  @keyframes cc-spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) { .cc-panel { display: none !important; } }
`;