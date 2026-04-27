# HeatShield 🔥🛡️

> **HeatShield = Weather App + Google Maps + Doctor + WhatsApp Alert** combined into one app that saves lives during heatwaves in India.

## The Problem
Every year, millions of outdoor workers (construction, delivery, agriculture) are exposed to extreme heat and toxic air quality without warning. They lack access to localized, real-time safety information in their native language.

## Our Solution
HeatShield provides hyper-local early warnings, personal risk assessments, and an interactive map of nearest safe spots (hospitals, free water, and cooling centers).

### Key Features
1. **Personal AI Risk Engine**: Calculates a real-time risk score based on age, occupation, health conditions, temperature, and AQI using a Random Forest model.
2. **Local Language Alerts**: Generates life-saving advice translated instantly into 5 languages (English, Hindi, Telugu, Kannada, Tamil).
3. **Crowdsourced Safe Spots**: Beyond official government data, our community-driven map allows users to drop pins for local relief efforts like NGO camps and Gurudwaras.
4. **Dynamic Mapping**: Interactive Leaflet map that flies to the user's state and displays the nearest hospitals and water points.

---

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS v4, React-Leaflet
- **Backend**: FastAPI (Python), Uvicorn
- **AI/ML Engine**: Scikit-Learn (Random Forest Classifier)

## How to Run Locally

### 1. Start the Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt # (Ensure fastapi, uvicorn, scikit-learn, pydantic are installed)
python ml_engine/train_model.py # Train the ML model
uvicorn main:app --reload
```
API runs on `http://localhost:8000`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`

---
*Built in 24 hours for Hackathon.*
