# CloudClinic

### Portable, IoT-Enabled, Multilingual Healthcare Monitoring System for Kenya

---

## Overview

CloudClinic is a **low-cost, IoT-powered healthcare monitoring platform** designed to bridge the gap between patients and healthcare providers in Kenya.

It enables:

* Continuous remote patient monitoring
* Offline-compatible communication (SMS + GSM)
* AI-assisted multilingual health feedback
* Doctor dashboards with real-time vitals

---

## Problem

Healthcare in Kenya is:

* Episodic (patients visit only when sick)
* Facility-dependent (limited rural access)
* Lacking continuous monitoring

Critical gaps:

* No structured post-discharge follow-up
* Limited antenatal monitoring in rural areas
* Telemedicine lacks real-time physiological data
* Internet-dependent systems exclude feature phone users

---

## Solution

CloudClinic provides:

✔ IoT health monitoring kit (ESP32-based)
✔ Real-time vitals tracking (Temperature, Heart Rate)
✔ GSM/SMS fallback for low-connectivity regions
✔ AI assistant (multilingual support)
✔ Doctor dashboard with alerts and analytics
✔ Unique patient PIN system for device linkage

---

## Tech Stack

### Backend (API + IoT Layer)

* Node.js
* Express.js
* MongoDB (Mongoose)
* MQTT (HiveMQ Cloud)
* JWT Authentication
* SMS API (Africa’s Talking / Twilio)

### Frontend (Web App)

* React (Vite)
* Tailwind CSS
* Axios
* React Router
* Chart.js

### Hardware Layer

* ESP32
* MAX4466 Microphone
* Temperature Sensor
* Heartbeat Sensor
* GSM Module (SIM800L)
* DFPlayer Mini (Audio)

---

## 📁 Project Structure

```
cloudclinic/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│   └── index.html
│
└── README.md
```

---

# ⚙️ BACKEND SETUP

## 1. Navigate to backend

```bash
cd backend
```

---

## 2. Install dependencies

```bash
npm install
```

### Required Packages

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install mqtt axios
npm install nodemon --save-dev
```

---

## 3. Environment Variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

# SMS (Africa's Talking or Twilio)
SMS_API_KEY=your_key
SMS_USERNAME=your_username

# MQTT
MQTT_URL=your_hivemq_url
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
```

---

## 4. Run backend

```bash
npm run dev
```

Expected:

```
 Server running on port 5000
 MQTT connected
 MongoDB connected
```

---

# FRONTEND SETUP

## 1. Navigate to frontend

```bash
cd frontend
```

---

## 2. Install dependencies

```bash
npm install
```

### Required Packages

```bash
npm install axios react-router-dom
npm install chart.js react-chartjs-2
npm install tailwindcss postcss autoprefixer
```

---

## 3. Tailwind Setup

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
content: ["./index.html", "./src/**/*.{js,jsx}"],
```

---

## 4. Run frontend

```bash
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

# AUTHENTICATION FLOW

| Role    | Route                  |
| ------- | ---------------------- |
| Doctor  | `/doctor/dashboard`  |
| Patient | `/patient/dashboard` |

Login automatically redirects based on role.

# DOCTOR REGISTRATION REQUIREMENTS

* Name
* Email
* Password
* KMPDC PIN (format: `DR1234`)
* Specialty
* County
* Hospital

---

# PATIENT REGISTRATION

* Name
* Email
* Password
* Phone
* Age
* Gender
* County

### Unique Feature

Each patient receives a  **6-digit PIN** :

```
Example: 483920
```

Used for:

* IoT device identification
* SMS alerts
* Dashboard linking

---

# IOT DATA FLOW

```
ESP32 Device
   ↓
MQTT (HiveMQ)
   ↓
Backend Listener
   ↓
Database (MongoDB)
   ↓
Alert Engine
   ↓
SMS + Dashboard
```

---

# ALERT ENGINE

Triggers when:

| Condition    | Alert       |
| ------------ | ----------- |
| Temp > 38°C | Fever       |
| Temp < 35°C | Hypothermia |
| HR > 120 bpm | Tachycardia |
| HR < 50 bpm  | Bradycardia |

---

# DASHBOARD FEATURES

### Doctor Dashboard

* Real-time vitals charts
* Patient monitoring
* Alerts inbox
* Trend analysis

### Patient Dashboard

* Personal vitals history
* Alerts received
* Health status overview

---

# API ENDPOINTS

## Auth

```
POST /api/auth/doctor/register
POST /api/auth/patient/register
POST /api/auth/login
```

## Vitals

```
POST /api/vitals
GET /api/vitals/:patientId
GET /api/vitals/latest/:patientId
```

## Hospitals

```
GET /api/hospitals/counties
GET /api/hospitals?county=Nairobi
```

---

# TESTING

Use:

* Postman
* Thunder Client
* cURL

Example:

```bash
curl -X POST http://localhost:5000/api/vitals \
-H "Content-Type: application/json" \
-d '{"patientId":"123","temperature":39,"heartRate":130}'
```

---

# DEPLOYMENT (FUTURE)

* Backend → Google Cloud (GCP Nairobi)
* Frontend → Vercel / Netlify
* MQTT → HiveMQ Cloud
* Database → MongoDB Atlas

---

# SECURITY

* JWT Authentication
* Role-based access control
* Encrypted passwords (bcrypt)
* Input validation

---

# IMPACT

CloudClinic targets:

* 1.5M annual births (maternal monitoring)
* 2.7M chronic patients (hypertension/diabetes)
* Post-discharge recovery tracking
* Rural healthcare access

---

# FUTURE ROADMAP

* AI multilingual assistant (Swahili + local languages)
* Offline voice interaction
* Wearable integration
* Predictive health analytics
* National health system integration

---

# TEAM

CloudClinic – Built for impact in Kenya 🇰🇪

---

# LICENSE

MIT License

---
