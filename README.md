# CivicSync AI – Smart India Hackathon 2026

![CivicSync AI Banner](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop)

**CivicSync AI** is a production-ready, enterprise-grade crowdsourced civic issue reporting and resolution system, designed for **Smart India Hackathon 2026 (Problem Statement 25031)**.

## 🌟 Key Features
- **Smart City Command Center**: Glassmorphism UI with Tailwind CSS.
- **AI Classification Engine**: Auto-categorizes issues and sets severity via simulated image/text AI.
- **Predictive Analytics**: Dynamic "Civic Health Score" and localized risk-zones (Chart.js).
- **Multilingual Voice Reporting**: Report issues via localized voice-to-text integration.
- **End-to-End Loop**: Track complaints, view officer resolution proofs (images), and leave citizen ratings/feedback.

## 🛠️ Technology Stack
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose) / Built-in Demo DB fallback
- **Authentication**: JWT & bcrypt

## 🚀 Installation & Local Setup
1. Clone the repository and install dependencies in the root:
   ```bash
   npm install
   ```
2. Navigate to `/frontend` and install frontend dependencies:
   ```bash
   cd frontend && npm install
   cd ..
   ```
3. Navigate to `/backend` and install backend dependencies:
   ```bash
   cd backend && npm install
   cd ..
   ```
4. Set up `.env` in the `/backend` folder. Follow `.env.example`.
5. Run the full stack locally:
   ```bash
   npm run dev
   ```

## 🌐 Deployment Guide
- **Frontend (Vercel)**: Connect the GitHub repo to Vercel. Set the Root Directory to `frontend`. `vercel.json` is included for React Router proxy rewrites.
- **Backend (Render)**: Connect the GitHub repo to Render.com. Use the included `render.yaml` Blueprint or set Build command to `cd backend && npm install` and Start Command to `node backend/server.js`.

> [!IMPORTANT]
> **SIH Demo Mode**: If the MongoDB URI is missing or disconnected, the backend falls back to a populated mock database to ensure seamless presentations for judging panels.
