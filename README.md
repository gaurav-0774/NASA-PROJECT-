# 🚀 AstroVitals

**Self-Assessment Health Dashboard for Astronauts on Long-Duration Space Missions**

> Built for the NASA Space Apps Challenge 2026

![Status](https://img.shields.io/badge/status-demo--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌍 The Problem

On long-duration missions — to the Moon, Mars, and beyond — astronauts face NASA's **five spaceflight hazards**:

1. **Space Radiation** — increased cancer risk, CNS effects, immune suppression
2. **Isolation & Confinement** — behavioral health, mood, team dynamics
3. **Distance from Earth** — communication delays (up to 24 min for Mars), limited resupply
4. **Altered Gravity** — bone loss (~1-2%/month), muscle atrophy, cardiovascular deconditioning, intracranial pressure
5. **Hostile/Closed Environments** — limited air, water recycling, microbe risks

With communication delays of up to 24 minutes each way to Mars, astronauts cannot rely on real-time support from flight surgeons. They need tools to **self-assess their health**, understand their status at a glance, and get clear guidance on actions.

## 💡 Our Solution

**AstroVitals** is a comprehensive health self-assessment dashboard that empowers astronauts to:

- **Log** key health indicators with guidance on measurement in space
- **Visualize** their status through an interactive human body map and dynamic charts
- **Understand** risks via a rule-based engine that evaluates indicators + trends
- **Act** on clear, actionable recommendations
- **Stay motivated** through gamification, daily routines, and mental health support

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌐 **Mission Setup** | Choose environment (ISS, Spacecraft, Lunar Base, Mars Base) — hazard weights adjust automatically |
| 📊 **Health Dashboard** | Real-time overview with health score gauge, category radar, status cards |
| 🧍 **Interactive Body Map** | SVG human body with clickable systems that glow green/yellow/red |
| 📝 **Health Logging** | Log 11+ indicators with sliders, inputs, and emoji scales |
| 📈 **Dynamic Charts** | Line charts with normal ranges, radar chart for category overview |
| 🧠 **Risk Engine** | Rule-based evaluation with trend detection, alerts, and action steps |
| ✅ **Daily Tasks** | Routine reminders with XP, streaks, badges, and level progression |
| 💭 **Mental Health** | Mood/stress/isolation check-in with calming tips and support suggestions |
| 🔔 **Alerts Panel** | Priority-sorted warnings with "what to do now" guidance |
| 📚 **Learn Section** | Educational cards about indicators and NASA's 5 hazards |
| 🎮 **Demo Mode** | One-click loading of 30 days of realistic data with abnormal trends |

## 🏗️ Architecture

```
astrovitals/
├── frontend/          React 18 + Vite + TailwindCSS + Recharts + Framer Motion
│   └── src/
│       ├── services/api.js         Single API gateway
│       ├── context/                Mission state management
│       ├── pages/                  9 full pages
│       └── components/             Reusable UI components
│
├── backend/           Node.js + Express REST API
│   ├── routes/                     API route definitions
│   ├── controllers/                Request handlers
│   ├── services/
│   │   ├── riskEngine.js           Health evaluation + trend detection
│   │   └── gamification.js         XP, badges, streaks
│   ├── data/                       Seed data + JSON storage
│   └── middleware/                 Error handling + validation
│
├── README.md
└── .gitignore
```

```
┌─────────────┐         REST API          ┌─────────────────┐
│   Frontend   │ ◄───────────────────────► │     Backend      │
│  React/Vite  │    http://localhost:5000   │  Express/Node    │
│  port 5173   │                           │  port 5000       │
│              │                           │                  │
│  Dashboard   │   GET /api/health/summary │  Risk Engine     │
│  Body Map    │   GET /api/health/history │  Gamification    │
│  Charts      │   POST /api/health/log    │  Data Store      │
│  Tasks       │   GET /api/indicators     │  Indicator Defs  │
│  Alerts      │   GET /api/body-parts/:id │  Body Part Defs  │
│  Learn       │   GET /api/alerts         │  Environment     │
│  Mood        │   GET/POST /api/tasks     │  Weights         │
│              │   POST /api/demo/seed     │                  │
│              │   POST /api/mood          │                  │
└─────────────┘                           └─────────────────┘
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/summary` | Overall health score + category statuses |
| GET | `/api/health/history?days=30` | Time-series of all indicators |
| POST | `/api/health/log` | Add a measurement, returns evaluation |
| GET | `/api/indicators` | Indicator definitions (ranges, how-to, hazards) |
| GET | `/api/body-parts/:id` | Body part info + linked indicator statuses |
| GET | `/api/alerts` | Current alerts sorted by severity |
| DELETE | `/api/alerts/:id` | Dismiss an alert |
| GET | `/api/tasks` | Daily tasks + gamification stats |
| POST | `/api/tasks/:id/complete` | Complete a task, earn XP |
| POST | `/api/demo/seed` | Generate 30 days of demo data |
| POST | `/api/mood` | Submit mental health check-in |

## 🚀 How to Run

### Prerequisites
- Node.js 18+ and npm

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on **http://localhost:5000**

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

### 3. Load Demo Data
Click the **"Load Demo Data"** button in the sidebar, or:
```bash
curl -X POST http://localhost:5000/api/demo/seed
```

## 📸 Screenshots

> _Screenshots will be added after the demo build is complete._

| Dashboard | Body Map | Charts |
|-----------|----------|--------|
| ![Dashboard](screenshots/dashboard.png) | ![Body Map](screenshots/bodymap.png) | ![Charts](screenshots/charts.png) |

## 🧬 How It Uses NASA HRP Data

AstroVitals is informed by research from NASA's **Human Research Program (HRP)**, which studies the five hazards of human spaceflight:

- **Reference ranges** for health indicators are based on NASA flight surgeon guidelines and aerospace medicine literature
- **Hazard weights** per environment reflect known exposure differences (e.g., Mars transit has higher radiation exposure than ISS due to lack of Earth's magnetosphere)
- **Bone loss rates** (~1-2% per month in microgravity) and the **2.5-hour daily exercise protocol** are based on ISS crew health countermeasures
- **SANS (Spaceflight-Associated Neuro-ocular Syndrome)** is reflected in the eye system's link to blood pressure
- **Behavioral health indicators** follow HRP behavioral health research on isolation, confinement, and crew dynamics
- **Exercise protocols** reference the ARED (Advanced Resistive Exercise Device) and CEVIS (Cycle Ergometer with Vibration Isolation and Stabilization) programs used on ISS

Data sources: [NASA HRP](https://www.nasa.gov/hrp), [NASA GeneLab](https://genelab.nasa.gov/), [NASA Space Radiation Research](https://www.nasa.gov/space-radiation-element)

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Recharts, Lucide React, Axios
- **Backend**: Node.js, Express, CORS, UUID, dotenv
- **Storage**: In-memory JSON (persisted to `data/db.json`)
- **Design**: Glassmorphism, dark space theme, animated star field

## ⚠️ Disclaimer

> AstroVitals is a **demonstration prototype** built for the NASA Space Apps Challenge. It is **not a medical device** and should not be used for actual health decisions. Always follow flight surgeon instructions and established medical protocols.

## 📄 License

MIT License — built for the NASA Space Apps Challenge 2026.

---

*"Per aspera ad astra" — Through hardships to the stars* 🌟
