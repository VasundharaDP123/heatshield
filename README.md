# HeatShield: An AI-Powered Heatwave Survival System 🔥🛡️

## Overview
HeatShield is a comprehensive, localized early warning system designed to protect outdoor workers and vulnerable populations from extreme heatwaves and toxic air quality. By combining real-time environmental data with a machine learning risk assessment engine, HeatShield provides actionable, localized intelligence to prevent heat-related casualties.

## Problem Statement
Every year, a large number of outdoor workers (such as construction workers, delivery personnel, and agricultural laborers) are exposed to extreme heat and poor air quality without adequate warning. There is a significant lack of access to real-time, personalized safety information presented in native languages.

## Proposed Solution
HeatShield mitigates these risks by providing hyper-local early warnings, personalized risk assessments, and an interactive directory of the nearest safe spots (hospitals, free water stations, and cooling centers).

### Key Features
1. **Personal AI Risk Engine**: A Random Forest Classifier that calculates a real-time risk score (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) based on the user's age, occupation type, health conditions, local temperature, and AQI.
2. **Multilingual Safety Alerts**: Automatically generates life-saving advice and safety precautions translated instantly into 5 regional languages (English, Hindi, Telugu, Kannada, Tamil) to ensure maximum accessibility.
3. **Crowdsourced Relief Mapping**: An interactive Leaflet map that supplements official government data by allowing community members to pin local relief efforts, such as NGO camps and Gurudwaras.
4. **Dynamic Geolocation Engine**: The interactive map dynamically centers on the user's selected state, rendering the nearest hospitals, water points, and cooling centers dynamically.

---

## Technical Architecture
- **Frontend Layer**: Built using React.js and Vite, styled with modern Tailwind CSS v4, and integrated with React-Leaflet for geospatial mapping.
- **Backend API Layer**: Engineered with FastAPI (Python) running on Uvicorn for asynchronous, high-performance API endpoints.
- **AI/ML Engine**: Powered by Scikit-Learn. Synthetic datasets were utilized to train a Random Forest Classifier which is serialized (`.pkl`) and loaded directly into the backend memory.

## Local Environment Setup

### 1. Initialize the Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt # (Ensure fastapi, uvicorn, scikit-learn, pydantic are installed)
python ml_engine/train_model.py # Train the ML model to generate risk_model.pkl
uvicorn main:app --reload
```
*The API will be available at `http://localhost:8000`*

### 2. Initialize the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The application will be available at `http://localhost:5173`*

---
*Developed as an academic project demonstrating the integration of Machine Learning, Full-Stack Development, and Community-driven data.*
