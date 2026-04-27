import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, MapPin, AlertTriangle, CloudSun, Activity, Phone, Info, Plus } from 'lucide-react';
import L from 'leaflet';

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

const getMarkerIcon = (type) => {
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

  const handleCategoryClick = (type) => {
    setActiveCategory(prev => prev === type ? null : type);
  };

  const currentStateData = stateData[formData.state] || stateData["Telangana"];
  const mapCenter = currentStateData.coords || [17.3850, 78.4867];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const newData = stateData[newState] || stateData["Telangana"];
    setFormData({
      ...formData, 
      state: newState,
      temperature: newData.temp,
      aqi: newData.aqi
    });
    // Fetch new mock spots for the new city
    fetchSpots(newData.coords[0], newData.coords[1]);
  };

  const fetchSpots = async (lat, lng) => {
    try {
      const spotsRes = await fetch(`http://localhost:8000/api/safe-spots?lat=${lat}&lng=${lng}`);
      const spotsData = await spotsRes.json();
      setSafeSpots(spotsData.spots);
    } catch(err) {
      // Mock Data
      setSafeSpots([
        { id: "1", name: "City General Hospital", type: "hospital", lat: lat + 0.01, lng: lng + 0.01, distance: "1.2 km" },
        { id: "2", name: "Community Water Point", type: "water", lat: lat - 0.005, lng: lng + 0.005, distance: "400 m" }
      ]);
    }
  };

  useEffect(() => {
    fetchSpots(mapCenter[0], mapCenter[1]);
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
      // Drop pin slightly randomly around center for demo
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
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
              <p className="text-sm text-slate-500 font-medium">Tomorrow's Temp</p>
              <p className="text-3xl font-bold text-slate-800">{currentStateData.temp}°C</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-red-100 rounded-full text-red-600">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Air Quality (AQI)</p>
              <p className="text-3xl font-bold text-red-600">{currentStateData.aqi} <span className="text-sm font-normal text-slate-500">({currentStateData.aqi > 150 ? 'Unhealthy' : 'Moderate'})</span></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
              <Phone className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">SMS Alerts Sent</p>
              <p className="text-3xl font-bold text-slate-800">{currentStateData.alerts}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500"/> Personal Risk Check
              </h2>
              <form onSubmit={handleRiskCheck} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <select value={formData.state} onChange={handleStateChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                    {Object.keys(stateData).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
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
              <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm tracking-wide mb-4 ${getRiskColor(riskResult.level)}`}>
                  <AlertTriangle className="h-4 w-4" /> {riskResult.level}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">AI Safety Advice</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-700 leading-relaxed font-medium">{advice}</p>
                </div>
              </div>
            )}
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
                  
                  {safeSpots.map(spot => (
                    <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={getMarkerIcon(spot.type)}>
                      <Popup>
                        <div className="p-1 min-w-[160px]">
                          <p className="font-bold text-slate-800">{spot.name}</p>
                          <p className="text-sm text-slate-500 capitalize">{spot.type.replace('_', ' ')}</p>
                          <div className="flex justify-between items-center mt-3">
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
                        </div>
                      </Popup>
                    </Marker>
                  ))}
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
                  {safeSpots.filter(s => s.type === activeCategory).map(spot => (
                    <div key={spot.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{spot.name}</p>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3"/> 
                          {spot.address || `${spot.name} Center, Main Road`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">{spot.distance}</p>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 font-bold underline mt-1 block">Navigate</a>
                      </div>
                    </div>
                  ))}
                  {safeSpots.filter(s => s.type === activeCategory).length === 0 && (
                    <p className="text-slate-500 col-span-2">No locations found for this category nearby.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
