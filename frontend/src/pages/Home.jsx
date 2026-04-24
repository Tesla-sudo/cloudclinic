/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "For Doctors", to: "/register-doctor" },
  { label: "For Patients", to: "/register-patient" },
  { label: "How It Works", to: "#how-it-works" },
  { label: "About", to: "#about" },
];

const STATS = [
  { value: "1.5M+", label: "Annual Births Monitored" },
  { value: "2.7M", label: "Chronic Patients in Kenya" },
  { value: "47", label: "Counties Covered" },
  { value: "5", label: "Local Languages" },
];

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="3" width="22" height="22" rx="6" stroke="#0F6E56" strokeWidth="1.8"/>
        <path d="M14 8v6l4 2" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="2" fill="#0F6E56"/>
      </svg>
    ),
    accent: "#0F6E56",
    bg: "#E1F5EE",
    title: "Real-Time IoT Vitals",
    desc: "Continuous monitoring of temperature, blood pressure, SpO₂, heart rate, and glucose from a locally-assembled portable kit.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="16" height="18" rx="3" stroke="#185FA5" strokeWidth="1.8"/>
        <path d="M19 9h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 12h7M8 16h5" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    accent: "#185FA5",
    bg: "#E6F1FB",
    title: "GSM/SMS Alerts",
    desc: "Critical alerts reach doctors and caregivers even in Turkana or Mandera — no internet connection required.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5" stroke="#854F0B" strokeWidth="1.8"/>
        <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#854F0B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20 6l2 2-2 2" stroke="#854F0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: "#854F0B",
    bg: "#FAEEDA",
    title: "AI Health Assistant",
    desc: "Conversational health guidance in Swahili, Kalenjin, Kikuyu, Luo, and Luhya — by voice or text, online or offline.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3C8.5 3 4 7.5 4 13c0 3.7 2 6.9 5 8.7V25l5-2 5 2v-3.3c3-1.8 5-5 5-8.7C24 7.5 19.5 3 14 3z" stroke="#993C1D" strokeWidth="1.8"/>
        <path d="M10 13h8M14 9v8" stroke="#993C1D" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    accent: "#993C1D",
    bg: "#FAECE7",
    title: "Maternal & Neonatal Care",
    desc: "Antenatal and postnatal tracking modules for mothers and newborns, with milestone alerts for healthcare providers.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="5" stroke="#533AB7" strokeWidth="1.8"/>
        <path d="M9 14l3 3 7-7" stroke="#533AB7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: "#533AB7",
    bg: "#EEEDFE",
    title: "Geolocation Matching",
    desc: "Patients are automatically connected to the nearest accredited doctor, reducing care gaps in underserved regions.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="8" width="18" height="14" rx="3" stroke="#3B6D11" strokeWidth="1.8"/>
        <path d="M10 8V6a4 4 0 0 1 8 0v2" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="14" cy="15" r="2" fill="#3B6D11"/>
      </svg>
    ),
    accent: "#3B6D11",
    bg: "#EAF3DE",
    title: "Secure & Private",
    desc: "JWT-authenticated, role-based access hosted on GCP Nairobi — your health data stays in Kenya.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Nilianza kufuatilia shinikizo langu nyumbani baada ya kujifungua. CloudClinic iliokoa maisha yangu.",
    translation: '"I started monitoring my blood pressure at home after delivery. CloudClinic saved my life."',
    name: "Akinyi W.",
    role: "New Mother, Kisumu",
    initials: "AW",
    color: "#1D9E75",
    bg: "#E1F5EE",
  },
  {
    quote: "As a doctor in Eldoret, I now manage 3× more patients remotely with real-time vitals on my dashboard.",
    name: "Dr. Kibet M.",
    role: "General Practitioner, Uasin Gishu",
    initials: "KM",
    color: "#185FA5",
    bg: "#E6F1FB",
  },
  {
    quote: "My glucose readings go directly to my doctor. No more travelling 40km for a check-up.",
    name: "Mwangi J.",
    role: "Diabetic Patient, Nyeri",
    initials: "MJ",
    color: "#854F0B",
    bg: "#FAEEDA",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Register at a partner clinic", desc: "A nurse registers you and pairs your CloudClinic kit with your profile." },
  { step: "02", title: "Take daily readings at home", desc: "Clip on the sensor. The kit measures vitals in under 60 seconds." },
  { step: "03", title: "Data streams to your doctor", desc: "Readings are sent via MQTT or SMS fallback to your assigned doctor's dashboard." },
  { step: "04", title: "Get guidance in your language", desc: "Ask our AI health assistant anything — in Swahili, Kalenjin, Luo, Kikuyu, or Luhya." },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#1a1a2e", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cc-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5%;
          height: 68px;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .cc-nav.scrolled {
          background: rgba(255,255,255,0.97);
          box-shadow: 0 1px 0 rgba(0,0,0,0.07);
          backdrop-filter: blur(12px);
        }
        .cc-logo {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.5px;
          color: #0F6E56;
          text-decoration: none;
          display: flex; align-items: center; gap: 8px;
        }
        .cc-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #1D9E75; margin-top: 1px; }
        .cc-nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .cc-nav-links a { text-decoration: none; font-size: 14px; font-weight: 500; color: #444; transition: color 0.2s; }
        .cc-nav-links a:hover { color: #0F6E56; }
        .cc-nav-cta {
          background: #0F6E56; color: #fff;
          padding: 9px 22px; border-radius: 24px;
          font-size: 13px; font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, transform 0.1s;
          white-space: nowrap;
        }
        .cc-nav-cta:hover { background: #0a5240; transform: translateY(-1px); }

        .cc-hero {
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 120px 5% 80px;
          position: relative;
          background: linear-gradient(135deg, #f0faf6 0%, #f5f8ff 50%, #fffaf5 100%);
          overflow: hidden;
        }
        .cc-hero-bg-circle {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, #c8f0e2 0%, transparent 70%);
          pointer-events: none;
        }
        .cc-hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: #E1F5EE; color: #0F6E56;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.5px; text-transform: uppercase;
          margin-bottom: 24px; width: fit-content;
        }
        .cc-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #1D9E75; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .cc-hero h1 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(38px, 6vw, 72px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
          color: #0d1f1a;
          max-width: 820px;
          margin-bottom: 24px;
        }
        .cc-hero h1 span { color: #1D9E75; }
        .cc-hero-sub {
          font-size: clamp(16px, 2vw, 19px);
          color: #4a5568;
          max-width: 580px;
          line-height: 1.7;
          margin-bottom: 44px;
        }
        .cc-hero-btns { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 64px; }
        .cc-btn-primary {
          background: #0F6E56; color: #fff;
          padding: 14px 30px; border-radius: 30px;
          font-size: 15px; font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 24px rgba(15,110,86,0.25);
        }
        .cc-btn-primary:hover { background: #0a5240; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(15,110,86,0.3); }
        .cc-btn-secondary {
          background: #fff; color: #0F6E56;
          padding: 14px 30px; border-radius: 30px;
          font-size: 15px; font-weight: 600;
          text-decoration: none;
          border: 1.5px solid #0F6E56;
          transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .cc-btn-secondary:hover { background: #f0faf6; transform: translateY(-2px); }
        .cc-btn-outline {
          background: transparent; color: #444;
          padding: 14px 28px; border-radius: 30px;
          font-size: 15px; font-weight: 500;
          text-decoration: none;
          border: 1.5px solid #ddd;
          transition: all 0.2s;
        }
        .cc-btn-outline:hover { border-color: #888; color: #222; }

        .cc-stats-strip {
          display: flex; flex-wrap: wrap; gap: 0;
          border-top: 1px solid #e8e8e8;
          padding-top: 40px;
        }
        .cc-stat-item { flex: 1; min-width: 130px; padding-right: 40px; }
        .cc-stat-item:not(:last-child) { border-right: 1px solid #e8e8e8; margin-right: 40px; }
        .cc-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 34px; font-weight: 800;
          color: #0F6E56; letter-spacing: -1px;
          line-height: 1;
        }
        .cc-stat-label { font-size: 13px; color: #888; margin-top: 6px; font-weight: 500; }

        .cc-section { padding: 100px 5%; }
        .cc-section-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 12px; font-weight: 600;
          letter-spacing: 1px; text-transform: uppercase;
          color: #0F6E56; margin-bottom: 16px;
        }
        .cc-section-tag::before { content: ''; display: block; width: 20px; height: 2px; background: #1D9E75; border-radius: 2px; }
        .cc-section-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800; letter-spacing: -1.5px;
          line-height: 1.15; color: #0d1f1a;
          margin-bottom: 16px;
        }
        .cc-section-sub { font-size: 17px; color: #555; line-height: 1.7; max-width: 560px; }

        .cc-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 56px;
        }
        .cc-feature-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 20px;
          padding: 32px 28px;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .cc-feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cc-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .cc-feature-card:hover::before { opacity: 1; }
        .cc-feature-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .cc-feature-title { font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; color: #0d1f1a; margin-bottom: 10px; }
        .cc-feature-desc { font-size: 14px; color: #666; line-height: 1.7; }

        .cc-how-section { background: #0d1f1a; padding: 100px 5%; position: relative; overflow: hidden; }
        .cc-how-section::before {
          content: ''; position: absolute;
          top: -100px; right: -100px;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .cc-how-steps { display: flex; flex-direction: column; gap: 0; margin-top: 56px; max-width: 640px; }
        .cc-how-step { display: flex; gap: 24px; position: relative; padding-bottom: 40px; }
        .cc-how-step:last-child { padding-bottom: 0; }
        .cc-how-step-line {
          display: flex; flex-direction: column; align-items: center; min-width: 44px;
        }
        .cc-how-step-num {
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 800;
          color: #1D9E75;
          width: 44px; height: 44px;
          border: 1.5px solid #1D9E75;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }
        .cc-how-step-connector {
          flex: 1; width: 1px; background: rgba(29,158,117,0.2);
          margin: 8px 0;
        }
        .cc-how-step-content { padding-top: 10px; }
        .cc-how-step-title { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .cc-how-step-desc { font-size: 15px; color: #8ba89e; line-height: 1.7; }

        .cc-lang-section { padding: 80px 5%; background: #f9fffe; }
        .cc-lang-pills { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
        .cc-lang-pill {
          background: #fff; border: 1.5px solid #d8ede7;
          color: #0F6E56; border-radius: 30px;
          padding: 10px 22px; font-size: 14px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }
        .cc-lang-pill-flag { font-size: 18px; }

        .cc-testimonials-section { padding: 100px 5%; background: #fff; }
        .cc-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 56px;
        }
        .cc-testimonial-card {
          border: 1px solid #ebebeb;
          border-radius: 20px;
          padding: 32px 28px;
          background: #fff;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cc-testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(0,0,0,0.07); }
        .cc-quote-mark {
          font-family: 'Sora', sans-serif;
          font-size: 56px; font-weight: 800;
          line-height: 0.6;
          margin-bottom: 16px;
        }
        .cc-testimonial-body { font-size: 15px; color: #333; line-height: 1.75; margin-bottom: 8px; font-style: italic; }
        .cc-testimonial-translation { font-size: 12.5px; color: #999; line-height: 1.6; margin-bottom: 24px; }
        .cc-testimonial-author { display: flex; align-items: center; gap: 12px; }
        .cc-testimonial-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          flex-shrink: 0;
        }
        .cc-testimonial-name { font-size: 14px; font-weight: 600; color: #0d1f1a; }
        .cc-testimonial-role { font-size: 12px; color: #999; }

        .cc-cta-section {
          background: linear-gradient(135deg, #0F6E56 0%, #0d5444 100%);
          padding: 100px 5%;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .cc-cta-section::before {
          content: ''; position: absolute;
          top: -60px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
        }
        .cc-cta-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(28px, 4vw, 50px);
          font-weight: 800; letter-spacing: -1.5px;
          color: #fff; margin-bottom: 16px;
        }
        .cc-cta-sub { font-size: 17px; color: rgba(255,255,255,0.75); max-width: 500px; margin: 0 auto 44px; line-height: 1.7; }
        .cc-cta-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; }
        .cc-cta-btn-white {
          background: #fff; color: #0F6E56;
          padding: 14px 32px; border-radius: 30px;
          font-size: 15px; font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }
        .cc-cta-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
        .cc-cta-btn-ghost {
          background: transparent; color: #fff;
          padding: 14px 30px; border-radius: 30px;
          font-size: 15px; font-weight: 600;
          text-decoration: none;
          border: 1.5px solid rgba(255,255,255,0.4);
          transition: all 0.2s;
        }
        .cc-cta-btn-ghost:hover { border-color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.07); }

        .cc-footer {
          background: #0d1f1a;
          padding: 60px 5% 32px;
          color: rgba(255,255,255,0.6);
        }
        .cc-footer-top { display: flex; flex-wrap: wrap; gap: 48px; margin-bottom: 48px; justify-content: space-between; }
        .cc-footer-brand { max-width: 280px; }
        .cc-footer-brand-name {
          font-family: 'Sora', sans-serif;
          font-size: 20px; font-weight: 800; color: #fff;
          margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .cc-footer-brand-desc { font-size: 14px; line-height: 1.7; }
        .cc-footer-col h4 { font-size: 13px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; }
        .cc-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .cc-footer-col ul a { color: rgba(255,255,255,0.55); font-size: 14px; text-decoration: none; transition: color 0.2s; }
        .cc-footer-col ul a:hover { color: #1D9E75; }
        .cc-footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 28px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
        .cc-footer-bottom p { font-size: 13px; }
        .cc-footer-langs { display: flex; gap: 12px; }
        .cc-footer-lang { font-size: 12px; color: rgba(255,255,255,0.4); }

        .cc-segments-section { padding: 100px 5%; background: #f7fcfa; }
        .cc-segments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px; margin-top: 56px;
        }
        .cc-segment-card {
          background: #fff; border-radius: 20px;
          padding: 32px 24px;
          border: 1px solid #e8f5ef;
          position: relative;
        }
        .cc-segment-number {
          font-family: 'Sora', sans-serif;
          font-size: 48px; font-weight: 800;
          color: #e8f5ef; line-height: 1;
          margin-bottom: 12px;
        }
        .cc-segment-title { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: #0d1f1a; margin-bottom: 10px; }
        .cc-segment-desc { font-size: 13.5px; color: #666; line-height: 1.7; }

        @media (max-width: 768px) {
          .cc-nav-links { display: none; }
          .cc-stat-item:not(:last-child) { border-right: none; margin-right: 0; border-bottom: 1px solid #e8e8e8; padding-bottom: 20px; margin-bottom: 20px; }
          .cc-stat-item { padding-right: 0; }
          .cc-stats-strip { flex-direction: column; }
          .cc-hero-btns { flex-direction: column; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`cc-nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="cc-logo">
          <span className="cc-logo-dot" />
          CloudClinic
        </a>
        <ul className="cc-nav-links">
          {NAV_LINKS.map(l => (
            <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link to="/login" style={{ fontSize: "14px", fontWeight: 500, color: "#444", textDecoration: "none" }}>Sign in</Link>
          <Link to="/register-patient" className="cc-nav-cta">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="cc-hero">
        <div className="cc-hero-bg-circle" style={{ width: 700, height: 700, top: -200, right: -200, opacity: 0.6 }} />
        <div className="cc-hero-bg-circle" style={{ width: 300, height: 300, bottom: 0, left: "10%", opacity: 0.4 }} />

        <div className="cc-hero-badge">
          <span className="cc-hero-badge-dot" />
          Live • Kenya-built IoT Healthcare
        </div>

        <h1>
          Healthcare that<br />
          travels <span>with you.</span>
        </h1>

        <p className="cc-hero-sub">
          Continuous IoT-powered monitoring for pregnant mothers, chronic patients, and rural communities — in your language, on any device, anywhere in Kenya.
        </p>

        <div className="cc-hero-btns">
          <Link to="/register-patient" className="cc-btn-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a4 4 0 1 1 0 8A4 4 0 0 1 8 1zm0 9c4.4 0 7 2.2 7 4H1c0-1.8 2.6-4 7-4z" fill="#fff"/></svg>
            Join as Patient
          </Link>
          <Link to="/register-doctor" className="cc-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a4 4 0 1 1 0 8A4 4 0 0 1 8 1zm0 9c4.4 0 7 2.2 7 4H1c0-1.8 2.6-4 7-4z" fill="#0F6E56"/></svg>
            Join as Doctor
          </Link>
          <Link to="/login" className="cc-btn-outline">Sign In →</Link>
        </div>

        <div className="cc-stats-strip">
          {STATS.map(s => (
            <div key={s.label} className="cc-stat-item">
              <div className="cc-stat-value">{s.value}</div>
              <div className="cc-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="cc-section">
        <div className="cc-section-tag">Platform Features</div>
        <h2 className="cc-section-title">Everything your health needs,<br />in one connected kit.</h2>
        <p className="cc-section-sub">From portable sensors to AI-guided conversations — CloudClinic bridges the gap between rural patients and quality care.</p>

        <div className="cc-features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="cc-feature-card" style={{ "--accent": f.accent }}>
              <div className="cc-feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <div className="cc-feature-title">{f.title}</div>
              <div className="cc-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="cc-how-section" id="how-it-works">
        <div className="cc-section-tag" style={{ color: "#1D9E75" }}>How It Works</div>
        <h2 className="cc-section-title" style={{ color: "#fff" }}>Simple. Consistent.<br />Life-changing.</h2>

        <div className="cc-how-steps">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.step} className="cc-how-step">
              <div className="cc-how-step-line">
                <div className="cc-how-step-num">{s.step}</div>
                {i < HOW_IT_WORKS.length - 1 && <div className="cc-how-step-connector" />}
              </div>
              <div className="cc-how-step-content">
                <div className="cc-how-step-title">{s.title}</div>
                <div className="cc-how-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LANGUAGE SECTION */}
      <section className="cc-lang-section">
        <div className="cc-section-tag">Multilingual AI</div>
        <h2 className="cc-section-title">Speaks your language.<br />Literally.</h2>
        <p className="cc-section-sub" style={{ marginBottom: 0 }}>
          Our AI assistant gives health guidance in five Kenyan languages — by voice or text, even offline via pre-loaded audio files.
        </p>
        <div className="cc-lang-pills">
          {[
            { flag: "🇰🇪", lang: "Kiswahili", region: "National" },
            { flag: "🌍", lang: "Kalenjin", region: "Rift Valley" },
            { flag: "🌍", lang: "Kikuyu", region: "Central" },
            { flag: "🌍", lang: "Dholuo", region: "Nyanza" },
            { flag: "🌍", lang: "Luhya", region: "Western" },
            { flag: "🇬🇧", lang: "English", region: "All counties" },
          ].map(l => (
            <div key={l.lang} className="cc-lang-pill">
              <span className="cc-lang-pill-flag">{l.flag}</span>
              <span><strong>{l.lang}</strong> — {l.region}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SEGMENTS */}
      <section className="cc-segments-section">
        <div className="cc-section-tag">Who We Serve</div>
        <h2 className="cc-section-title">Built for Kenya's<br />most underserved.</h2>
        <div className="cc-segments-grid">
          {[
            { n: "01", title: "Pregnant Mothers", desc: "~1.5M births/year. Antenatal BP and temperature monitoring at home, reducing dangerous gaps between clinic visits." },
            { n: "02", title: "Chronic Patients", desc: "2.7M Kenyans with hypertension or diabetes need daily vitals tracking, medication reminders, and virtual check-ins." },
            { n: "03", title: "Post-Surgical Care", desc: "Structured discharge-to-home follow-up for patients after C-sections, cardiac procedures, or acute infections." },
            { n: "04", title: "Remote Communities", desc: "Turkana, Mandera, Samburu, West Pokot — counties with the greatest need for decentralized, device-based monitoring." },
          ].map(s => (
            <div key={s.n} className="cc-segment-card">
              <div className="cc-segment-number">{s.n}</div>
              <div className="cc-segment-title">{s.title}</div>
              <div className="cc-segment-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="cc-testimonials-section">
        <div className="cc-section-tag">Patient Experiences</div>
        <h2 className="cc-section-title">Heard from those<br />we've helped.</h2>

        <div className="cc-testimonials-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="cc-testimonial-card">
              <div className="cc-quote-mark" style={{ color: t.bg }}>"</div>
              <p className="cc-testimonial-body">"{t.quote}"</p>
              {t.translation && <p className="cc-testimonial-translation">{t.translation}</p>}
              <div className="cc-testimonial-author">
                <div
                  className="cc-testimonial-avatar"
                  style={{ background: t.bg, color: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="cc-testimonial-name">{t.name}</div>
                  <div className="cc-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cc-cta-section">
        <h2 className="cc-cta-title">Your health doesn't<br />wait for a clinic visit.</h2>
        <p className="cc-cta-sub">Join thousands of Kenyans monitoring their health continuously — from Nairobi to Turkana.</p>
        <div className="cc-cta-btns">
          <Link to="/register-patient" className="cc-cta-btn-white">Get Your Kit →</Link>
          <Link to="/register-doctor" className="cc-cta-btn-ghost">Join as Doctor</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="cc-footer">
        <div className="cc-footer-top">
          <div className="cc-footer-brand">
            <div className="cc-footer-brand-name">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }} />
              CloudClinic
            </div>
            <p className="cc-footer-brand-desc">
              Continuous IoT health monitoring for Kenya's mothers, chronic patients, and rural communities. Built in Nairobi.
            </p>
          </div>
          <div className="cc-footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/register-patient" style={{color:"inherit"}}>For Patients</Link></li>
              <li><Link to="/register-doctor" style={{color:"inherit"}}>For Doctors</Link></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><Link to="/login" style={{color:"inherit"}}>Sign In</Link></li>
            </ul>
          </div>
          <div className="cc-footer-col">
            <h4>Technology</h4>
            <ul>
              <li><a href="#">IoT Monitoring Kit</a></li>
              <li><a href="#">AI Health Assistant</a></li>
              <li><a href="#">SMS Alerts</a></li>
              <li><a href="#">Doctor Dashboard</a></li>
            </ul>
          </div>
          <div className="cc-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About CloudClinic</a></li>
              <li><a href="#">Research</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="cc-footer-bottom">
          <p>© 2025 CloudClinic. Made with care in Nairobi, Kenya.</p>
          <div className="cc-footer-langs">
            {["EN", "SW", "KAL", "KIK", "LUO", "LUH"].map(l => (
              <span key={l} className="cc-footer-lang">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}