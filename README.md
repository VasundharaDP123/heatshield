<div align="center">
  <img src="https://img.icons8.com/color/96/000000/sun--v1.png" alt="HeatShield Logo" width="80" />
  <h1>HeatShield</h1>
  <p><strong>AI-Powered Heatwave Survival & Early Warning System</strong></p>

  <!-- Badges -->
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" /></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.100+-green?style=for-the-badge&logo=fastapi" alt="FastAPI" /></a>
  <a href="https://scikit-learn.org/"><img src="https://img.shields.io/badge/scikit--learn-Machine%20Learning-orange?style=for-the-badge&logo=scikit-learn" alt="Scikit-Learn" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
</div>

<br />

## 🌍 Overview
**HeatShield** is a comprehensive, localized early warning system engineered to protect outdoor workers and vulnerable populations from extreme heatwaves and toxic air quality. By fusing real-time meteorological data with a Machine Learning risk assessment engine, HeatShield provides actionable, hyper-localized intelligence to prevent heat-related casualties.

## 🚀 Professional Features

*   🧠 **Personal AI Risk Engine**: A trained Random Forest Classifier calculates real-time risk scores (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) based on the user's demographic data, local temperature, and AQI.
*   🗺️ **Live Geospatial Mapping**: Dynamic, interactive map integration (Leaflet) that auto-locates the user and renders the nearest verified hospitals, water points, and cooling centers.
*   🔊 **Multilingual Voice Warnings**: Uses Web Speech API (Text-to-Speech) to speak life-saving advice out loud in 5 regional languages (English, Hindi, Telugu, Kannada, Tamil) for maximum accessibility.
*   📈 **7-Day Predictive Forecasting**: Integrated `recharts` visualizing the 7-day temperature trends using real-time Open-Meteo API data.
*   🚨 **SOS Emergency Dialer**: A floating action button that instantly prompts an emergency call (e.g., 108) during critical health events.
*   📄 **PDF Risk Reports**: Generates downloadable, printer-friendly PDF reports of the user's personal risk assessment and AI advice.
*   💧 **Smart Hydration Tracker**: Dynamically calculates daily water intake goals based on current ambient temperature.
*   🛑 **Community Reporting (Crowdsourcing)**: Empowers users to report broken or empty relief spots directly on the map.
*   📊 **Admin Analytics Dashboard**: A secured portal for administrators to monitor daily risk trends, view critical alerts, and manage community-reported issues.

## 🏗️ Technical Architecture

### Frontend Layer
*   **Framework**: React.js (Vite)
*   **Styling**: Tailwind CSS v4, Lucide Icons
*   **Mapping & Data Vis**: React-Leaflet, Recharts
*   **Utilities**: HTML2Canvas, jsPDF (for exports)

### Backend API Layer
*   **Framework**: FastAPI (Python) running on Uvicorn
*   **Machine Learning**: Scikit-Learn (RandomForestClassifier serialized as `.pkl`)
*   **External APIs**: Open-Meteo (Weather/AQI), Overpass API (OSM Safe Spots)

---

## 💻 Local Environment Setup

### 1. Initialize the Backend
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python ml_engine/train_model.py # Generates the ML model
uvicorn main:app --reload
```
*API running at `http://localhost:8000`*

### 2. Initialize the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Application running at `http://localhost:5173`*

---
<div align="center">
  <i>Developed to demonstrate the powerful integration of Machine Learning, Full-Stack Web Development, and Community-driven geospatial data.</i>
</div>
