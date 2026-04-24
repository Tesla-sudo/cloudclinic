import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterChoice from "./pages/RegisterChoice";
import RegisterDoctor from "./pages/RegisterDoctor";
import RegisterPatient from "./pages/RegisterPatient";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientVitalsChart from "./pages/doctor/PatientVitalsChart";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register-doctor" element={<RegisterDoctor />} />
        <Route path="/register-patient" element={<RegisterPatient />} />

        {/* DOCTOR */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/vitals/:patientId" element={<PatientVitalsChart />} />

        {/* PATIENT */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}