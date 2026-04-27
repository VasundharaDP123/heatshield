import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, MapPin, AlertTriangle, CloudSun, Activity, Phone, Info, Plus, Navigation, Download, Droplet, Volume2, MessageSquare, BarChart3, Users, Map } from 'lucide-react';
import L from 'leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const stateData = {
  "Andhra Pradesh": { temp: 42, aqi: 150, alerts: "8,200", coords: [16.5062, 80.6480] },
  "Arunachal Pradesh": { temp: 28, aqi: 45, alerts: "120", coords: [27.0844, 93.6053] },
  "Assam": { temp: 33, aqi: 80, alerts: "1,500", coords: [26.1420, 91.7720] },
  "Bihar": { temp: 44, aqi: 210, alerts: "15,300", coords: [25.5941, 85.1376] },
  "Chhattisgarh": { temp: 43, aqi: 180, alerts: "6,400", coords: [21.2514, 81.6296] },
  "Goa": { temp: 35, aqi: 90, alerts: "800", coords: [15.4909, 73.8278] },
  "Gujarat": { temp: 45, aqi: 195, alerts: "11,200", coords: [23.2156, 72.6369] },
  "Haryana": { temp: 46, aqi: 250, alerts: "14,100", coords: [30.7333, 76.7794] },
  "Himachal Pradesh": { temp: 25, aqi: 40, alerts: "50", coords: [31.1048, 77.1734] },
  "Jharkhand": { temp: 42, aqi: 170, alerts: "5,600", coords: [23.3441, 85.3096] },
  "Karnataka": { temp: 38, aqi: 110, alerts: "9,400", coords: [12.9716, 77.5946] },
  "Kerala": { temp: 34, aqi: 75, alerts: "3,200", coords: [8.5241, 76.9366] },
  "Madhya Pradesh": { temp: 45, aqi: 185, alerts: "12,800", coords: [23.2599, 77.4126] },
  "Maharashtra": { temp: 41, aqi: 160, alerts: "18,500", coords: [19.0760, 72.8777] },
  "Manipur": { temp: 30, aqi: 55, alerts: "300", coords: [24.8170, 93.9368] },
  "Meghalaya": { temp: 26, aqi: 45, alerts: "150", coords: [25.5788, 91.8933] },
  "Mizoram": { temp: 29, aqi: 50, alerts: "200", coords: [23.7271, 92.7176] },
  "Nagaland": { temp: 28, aqi: 48, alerts: "180", coords: [25.6751, 94.1086] },
  "Odisha": { temp: 44, aqi: 175, alerts: "9,100", coords: [20.2961, 85.8245] },
  "Punjab": { temp: 46, aqi: 240, alerts: "13,500", coords: [30.7333, 76.7794] },
  "Rajasthan": { temp: 48, aqi: 220, alerts: "21,000", coords: [26.9124, 75.7873] },
  "Sikkim": { temp: 22, aqi: 35, alerts: "20", coords: [27.3389, 88.6065] },
  "Tamil Nadu": { temp: 40, aqi: 130, alerts: "10,500", coords: [13.0827, 80.2707] },
  "Telangana": { temp: 47, aqi: 189, alerts: "12,450", coords: [17.3850, 78.4867] },
  "Tripura": { temp: 34, aqi: 65, alerts: "600", coords: [23.8315, 91.2868] },
  "Uttar Pradesh": { temp: 46, aqi: 260, alerts: "25,000", coords: [26.8467, 80.9462] },
  "Uttarakhand": { temp: 32, aqi: 85, alerts: "1,200", coords: [30.3165, 78.0322] },
  "West Bengal": { temp: 41, aqi: 155, alerts: "11,800", coords: [22.5726, 88.3639] }
};

// Component to re-center map
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

const getMarkerIcon = (type, isReported = false) => {
  if (isReported) {
    return L.divIcon({
      html: `<div class="bg-slate-400 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-white text-lg opacity-80">⚠️</div>`,
      className: 'bg-transparent border-none',
      iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16]
    });
  }

  let bgColor = 'bg-blue-500';
  let emoji = '📍';
  
  if (type === 'hospital') {
    bgColor = 'bg-red-500';
    emoji = '🏥';
  } else if (type === 'water') {
    bgColor = 'bg-blue-500';
    emoji = '💧';
  } else if (type === 'cooling_center') {
    bgColor = 'bg-cyan-500';
    emoji = '❄️';
  } else if (type === 'gurudwara') {
    bgColor = 'bg-green-500';
    emoji = '⛺';
  }

  const html = `<div class="${bgColor} text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-white text-lg">${emoji}</div>`;
  
  return L.divIcon({
    html: html,
    className: 'bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

function App() {
  const [formData, setFormData] = useState({
    age: 35,
    outdoor_job: 1,
    bp_patient: 1,
    temperature: 47,
    aqi: 189,
    state: 'Telangana'
  });
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [riskResult, setRiskResult] = useState(null);
  const [advice, setAdvice] = useState('');
  const [safeSpots, setSafeSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: '', type: 'water' });
  const [activeCategory, setActiveCategory] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  // Pro Features State
  const [isAdminView, setIsAdminView] = useState(false);
  const [glassesDrank, setGlassesDrank] = useState(0);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsStatus, setSmsStatus] = useState(null);
  const [reportedSpots, setReportedSpots] = useState([]);

  const hydrationGoal = formData.temperature > 40 ? 12 : 8;

  const handleCategoryClick = (type) => {
    setActiveCategory(prev => prev === type ? null : type);
  };

  const currentStateData = stateData[formData.state] || stateData["Telangana"];
  const mapCenter = currentStateData.coords || [17.3850, 78.4867];

  const fetchWeatherAndAQI = async (lat, lng, stateName) => {
    try {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m&daily=temperature_2m_max&timezone=auto`);
      const weatherData = await weatherRes.json();
      const currentTemp = Math.round(weatherData.current.temperature_2m);
      
      const dailyForecast = weatherData.daily.time.map((time, idx) => ({
        day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(weatherData.daily.temperature_2m_max[idx])
      }));
      setForecastData(dailyForecast);

      const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi`);
      const aqiData = await aqiRes.json();
      const currentAQI = Math.round(aqiData.current.us_aqi);

      setFormData(prev => ({
        ...prev,
        state: stateName,
        temperature: currentTemp,
        aqi: currentAQI
      }));
    } catch (err) {
      console.error("Failed to fetch live weather", err);
      const fallback = stateData[stateName] || stateData["Telangana"];
      setFormData(prev => ({
        ...prev,
        state: stateName,
        temperature: fallback.temp,
        aqi: fallback.aqi
      }));
    }
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const newData = stateData[newState] || stateData["Telangana"];
    
    setFormData(prev => ({ ...prev, state: newState }));
    fetchWeatherAndAQI(newData.coords[0], newData.coords[1], newState);
    fetchSpots(newData.coords[0], newData.coords[1]);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newState = "Current Location";
          setFormData(prev => ({ ...prev, state: newState }));
          stateData[newState] = { coords: [lat, lng], alerts: "0" }; 
          fetchWeatherAndAQI(lat, lng, newState);
          fetchSpots(lat, lng);
        },
        (err) => alert("Could not fetch location. Please ensure location permissions are granted.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById('risk-report-container');
    if (!reportElement) return;
    
    try {
      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HeatShield_Report_${formData.state.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  const speakAdvice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(advice);
      if (selectedLanguage === 'Hindi') utterance.lang = 'hi-IN';
      else if (selectedLanguage === 'Tamil') utterance.lang = 'ta-IN';
      else if (selectedLanguage === 'Telugu') utterance.lang = 'te-IN';
      else if (selectedLanguage === 'Kannada') utterance.lang = 'kn-IN';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendSMS = async (e) => {
    e.preventDefault();
    setSmsStatus('sending');
    try {
      const res = await fetch('http://localhost:8000/api/send-sms', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({phone: smsPhone})
      });
      if(res.ok) setSmsStatus('sent');
      else setSmsStatus('error');
    } catch(err) {
      setSmsStatus('error');
    }
    setTimeout(() => setSmsStatus(null), 4000);
    setSmsPhone('');
  };

  const handleReportSpot = async (id) => {
    try {
      await fetch('http://localhost:8000/api/report-spot', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({id})
      });
      setReportedSpots(prev => [...prev, id]);
    } catch (err) {}
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/reports');
      const data = await res.json();
      setReportedSpots(data.reported_spots || []);
    } catch (e) {}
  };

  const fetchSpots = async (lat, lng) => {
    try {
      const spotsRes = await fetch(`http://localhost:8000/api/safe-spots?lat=${lat}&lng=${lng}`);
      const spotsData = await spotsRes.json();
      setSafeSpots(spotsData.spots);
    } catch(err) {
      setSafeSpots([
        { id: "1", name: "City General Hospital", type: "hospital", lat: lat + 0.01, lng: lng + 0.01, distance: "1.2 km" },
        { id: "2", name: "Community Water Point", type: "water", lat: lat - 0.005, lng: lng + 0.005, distance: "400 m" }
      ]);
    }
  };

  useEffect(() => {
    fetchWeatherAndAQI(mapCenter[0], mapCenter[1], formData.state);
    fetchSpots(mapCenter[0], mapCenter[1]);
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRiskCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/risk-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setRiskResult(data);
      
      const adviceRes = await fetch('http://localhost:8000/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: data.level, language: selectedLanguage })
      });
      const adviceData = await adviceRes.json();
      setAdvice(adviceData.advice);
    } catch (err) {
      console.error(err);
      setRiskResult({ score: 3, level: "CRITICAL RISK" });
      setAdvice("🔴 YOU ARE AT HIGH RISK. The temperature and air quality are toxic today. Avoid working outdoors between 11AM–4PM. Find the nearest cooling center.");
    }
    setLoading(false);
  };

  const handleAddSpot = (e) => {
    e.preventDefault();
    if(!newSpot.name) return;
    const spot = {
      id: Date.now().toString(),
      name: newSpot.name,
      type: newSpot.type,
      lat: mapCenter[0] + (Math.random() - 0.5) * 0.02,
      lng: mapCenter[1] + (Math.random() - 0.5) * 0.02,
      distance: "Just added"
    };
    setSafeSpots([...safeSpots, spot]);
    setShowAddSpot(false);
    setNewSpot({ name: '', type: 'water' });
  };

  const getRiskColor = (level) => {
    if (level === 'CRITICAL RISK') return 'bg-red-500';
    if (level === 'HIGH RISK') return 'bg-orange-500';
    if (level === 'MEDIUM RISK') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleAdminToggle = () => {
    if (isAdminView) {
      setIsAdminView(false);
    } else {
      const pin = prompt("Enter Admin PIN (Hint: 1234)");
      if (pin === "1234") setIsAdminView(true);
      else if (pin !== null) alert("Incorrect PIN");
    }
  };

  // --- ADMIN VIEW RENDERING ---
  if (isAdminView) {
    const adminChartData = [
      { name: 'Monday', Critical: 400, High: 240 },
      { name: 'Tuesday', Critical: 300, High: 139 },
      { name: 'Wednesday', Critical: 200, High: 980 },
      { name: 'Thursday', Critical: 278, High: 390 },
      { name: 'Friday', Critical: 189, High: 480 },
    ];

    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
        <nav className="bg-slate-900 text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold">HeatShield <span className="text-orange-500 text-sm">ADMIN</span></span>
            </div>
            <button onClick={handleAdminToggle} className="text-slate-300 hover:text-white font-bold border border-slate-600 px-4 py-2 rounded-full text-sm">
              Exit Admin
            </button>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8 text-slate-800">System Analytics Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 font-medium">Total Risk Checks</p>
              <h2 className="text-4xl font-bold text-blue-600">24,592</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 font-medium">Critical Alerts Triggered</p>
              <h2 className="text-4xl font-bold text-red-600">8,204</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 font-medium">Active Users Today</p>
              <h2 className="text-4xl font-bold text-green-600">1,405</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-500" /> Weekly Risk Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adminChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Critical" fill="#ef4444" radius={[4,4,0,0]} />
                    <Bar dataKey="High" fill="#f97316" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Map className="h-5 w-5 text-orange-500" /> Community Reports</h3>
              <div className="space-y-3">
                {reportedSpots.length === 0 ? (
                  <p className="text-slate-500">No issues reported currently.</p>
                ) : (
                  reportedSpots.map((id, i) => {
                    const spot = safeSpots.find(s => s.id === id);
                    return (
                      <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                        <div>
                          <p className="font-bold text-red-800">{spot?.name || `Spot #${id}`}</p>
                          <p className="text-xs text-red-600 font-medium">Reported broken/unavailable</p>
                        </div>
                        <button onClick={() => setReportedSpots(prev => prev.filter(sId => sId !== id))} className="px-3 py-1 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50">
                          Resolve
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- MAIN APP VIEW RENDERING ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative pb-20">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
              HeatShield
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-slate-600 bg-transparent hover:text-orange-600 font-medium outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Telugu">Telugu</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
            </select>
            <button onClick={handleAdminToggle} className="ml-2 px-3 py-1 bg-slate-100 text-slate-600 text-sm font-bold rounded-full hover:bg-slate-200 transition-colors">
              Admin
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-orange-100 rounded-full text-orange-600">
              <CloudSun className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Today's Temp</p>
              <p className="text-3xl font-bold text-slate-800">{formData.temperature}°C</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-red-100 rounded-full text-red-600">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Air Quality (AQI)</p>
              <p className="text-3xl font-bold text-red-600">{formData.aqi} <span className="text-sm font-normal text-slate-500">({formData.aqi > 150 ? 'Unhealthy' : 'Moderate'})</span></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
              <Phone className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">SMS Alerts Sent</p>
              <p className="text-3xl font-bold text-slate-800">{currentStateData.alerts || "0"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Chart */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Hydration Tracker */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-500" /> Daily Hydration Tracker
              </h3>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500">Goal: {hydrationGoal} glasses</p>
                <p className="text-sm font-bold text-blue-600">{glassesDrank} / {hydrationGoal}</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (glassesDrank / hydrationGoal) * 100)}%` }}></div>
              </div>
              <button onClick={() => setGlassesDrank(prev => prev + 1)} className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors">
                <Plus className="h-4 w-4" /> Add Glass 🥛
              </button>
            </div>

            {/* Risk Form */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500"/> Personal Risk Check
              </h2>
              <form onSubmit={handleRiskCheck} className="space-y-5">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <select value={formData.state} onChange={handleStateChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                      {Object.keys(stateData).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                      {formData.state === "Current Location" && <option value="Current Location">Current Location</option>}
                    </select>
                  </div>
                  <button type="button" onClick={handleUseMyLocation} title="Use My Location"
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-blue-600 transition-colors border border-slate-200 shadow-sm flex items-center justify-center">
                    <Navigation className="h-6 w-6" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Do you work outdoors?</label>
                  <select value={formData.outdoor_job} onChange={e => setFormData({...formData, outdoor_job: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                    <option value={1}>Yes (Construction, Delivery, etc.)</option>
                    <option value={0}>No (Office, Home)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Health Conditions</label>
                  <select value={formData.bp_patient} onChange={e => setFormData({...formData, bp_patient: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                    <option value={1}>Blood Pressure / Heart Issue</option>
                    <option value={0}>None</option>
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all active:translate-y-0">
                  {loading ? 'Analyzing AI Risk...' : 'Calculate Risk Score'}
                </button>
              </form>
            </div>

            {riskResult && (
              <div id="risk-report-container" className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm tracking-wide mb-4 ${getRiskColor(riskResult.level)}`}>
                  <AlertTriangle className="h-4 w-4" /> {riskResult.level}
                </div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-slate-800">AI Safety Advice</h3>
                  <button onClick={speakAdvice} className="p-2 bg-slate-100 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Read Aloud">
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                  <p className="text-slate-700 leading-relaxed font-medium">{advice}</p>
                </div>
                <button onClick={handleDownloadPDF} type="button"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors shadow-md">
                  <Download className="h-5 w-5" /> Download PDF Report
                </button>
              </div>
            )}

            {/* 7-Day Forecast Chart */}
            {forecastData.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CloudSun className="h-5 w-5 text-orange-500" /> 7-Day Heat Forecast
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} unit="°" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="temp" stroke="#ea580c" strokeWidth={3} dot={{ r: 4, fill: '#ea580c', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* SMS Alert Form */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" /> Send Test SMS Alert
              </h3>
              <p className="text-xs text-slate-500 mb-3">Powered by Twilio API</p>
              <form onSubmit={handleSendSMS} className="flex gap-2">
                <input type="tel" placeholder="Mobile Number" value={smsPhone} onChange={e=>setSmsPhone(e.target.value)} required 
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-green-500" />
                <button type="submit" disabled={smsStatus === 'sending'} 
                  className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {smsStatus === 'sending' ? 'Sending...' : 'Send'}
                </button>
              </form>
              {smsStatus === 'sent' && <p className="text-green-600 text-sm mt-3 font-bold flex items-center gap-1">✅ Alert SMS sent successfully!</p>}
              {smsStatus === 'error' && <p className="text-red-600 text-sm mt-3 font-bold flex items-center gap-1">❌ Failed to send SMS.</p>}
            </div>

          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-full min-h-[600px] flex flex-col relative">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500"/> Nearest Safe Spots
                </h2>
                <div className="flex gap-2 items-center flex-wrap">
                  <button 
                    onClick={() => handleCategoryClick('hospital')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeCategory === 'hospital' ? 'bg-red-500 text-white shadow-md' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    Hospitals
                  </button>
                  <button 
                    onClick={() => handleCategoryClick('water')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeCategory === 'water' ? 'bg-blue-500 text-white shadow-md' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    Water
                  </button>
                  <button 
                    onClick={() => handleCategoryClick('cooling_center')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeCategory === 'cooling_center' ? 'bg-cyan-500 text-white shadow-md' : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'}`}>
                    Cooling Centers
                  </button>
                  <button 
                    onClick={() => handleCategoryClick('gurudwara')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeCategory === 'gurudwara' ? 'bg-green-500 text-white shadow-md' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    Gurudwara/NGO
                  </button>
                  
                  <button 
                    onClick={() => setShowAddSpot(true)}
                    className="ml-2 flex items-center gap-1 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow hover:bg-slate-700 transition-all">
                    <Plus className="h-4 w-4" /> Add Safe Spot
                  </button>
                </div>
              </div>

              {showAddSpot && (
                <div className="absolute top-20 right-8 z-[1000] bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 w-80 animate-in slide-in-from-top-4 fade-in">
                  <h3 className="font-bold text-lg mb-4">Add a Safe Spot</h3>
                  <form onSubmit={handleAddSpot} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Spot Name</label>
                      <input type="text" required value={newSpot.name} onChange={e => setNewSpot({...newSpot, name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" 
                        placeholder="e.g. Ram Temple Water Tank" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                      <select value={newSpot.type} onChange={e => setNewSpot({...newSpot, type: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500">
                        <option value="water">Free Water Point</option>
                        <option value="gurudwara">Gurudwara / NGO</option>
                        <option value="cooling_center">Cooling Center</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="button" onClick={() => setShowAddSpot(false)}
                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
                      <button type="submit"
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700">Add Pin</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="flex-grow rounded-2xl overflow-hidden border border-slate-200 relative z-0">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                  />
                  <MapUpdater center={mapCenter} />
                  
                  {safeSpots.map(spot => {
                    const isReported = reportedSpots.includes(spot.id);
                    return (
                      <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={getMarkerIcon(spot.type, isReported)}>
                        <Popup>
                          <div className="p-1 min-w-[160px]">
                            <p className={`font-bold ${isReported ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{spot.name}</p>
                            <p className="text-sm text-slate-500 capitalize">{spot.type.replace('_', ' ')}</p>
                            <div className="flex justify-between items-center mt-3 mb-2">
                              <p className="text-sm font-medium text-blue-600">{spot.distance}</p>
                              <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-200 transition-colors"
                              >
                                Directions
                              </a>
                            </div>
                            <button 
                              onClick={() => handleReportSpot(spot.id)} 
                              disabled={isReported}
                              className={`w-full py-1 mt-1 text-xs font-bold rounded-lg transition-colors ${isReported ? 'bg-red-50 text-red-500 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600'}`}
                            >
                              {isReported ? '⚠️ Reported Broken/Empty' : 'Flag Issue'}
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {/* General Region Pin */}
                  <Marker position={mapCenter}>
                    <Popup>Region Center</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
            
            {activeCategory && (
              <div className="mt-6 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in slide-in-from-top-4 fade-in">
                <h3 className="font-bold text-lg text-slate-800 mb-4 capitalize">
                  {activeCategory.replace('_', ' ')} Directory
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeSpots.filter(s => s.type === activeCategory).map(spot => {
                    const isReported = reportedSpots.includes(spot.id);
                    return (
                    <div key={spot.id} className={`p-4 rounded-xl border flex justify-between items-center ${isReported ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <p className={`font-bold ${isReported ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{spot.name}</p>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3"/> 
                          {isReported ? 'Currently Unavailable' : (spot.address || `${spot.name} Center, Main Road`)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">{spot.distance}</p>
                        {!isReported && <a href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 font-bold underline mt-1 block">Navigate</a>}
                      </div>
                    </div>
                  )})}
                  {safeSpots.filter(s => s.type === activeCategory).length === 0 && (
                    <p className="text-slate-500 col-span-2">No locations found for this category nearby.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SOS Floating Action Button */}
      <a href="tel:108" className="fixed bottom-8 right-8 z-[2000] bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition-transform hover:scale-110 flex items-center justify-center animate-[pulse_2s_infinite] border-4 border-red-300">
        <Phone className="h-8 w-8" />
      </a>
    </div>
  );
}

export default App;
