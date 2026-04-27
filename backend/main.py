from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np

app = FastAPI(title="HeatShield API")

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
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
    # AI advice templates
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
    # Try fetching real data from OpenStreetMap (Overpass API) based on state location
    real_spots = []
    try:
        import urllib.request
        import urllib.parse
        import json
        import math
        
        query = f"""
        [out:json];
        (
          node["amenity"="hospital"](around:8000, {lat}, {lng});
          node["amenity"="drinking_water"](around:8000, {lat}, {lng});
          node["amenity"="place_of_worship"]["religion"="sikh"](around:10000, {lat}, {lng});
          node["amenity"="library"](around:8000, {lat}, {lng});
          node["amenity"="clinic"](around:8000, {lat}, {lng});
        );
        out 15;
        """
        url = "http://overpass-api.de/api/interpreter"
        data = urllib.parse.urlencode({'data': query}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'User-Agent': 'HeatShieldApp/1.0'})
        
        with urllib.request.urlopen(req, timeout=3) as response:
            result = json.loads(response.read().decode('utf-8'))
            elements = result.get('elements', [])
            
            for el in elements:
                if 'tags' not in el: continue
                tags = el['tags']
                
                amenity = tags.get('amenity', '')
                religion = tags.get('religion', '')
                
                spot_type = 'cooling_center'
                if amenity in ['hospital', 'clinic']: spot_type = 'hospital'
                elif amenity == 'drinking_water': spot_type = 'water'
                elif religion == 'sikh': spot_type = 'gurudwara'
                
                name = tags.get('name', f"Local {spot_type.replace('_', ' ').title()}")
                
                # Simple distance approximation using Pythagorean theorem on lat/lng (1 degree ~ 111km)
                dlat = abs(el['lat'] - lat) * 111
                dlng = abs(el['lon'] - lng) * 111
                dist_km = math.sqrt(dlat*dlat + dlng*dlng)
                dist_str = f"{dist_km:.1f} km" if dist_km >= 1 else f"{int(dist_km*1000)} m"
                
                real_spots.append({
                    "id": str(el['id']),
                    "name": name,
                    "type": spot_type,
                    "lat": el['lat'],
                    "lng": el['lon'],
                    "distance": dist_str
                })
    except Exception as e:
        print("Failed to fetch real spots:", e)
        
    if len(real_spots) > 0:
        return {"spots": real_spots}

    # Fallback to mock data if API fails or is empty for that region
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
                "name": "Jal Seva Kiosk",
                "type": "water",
                "lat": lat - 0.005,
                "lng": lng + 0.005,
                "distance": "400 m"
            },
            {
                "id": "3",
                "name": "Municipal AC Library",
                "type": "cooling_center",
                "lat": lat + 0.008,
                "lng": lng - 0.002,
                "distance": "800 m"
            },
            {
                "id": "4",
                "name": "Gurudwara Langar Hall",
                "type": "gurudwara",
                "lat": lat - 0.008,
                "lng": lng - 0.006,
                "distance": "1.1 km"
            },
            {
                "id": "5",
                "name": "Railway Station Water Cooler",
                "type": "water",
                "lat": lat + 0.015,
                "lng": lng - 0.01,
                "distance": "2.0 km"
            },
            {
                "id": "6",
                "name": "Sanjeevani Local Clinic",
                "type": "hospital",
                "lat": lat - 0.012,
                "lng": lng + 0.015,
                "distance": "2.3 km"
            },
            {
                "id": "7",
                "name": "Community Shade Shelter",
                "type": "cooling_center",
                "lat": lat + 0.003,
                "lng": lng + 0.008,
                "distance": "600 m"
            }
        ]
    }

@app.post("/api/send-sms")
def send_sms(req: dict):
    phone = req.get("phone", "")
    if not phone: return {"status": "error", "message": "Phone number required"}
    import time
    time.sleep(1.5)
    return {"status": "success", "message": f"Simulated SMS sent to {phone}"}

reported_spots = []

@app.post("/api/report-spot")
def report_spot(req: dict):
    spot_id = req.get("id")
    if spot_id and spot_id not in reported_spots:
        reported_spots.append(spot_id)
    return {"status": "success", "reported_spots": reported_spots}

@app.get("/api/reports")
def get_reports():
    return {"reported_spots": reported_spots}
