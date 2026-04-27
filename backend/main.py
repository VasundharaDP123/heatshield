from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np

app = FastAPI(title="HeatShield API")

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

model_path = "risk_model.pkl"
if not os.path.exists(model_path):
    model_path = "ml_engine/risk_model.pkl"

try:
    with open(model_path, "rb") as f:
        model = pickle.load(f)
except FileNotFoundError:
    model = None
    print("Warning: ML model not found. Run train_model.py first.")

# Define request body schema
class RiskRequest(BaseModel):
    age: int
    outdoor_job: int # 1 for yes, 0 for no
    bp_patient: int # 1 for yes, 0 for no
    temperature: float
    aqi: float

@app.get("/")
def read_root():
    return {"status": "HeatShield API is running"}

@app.post("/api/risk-score")
def calculate_risk(req: RiskRequest):
    if model is None:
        return {"error": "Model not loaded"}
        
    # Prepare input for the model
    # Model expects: age, outdoor_job, bp_patient, temperature, aqi
    input_features = np.array([[
        req.age,
        req.outdoor_job,
        req.bp_patient,
        req.temperature,
        req.aqi
    ]])
    
    # Predict risk score (0=LOW, 1=MEDIUM, 2=HIGH, 3=CRITICAL)
    risk_score = int(model.predict(input_features)[0])
    
    risk_levels = {
        0: "LOW RISK",
        1: "MEDIUM RISK",
        2: "HIGH RISK",
        3: "CRITICAL RISK"
    }
    
    return {
        "score": risk_score,
        "level": risk_levels.get(risk_score, "UNKNOWN")
    }

@app.post("/api/advice")
def get_advice(req: dict):
    # Mocking Claude AI advice for the hackathon
    risk_level = req.get("level", "LOW")
    language = req.get("language", "English")
    
    advice_templates = {
        "English": {
            "CRITICAL RISK": "🔴 YOU ARE AT HIGH RISK. The temperature and air quality are toxic today. Avoid working outdoors between 11AM–4PM. Find the nearest cooling center.",
            "HIGH RISK": "🟠 High Risk. Please stay hydrated and take breaks in shaded areas frequently. Wear a mask for the poor air quality.",
            "MEDIUM RISK": "🟡 Moderate Risk. Drink water regularly and avoid prolonged sun exposure.",
            "LOW RISK": "🟢 Low Risk. Weather is suitable, but stay hydrated."
        },
        "Telugu": {
            "CRITICAL RISK": "🔴 మీకు తీవ్రమైన ముప్పు ఉంది. ఈరోజు ఉష్ణోగ్రత మరియు గాలి నాణ్యత విషపూరితంగా ఉన్నాయి. ఉదయం 11 నుండి సాయంత్రం 4 గంటల మధ్య బయట పనిచేయడం మానుకోండి.",
            "HIGH RISK": "🟠 అధిక ముప్పు. దయచేసి హైడ్రేటెడ్ గా ఉండండి మరియు తరచుగా నీడ ఉన్న ప్రదేశాలలో విశ్రాంతి తీసుకోండి.",
            "MEDIUM RISK": "🟡 మధ్యస్థ ముప్పు. క్రమం తప్పకుండా నీరు త్రాగాలి మరియు ఎండలో ఎక్కువ సమయం ఉండకండి.",
            "LOW RISK": "🟢 తక్కువ ముప్పు. వాతావరణం అనుకూలంగా ఉంది, కానీ నీరు తాగుతూ ఉండండి."
        },
        "Hindi": {
            "CRITICAL RISK": "🔴 आपको गंभीर खतरा है। आज तापमान और वायु गुणवत्ता बहुत खराब है। सुबह 11 बजे से शाम 4 बजे के बीच बाहर काम करने से बचें।",
            "HIGH RISK": "🟠 उच्च जोखिम। कृपया हाइड्रेटेड रहें और छायादार क्षेत्रों में बार-बार ब्रेक लें।",
            "MEDIUM RISK": "🟡 मध्यम जोखिम। नियमित रूप से पानी पिएं और लंबे समय तक धूप में रहने से बचें।",
            "LOW RISK": "🟢 कम जोखिम। मौसम अनुकूल है, लेकिन हाइड्रेटेड रहें।"
        },
        "Kannada": {
            "CRITICAL RISK": "🔴 ನಿಮಗೆ ತೀವ್ರ ಅಪಾಯವಿದೆ. ಇಂದು ತಾಪಮಾನ ಮತ್ತು ಗಾಳಿಯ ಗುಣಮಟ್ಟ ವಿಷಕಾರಿಯಾಗಿದೆ. ಬೆಳಗ್ಗೆ 11 ರಿಂದ ಸಂಜೆ 4 ರವರೆಗೆ ಹೊರಗೆ ಕೆಲಸ ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ.",
            "HIGH RISK": "🟠 ಹೆಚ್ಚಿನ ಅಪಾಯ. ದಯವಿಟ್ಟು ಹೈಡ್ರೇಟ್ ಆಗಿರಿ ಮತ್ತು ನೆರಳಿನ ಪ್ರದೇಶಗಳಲ್ಲಿ ಆಗಾಗ್ಗೆ ವಿರಾಮ ತೆಗೆದುಕೊಳ್ಳಿ.",
            "MEDIUM RISK": "🟡 ಸಾಧಾರಣ ಅಪಾಯ. ನಿಯಮಿತವಾಗಿ ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಹೆಚ್ಚು ಹೊತ್ತು ಬಿಸಿಲಿನಲ್ಲಿ ಇರುವುದನ್ನು ತಪ್ಪಿಸಿ.",
            "LOW RISK": "🟢 ಕಡಿಮೆ ಅಪಾಯ. ಹವಾಮಾನ ಸೂಕ್ತವಾಗಿದೆ, ಆದರೆ ನೀರು ಕುಡಿಯುತ್ತಿರಿ."
        },
        "Tamil": {
            "CRITICAL RISK": "🔴 உங்களுக்கு கடுமையான ஆபத்து உள்ளது. இன்று வெப்பநிலை மற்றும் காற்றின் தரம் மிகவும் மோசமாக உள்ளது. காலை 11 மணி முதல் மாலை 4 மணி வரை வெளியில் வேலை செய்வதைத் தவிர்க்கவும்.",
            "HIGH RISK": "🟠 அதிக ஆபத்து. தயவுசெய்து நீரேற்றமாக இருங்கள் மற்றும் நிழலான பகுதிகளில் அடிக்கடி ஓய்வு எடுத்துக் கொள்ளுங்கள்.",
            "MEDIUM RISK": "🟡 மிதமான ஆபத்து. தொடர்ந்து தண்ணீர் குடிக்கவும், வெயிலில் அதிக நேரம் இருப்பதைத் தவிர்க்கவும்.",
            "LOW RISK": "🟢 குறைந்த ஆபத்து. வானிலை சாதகமாக உள்ளது, ஆனால் தொடர்ந்து தண்ணீர் குடிக்கவும்."
        }
    }
    
    lang_dict = advice_templates.get(language, advice_templates["English"])
    advice = lang_dict.get(risk_level, lang_dict["LOW RISK"])
    
    return {"advice": advice}

@app.get("/api/safe-spots")
def get_safe_spots(lat: float, lng: float):
    # Mocking Safe Spots based on user's location
    # In reality, this would use Google Places API and Firebase
    return {
        "spots": [
            {
                "id": "1",
                "name": "City General Hospital",
                "type": "hospital",
                "lat": lat + 0.01,
                "lng": lng + 0.01,
                "distance": "1.2 km"
            },
            {
                "id": "2",
                "name": "Community Water Point",
                "type": "water",
                "lat": lat - 0.005,
                "lng": lng + 0.005,
                "distance": "400 m"
            },
            {
                "id": "3",
                "name": "Public AC Library",
                "type": "cooling_center",
                "lat": lat + 0.008,
                "lng": lng - 0.002,
                "distance": "800 m"
            }
        ]
    }
