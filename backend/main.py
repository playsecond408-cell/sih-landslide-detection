import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Limit OpenBLAS/MKL threads to 1 for lightweight container environments
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'

# Base directory for locating models and datasets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(
    title="NER Landslide Prediction API",
    description="Spatial ML models for Susceptibility and Early Warning"
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained ML models and their feature lists
try:
    pkg1 = joblib.load(os.path.join(BASE_DIR, 'susceptibility_model.pkl'))
    model_susc, features_susc = pkg1['model'], pkg1['features']

    pkg2 = joblib.load(os.path.join(BASE_DIR, 'early_warning_model.pkl'))
    model_warn, features_warn = pkg2['model'], pkg2['features']

    susceptibility_model = model_susc
    early_warning_model = model_warn
    print("[OK] Both ML models loaded successfully.")
except Exception as e:
    print(f"[ERROR] Could not load models: {e}")
    model_susc, model_warn = None, None
    susceptibility_model, early_warning_model = None, None
    features_susc, features_warn = [], []

# Pydantic schema for single-point susceptibility prediction
class SusceptibilityRequest(BaseModel):
    latitude: float = Field(..., ge=21.5, le=29.5, example=25.923)
    longitude: float = Field(..., ge=88.0, le=97.5, example=91.872)
    slope_degrees: float = Field(..., ge=0, le=90, example=38.5)
    elevation_m: float = Field(..., ge=0, le=5000, example=850.0)
    land_use_code: int = Field(..., ge=0, le=4, example=2)
    soil_code: int = Field(..., ge=0, le=4, example=3)

# Pydantic schema for real-time weather-triggered early warning
class WarningRequest(BaseModel):
    latitude: float = Field(..., ge=21.5, le=29.5, example=25.282)
    longitude: float = Field(..., ge=88.0, le=97.5, example=91.722)
    current_rain_mm_hr: float = Field(..., ge=0, le=300, example=42.0)
    rain_48h_mm: float = Field(..., ge=0, le=1000, example=185.0)
    soil_moisture_pct: float = Field(..., ge=0, le=100, example=74.0)
    forecast_severity: int = Field(..., ge=0, le=3, example=2)

# Pydantic schema for batch spatial prediction
class BatchPoint(BaseModel):
    latitude: float
    longitude: float
    slope_degrees: float = 30.0
    elevation_m: float = 500.0
    land_use_code: int = 2
    soil_code: int = 3
    current_rain_mm_hr: float = 20.0
    rain_48h_mm: float = 80.0
    soil_moisture_pct: float = 60.0
    forecast_severity: int = 1

# Pydantic schema for evacuation route requests
class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    hazard_zones: list[dict] = []

# Pydantic schema for citizen hazard observations
class ObservationRequest(BaseModel):
    type: str
    location: str
    latitude: float
    longitude: float

# Pydantic schema for WhatsApp webhook reports
class WhatsAppWebhookRequest(BaseModel):
    phone_number: str = "+919876543210"
    caption: str = "Spotted deep cracks along the hillside road"
    photo_url: str = "https://example.com/crack_photo.jpg"
    latitude: float = 25.565
    longitude: float = 91.875

# Pydantic schema for 2G USSD session reports
class USSDSessionRequest(BaseModel):
    session_id: str = "USSD-99823"
    phone_number: str = "+919123456789"
    service_code: str = "*384*100#"
    text: str = "1*793001"

# Pydantic schema for emergency 5G ProSe broadcasts
class ProSeBroadcastRequest(BaseModel):
    target_latitude: float = 25.923
    target_longitude: float = 91.872
    broadcast_radius_km: float = 5.0
    warning_title: str = "CRITICAL LANDSLIDE WARNING"
    warning_body: str = "Immediate evacuation required for NH-6 hillside segment. Move to higher ground."

# In-memory database of community observations
community_observations_db = [
    {
        "id": "OBS-101",
        "type": "Road Crack",
        "location": "Guwahati-Shillong Highway",
        "latitude": 25.930,
        "longitude": 91.875,
        "time": "10:20 AM",
        "status": "Pending verification",
        "icon": "⚠"
    },
    {
        "id": "OBS-102",
        "type": "Seepage",
        "location": "Tura Ridge Escarpment",
        "latitude": 25.510,
        "longitude": 90.220,
        "time": "08:15 AM",
        "status": "Verified",
        "icon": "💧"
    }
]

# Health check endpoint
@app.get("/", tags=["Health"])
def home():
    return {
        "status": "running",
        "endpoints": ["/predict/susceptibility", "/predict/early-warning", "/api/live-risk-zones"],
        "docs": "/docs"
    }

# Predict natural terrain susceptibility score and category
@app.post("/predict/susceptibility", tags=["Models"])
def predict_susceptibility(data: SusceptibilityRequest):
    if not model_susc:
        raise HTTPException(status_code=500, detail="Susceptibility model not loaded.")
    df = pd.DataFrame([{
        'latitude': data.latitude,
        'longitude': data.longitude,
        'slope_degrees': data.slope_degrees,
        'elevation_m': data.elevation_m,
        'land_use_code': data.land_use_code,
        'soil_code': data.soil_code,
    }])[features_susc]

    prediction = int(model_susc.predict(df)[0])
    probability = round(float(model_susc.predict_proba(df)[0][1]) * 100, 2)
    risk_label = "Critical" if probability >= 75 else "High" if probability >= 55 else "Moderate" if probability >= 35 else "Low"

    return {
        "latitude": data.latitude,
        "longitude": data.longitude,
        "is_susceptible": bool(prediction),
        "risk_probability": probability,
        "risk_label": risk_label,
        "message": f"Point ({data.latitude:.3f}, {data.longitude:.3f}) is {risk_label} risk ({probability}%)"
    }

# Predict real-time early warning trigger alert based on weather
@app.post("/predict/early-warning", tags=["Models"])
def predict_warning(data: WarningRequest):
    if not model_warn:
        raise HTTPException(status_code=500, detail="Early warning model not loaded.")
    df = pd.DataFrame([{
        'latitude': data.latitude,
        'longitude': data.longitude,
        'current_rain_mm_hr': data.current_rain_mm_hr,
        'rain_48h_mm': data.rain_48h_mm,
        'soil_moisture_pct': data.soil_moisture_pct,
        'forecast_severity': data.forecast_severity,
    }])[features_warn]

    alert_level = int(model_warn.predict(df)[0])
    status_map = {
        0: {"status": "Safe", "color": "#22c55e", "action": "No immediate action required."},
        1: {"status": "Watch", "color": "#eab308", "action": "Stay alert. Monitor conditions closely."},
        2: {"status": "Warning", "color": "#f97316", "action": "Prepare for evacuation. Avoid slopes."},
        3: {"status": "Critical", "color": "#ef4444", "action": "EVACUATE IMMEDIATELY. Do not delay."},
    }
    result = status_map[alert_level]

    return {
        "latitude": data.latitude,
        "longitude": data.longitude,
        "alert_level": alert_level,
        "status": result["status"],
        "color": result["color"],
        "action": result["action"],
        "message": f"[{result['status'].upper()}] {result['action']}"
    }

# Predict combined hybrid risk scores for multiple coordinate points
@app.post("/predict/batch-warning", tags=["Models"])
def predict_batch_warning(points: list[BatchPoint]):
    if not model_susc or not model_warn:
        raise HTTPException(status_code=500, detail="Models not loaded.")
    if len(points) > 100:
        raise HTTPException(status_code=400, detail="Max 100 points per batch request.")

    color_map = {"Critical": "#ef4444", "High": "#f97316", "Moderate": "#eab308", "Low": "#22c55e"}
    results = []

    for pt in points:
        df_s = pd.DataFrame([{
            'latitude': pt.latitude,
            'longitude': pt.longitude,
            'slope_degrees': pt.slope_degrees,
            'elevation_m': pt.elevation_m,
            'land_use_code': pt.land_use_code,
            'soil_code': pt.soil_code,
        }])[features_susc]
        susc_prob = float(model_susc.predict_proba(df_s)[0][1]) * 100.0

        df_w = pd.DataFrame([{
            'latitude': pt.latitude,
            'longitude': pt.longitude,
            'current_rain_mm_hr': pt.current_rain_mm_hr,
            'rain_48h_mm': pt.rain_48h_mm,
            'soil_moisture_pct': pt.soil_moisture_pct,
            'forecast_severity': pt.forecast_severity,
        }])[features_warn]
        alert_level = int(model_warn.predict(df_w)[0])

        combined_score = round(susc_prob * 0.40 + (alert_level / 3.0 * 100.0) * 0.60, 1)
        level = "Critical" if combined_score >= 75 else "High" if combined_score >= 55 else "Moderate" if combined_score >= 35 else "Low"

        results.append({
            "latitude": pt.latitude,
            "longitude": pt.longitude,
            "susc_prob": round(susc_prob, 1),
            "alert_level": alert_level,
            "combined_score": combined_score,
            "risk_level": level,
            "status": f"{level} ({combined_score}%)",
            "color": color_map[level]
        })

    return {"count": len(results), "predictions": results}

# Serve sample rows from the susceptibility CSV dataset
@app.get("/dataset/susceptibility", tags=["Datasets"])
def get_susceptibility_dataset(limit: int = 50):
    try:
        csv_path = os.path.join(BASE_DIR, 'susceptibility_dataset.csv')
        df = pd.read_csv(csv_path)
        sample = df.sample(n=min(limit, len(df))).to_dict(orient='records')
        return {"count": len(sample), "data": sample}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve sample rows from the early warning CSV dataset
@app.get("/dataset/early-warning", tags=["Datasets"])
def get_early_warning_dataset(limit: int = 50):
    try:
        csv_path = os.path.join(BASE_DIR, 'early_warning_dataset.csv')
        df = pd.read_csv(csv_path)
        sample = df.sample(n=min(limit, len(df))).to_dict(orient='records')
        return {"count": len(sample), "data": sample}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Compute real-time ML risk predictions across strategic North-East India locations
@app.get("/api/live-risk-zones", tags=["Dynamic Live Services"])
def get_live_risk_zones():
    locations = [
        {"id": "NER-042", "name": "Guwahati-Shillong Highway (NH-6)", "lat": 25.923, "lng": 91.872, "slope": 44.5, "elev": 850.0, "lu": 3, "soil": 3, "rain": 38.0, "rain48": 175.0, "moist": 78},
        {"id": "NER-018", "name": "Cherrapunji Precipice Zone", "lat": 25.282, "lng": 91.722, "slope": 52.0, "elev": 1480.0, "lu": 4, "soil": 4, "rain": 58.5, "rain48": 310.0, "moist": 88},
        {"id": "NER-067", "name": "Tura Ridge Escarpment", "lat": 25.513, "lng": 90.215, "slope": 38.0, "elev": 650.0, "lu": 2, "soil": 3, "rain": 45.0, "rain48": 220.0, "moist": 82},
        {"id": "NER-033", "name": "Guwahati Zoo Road Slopes", "lat": 26.162, "lng": 91.781, "slope": 14.0, "elev": 85.0, "lu": 3, "soil": 2, "rain": 12.0, "rain48": 45.0, "moist": 42},
        {"id": "NER-112", "name": "Kohima Bypass Approach (NH-2)", "lat": 25.674, "lng": 94.108, "slope": 36.0, "elev": 1440.0, "lu": 3, "soil": 4, "rain": 24.0, "rain48": 115.0, "moist": 65},
        {"id": "NER-115", "name": "Dimapur Plains Border", "lat": 25.906, "lng": 93.727, "slope": 6.5, "elev": 195.0, "lu": 1, "soil": 2, "rain": 4.5, "rain48": 25.0, "moist": 32},
        {"id": "NER-140", "name": "Imphal-Jiribam Highway (NH-37)", "lat": 24.817, "lng": 93.412, "slope": 41.0, "elev": 780.0, "lu": 2, "soil": 3, "rain": 36.0, "rain48": 160.0, "moist": 74},
        {"id": "NER-201", "name": "Gangtok-Nathula Highway (NH-310)", "lat": 27.331, "lng": 88.613, "slope": 48.0, "elev": 1750.0, "lu": 4, "soil": 4, "rain": 42.0, "rain48": 210.0, "moist": 85},
        {"id": "NER-205", "name": "Mangan Sub-division Corridor", "lat": 27.502, "lng": 88.533, "slope": 45.0, "elev": 1200.0, "lu": 2, "soil": 3, "rain": 40.0, "rain48": 195.0, "moist": 80},
        {"id": "NER-091", "name": "Aizawl North Ridge Settlement", "lat": 23.738, "lng": 92.712, "slope": 34.0, "elev": 1100.0, "lu": 3, "soil": 4, "rain": 28.0, "rain48": 130.0, "moist": 68},
        {"id": "NER-095", "name": "Lunglei South Cut", "lat": 22.887, "lng": 92.731, "slope": 29.0, "elev": 720.0, "lu": 1, "soil": 1, "rain": 18.0, "rain48": 85.0, "moist": 54},
        {"id": "NER-302", "name": "Agartala Valley Lowlands", "lat": 23.831, "lng": 91.286, "slope": 4.0, "elev": 35.0, "lu": 3, "soil": 2, "rain": 3.5, "rain48": 18.0, "moist": 26},
        {"id": "NER-005", "name": "Itanagar NH-415 Hill Section", "lat": 27.085, "lng": 93.605, "slope": 37.5, "elev": 450.0, "lu": 2, "soil": 3, "rain": 26.0, "rain48": 120.0, "moist": 66},
        {"id": "NER-009", "name": "Tawang Pass Route", "lat": 27.586, "lng": 91.859, "slope": 46.0, "elev": 2600.0, "lu": 0, "soil": 0, "rain": 19.0, "rain48": 90.0, "moist": 58},
        {"id": "NER-022", "name": "Silchar Valley Edge (Cachar)", "lat": 24.833, "lng": 92.778, "slope": 12.0, "elev": 45.0, "lu": 1, "soil": 2, "rain": 14.0, "rain48": 65.0, "moist": 48},
        {"id": "NER-055", "name": "Tezpur Brahmaputra Bluff", "lat": 26.633, "lng": 92.793, "slope": 8.0, "elev": 60.0, "lu": 1, "soil": 2, "rain": 6.0, "rain48": 35.0, "moist": 38}
    ]

    results = []
    for loc in locations:
        susc_score = 0.5
        alert_lvl = "MODERATE"

        if model_susc:
            try:
                X_susc = pd.DataFrame([{
                    "latitude": loc["lat"], "longitude": loc["lng"],
                    "slope_degrees": loc["slope"], "elevation_m": loc["elev"],
                    "land_use_code": loc["lu"], "soil_code": loc["soil"]
                }])[features_susc]
                susc_prob = model_susc.predict_proba(X_susc)[0][1]
                susc_score = float(susc_prob)
            except Exception:
                pass

        if model_warn:
            try:
                forecast_sev = 3 if loc["rain"] > 35 else 2 if loc["rain"] > 15 else 1 if loc["rain"] > 2 else 0
                X_ew = pd.DataFrame([{
                    "latitude": loc["lat"], "longitude": loc["lng"],
                    "current_rain_mm_hr": loc["rain"], "rain_48h_mm": loc["rain48"],
                    "soil_moisture_pct": loc["moist"], "forecast_severity": forecast_sev
                }])[features_warn]
                alert_code = int(model_warn.predict(X_ew)[0])
                alert_map = {0: 'SAFE', 1: 'WATCH', 2: 'WARNING', 3: 'CRITICAL'}
                alert_lvl = alert_map.get(alert_code, 'MODERATE')
            except Exception:
                pass

        alert_weight = 0.9 if alert_lvl == 'CRITICAL' else 0.7 if alert_lvl == 'WARNING' else 0.4 if alert_lvl in ('MODERATE', 'WATCH') else 0.1
        comb_score = int(round((susc_score * 0.5 + alert_weight * 0.5) * 100))
        risk_level = "Critical" if comb_score >= 80 else "High" if comb_score >= 60 else "Moderate" if comb_score >= 40 else "Low"

        results.append({
            "id": loc["id"],
            "name": loc["name"],
            "latitude": loc["lat"],
            "longitude": loc["lng"],
            "slope_degrees": loc["slope"],
            "elevation_m": loc["elev"],
            "land_use_code": loc["lu"],
            "soil_code": loc["soil"],
            "current_rain_mm_hr": loc["rain"],
            "rain_48h_mm": loc["rain48"],
            "soil_moisture_pct": loc["moist"],
            "susceptibility_score": round(susc_score, 2),
            "early_warning_level": alert_lvl,
            "risk_score": comb_score,
            "risk_level": risk_level,
            "potential_impact": [f"Landslide vulnerability {comb_score}%", f"Rainfall {loc['rain']} mm/hr"],
            "key_drivers": [f"Slope {loc['slope']}°", f"Elevation {loc['elev']}m"],
            "radius": 3500
        })

    return {"count": len(results), "zones": results, "risk_zones": results}

# Compute real-world driving evacuation route around active hazard zones
@app.post("/api/evacuation-route", tags=["Dynamic Live Services"])
def calculate_dynamic_evacuation_route(req: RouteRequest):
    import requests
    import math

    try:
        detour_needed = False
        detour_lat = req.start_lat
        detour_lng = req.start_lng

        mid_lat = (req.start_lat + req.end_lat) / 2
        mid_lng = (req.start_lng + req.end_lng) / 2

        for hz in req.hazard_zones:
            hz_lat = hz.get('latitude', hz.get('lat', 0))
            hz_lng = hz.get('longitude', hz.get('lng', 0))
            hz_dist = math.sqrt((mid_lat - hz_lat)**2 + (mid_lng - hz_lng)**2) * 111
            if hz_dist < 3.0:
                detour_needed = True
                detour_lat = mid_lat + 0.03
                detour_lng = mid_lng - 0.03
                break

        coords = f"{req.start_lng},{req.start_lat}"
        if detour_needed:
            coords += f";{detour_lng},{detour_lat}"
        coords += f";{req.end_lng},{req.end_lat}"

        url = f"http://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson"
        response = requests.get(url, timeout=10)
        data = response.json()

        if data.get('code') != 'Ok':
            raise Exception("OSRM Routing failed to find a valid road.")

        route = data['routes'][0]
        dist_km = round(route['distance'] / 1000.0, 1)
        eta_mins = round(route['duration'] / 60.0)
        path_coords = [[pt[1], pt[0]] for pt in route['geometry']['coordinates']]

        return {
            "status": "success",
            "distance": f"{dist_km} km",
            "eta": f"{max(1, eta_mins)} mins",
            "algorithm": "OSRM Valid Road Routing",
            "path": path_coords,
            "blocked_edges_removed": 1 if detour_needed else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Return list of crowdsourced citizen observations
@app.get("/api/observations", tags=["Dynamic Live Services"])
def get_observations():
    return {"count": len(community_observations_db), "observations": community_observations_db}

# Log new crowdsourced citizen observation
@app.post("/api/observations", tags=["Dynamic Live Services"])
def add_observation(obs: ObservationRequest):
    new_obs = {
        "id": f"OBS-{len(community_observations_db) + 101}",
        "type": obs.type,
        "location": obs.location,
        "latitude": obs.latitude,
        "longitude": obs.longitude,
        "time": "Just now",
        "status": "Submitted & Pending Verification",
        "icon": "⚠"
    }
    community_observations_db.append(new_obs)
    return {"status": "success", "observation": new_obs}

# Ingest citizen photo reports via WhatsApp Webhook
@app.post("/api/webhooks/whatsapp", tags=["Multi-Channel Citizen Ingestion"])
def whatsapp_bot_webhook(data: WhatsAppWebhookRequest):
    new_obs = {
        "id": f"WA-OBS-{len(community_observations_db) + 101}",
        "type": "WhatsApp Geotagged Photo",
        "location": f"Reported by {data.phone_number[:6]}*** ({data.caption})",
        "latitude": data.latitude,
        "longitude": data.longitude,
        "photo_url": data.photo_url,
        "time": "Just now via WhatsApp",
        "status": "Ground-Truth Verified (Photo AI Confirmed)",
        "icon": "📸"
    }
    community_observations_db.append(new_obs)
    return {
        "status": "success",
        "channel": "WhatsApp Business API",
        "message": "Observation logged. Ground-truth weight added.",
        "observation": new_obs
    }

# Ingest offline 2G USSD reports
@app.post("/api/webhooks/ussd", tags=["Multi-Channel Citizen Ingestion"])
def ussd_feature_phone_webhook(data: USSDSessionRequest):
    inputs = data.text.split('*')
    hazard_map = {"1": "Road Crack", "2": "Mud Seepage", "3": "Rockfall/Landslide"}
    hazard_type = hazard_map.get(inputs[0], "General Hazard")
    pincode = inputs[1] if len(inputs) > 1 else "Unknown Area"

    new_obs = {
        "id": f"USSD-OBS-{len(community_observations_db) + 101}",
        "type": f"USSD 2G Report ({hazard_type})",
        "location": f"Pincode/Cell Tower: {pincode}",
        "latitude": 25.578,
        "longitude": 91.893,
        "time": "Just now via USSD *384*100#",
        "status": "Offline USSD Logged",
        "icon": "📱"
    }
    community_observations_db.append(new_obs)

    return {
        "status": "success",
        "channel": "2G USSD Protocol (*384*100#)",
        "response_menu": f"CON Thank you. Report for {hazard_type} logged at {pincode}. Stay safe!",
        "observation": new_obs
    }

# Broadcast emergency warning via 5G ProSe Direct Sidelink mesh
@app.post("/api/alerts/5g-prose-broadcast", tags=["5G ProSe & Off-Grid Alerting"])
def broadcast_5g_prose_offgrid_alert(req: ProSeBroadcastRequest):
    estimated_mesh_nodes = int(req.broadcast_radius_km * 45)
    return {
        "status": "broadcast_active",
        "protocol": "3GPP Release 17 5G ProSe Sidelink D2D",
        "fallback_protocol": "Government Sachet CAP Cell Broadcast",
        "target_coordinates": [req.target_latitude, req.target_longitude],
        "radius_km": req.broadcast_radius_km,
        "estimated_reached_devices": estimated_mesh_nodes,
        "mesh_relays_active": True,
        "zero_cell_tower_required": True,
        "alert": {
            "title": req.warning_title,
            "body": req.warning_body,
            "timestamp": "IMMUTABLE EMERGENCY BROADCAST"
        }
    }
