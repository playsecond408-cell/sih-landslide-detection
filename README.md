# 🏔️ NER Landslide AI — Early Warning & Evacuation Routing System

An end-to-end intelligent disaster management platform for the **North-East India Region (NER)**. The system couples spatial machine learning models for terrain susceptibility and real-time weather triggers with dynamic evacuation road routing, crowdsourced citizen hazard reports, and off-grid emergency alerts.

---

## 🚀 How It Works

The platform operates across four core modules to deliver early warning and automated disaster response:

### 1. Dual-Model Machine Learning Engine
* **Model 1: Susceptibility Prediction (WHERE)**:
  * **Algorithm**: Random Forest Classifier (`susceptibility_model.pkl`)
  * **Inputs**: Latitude, Longitude, Slope Angle (°), Elevation (m), Land Use / Land Cover (LULC), Soil / Lithology Code.
  * **Output**: Probability of natural slope failure (0–100%) and susceptibility category (*Low, Moderate, High, Critical*).
* **Model 2: Early Warning Prediction (WHEN)**:
  * **Algorithm**: Decision Tree Classifier (`early_warning_model.pkl`)
  * **Inputs**: Real-time Rainfall Rate (mm/hr), 48-Hour Cumulative Rainfall (mm), Soil Moisture Saturation (%), Weather Forecast Severity (0–3).
  * **Output**: 4-Tier Hazard Alert Level (*Safe, Watch, Warning, Critical*).
* **Hybrid Score Computation**:
  $$\text{Composite Risk} = (\text{Susceptibility Probability} \times 0.40) + (\text{Early Warning Score} \times 0.60)$$
  This ensures low-slope areas do not trigger false alarms during heavy rain, while steep, degraded slopes trigger rapid evacuations.

### 2. Real-Time Satellite Telemetry
* Integrates with the **Open-Meteo Satellite API** to pull live precipitation, relative humidity, and 48-hour rainfall forecasts for any coordinate across North-East India.

### 3. Hazard-Aware Dynamic Evacuation Routing
* Powered by the **Open Source Routing Machine (OSRM)** and Leaflet.
* Connects vulnerable settlements to designated relief camps over real drivable road networks.
* If a roadway intersects an active critical landslide zone, the algorithm automatically calculates perpendicular detour waypoints to route vehicles safely around blocked segments.

### 4. Multi-Channel Ingestion & Off-Grid Alerting
* **WhatsApp Business Webhook**: Citizens can report road cracks and mud seepage with geotagged photos, adding ground-truth weights to the local ML risk calculation.
* **2G USSD Gateway (`*384*100#`)**: Enables rural communities with feature phones and no internet connection to submit emergency hazard reports.
* **3GPP 5G ProSe Sidelink D2D Engine**: Direct device-to-device mesh broadcast capability designed for situations where cellular towers suffer physical damage or power outages.
* **Vision-Based Rockfall Detection**: Dedicated YOLO11 rockfall detector (`rockfall_server.py`) for live video feed monitoring on critical highways like NH-6.

---

## 🛠️ Project Structure

```text
├── backend/
│   ├── main.py                     # FastAPI REST API & ML endpoints
│   ├── train_models.py             # Script to generate datasets and train ML models
│   ├── evaluate_models.py          # Model metrics, ROC-AUC, and feature importance
│   ├── susceptibility_model.pkl    # Pre-trained Random Forest model (~2.7 MB)
│   ├── early_warning_model.pkl     # Pre-trained Decision Tree model (~35 KB)
│   ├── susceptibility_dataset.csv  # Spatial terrain dataset (5,000 records)
│   ├── early_warning_dataset.csv   # Weather trigger dataset (5,000 records)
│   └── requirements.txt            # Python dependencies
├── src/
│   ├── components/                 # Leaflet maps, weather panels, risk monitors
│   ├── pages/                      # CommandCenter, EvacuationManager, SusceptibilityExplorer
│   ├── services/api.js             # API client connecting frontend to backend
│   └── data/                       # Mock spatial telemetry and predefined relief centers
├── rockfall_server.py              # Computer vision rockfall streaming proxy (Roboflow YOLO11)
├── start_backend.bat               # 1-click Windows backend launcher
└── package.json                    # React + Vite configuration
```

---

## 💻 Installation & Local Setup

### Prerequisites
* **Node.js**: v18.0 or higher ([Download Node.js](https://nodejs.org/))
* **Python**: v3.10 to v3.12 ([Download Python](https://www.python.org/))
* **Git**: Installed and configured

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/playsecond408-cell/sih-landslide-detection.git
cd sih-landslide-detection
```

---

### Step 2: Start the Python ML Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment (recommended):
   ```bash
   # Windows:
   python -m venv venv
   venv\Scripts\activate

   # macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   *(Alternatively on Windows: simply double-click `start_backend.bat` in the project root).*

Backend Swagger API documentation is available at:
👉 **`http://localhost:8000/docs`**

---

### Step 3: Start the React Frontend

1. Open a new terminal window in the project root folder:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at:
   👉 **`http://localhost:5173`**

---

### Step 4 (Optional): Start the Rockfall AI Video Detector

To run the Roboflow YOLO11 rockfall detection stream:
```bash
python rockfall_server.py
```
Open **`http://localhost:8080/rockfall_detector.html`** to view real-time rockfall object detection.

---

## 🌐 Deploying to Production

### 1. Backend (Render / Railway - Free)
1. Link your GitHub repo to [Render.com](https://render.com).
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `pip install -r requirements.txt`.
4. Set **Start Command** to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Copy the live URL (e.g. `https://sih-landslide-backend.onrender.com`).

### 2. Frontend (Vercel)
1. Import the repository into [Vercel.com](https://vercel.com).
2. Add the Environment Variable:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://your-backend-name.onrender.com`
3. Click **Deploy**.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API Health Check and active route status |
| `POST` | `/predict/susceptibility` | Predicts slope failure likelihood for terrain coordinates |
| `POST` | `/predict/early-warning` | Predicts real-time alert level based on precipitation & moisture |
| `POST` | `/predict/batch-warning` | Computes hybrid risk scores for multiple coordinate batches |
| `GET` | `/api/live-risk-zones` | Returns live ML risk assessments across 16 NER regional points |
| `POST` | `/api/evacuation-route` | Computes hazard-avoiding road routes via OSRM |
| `GET` | `/api/observations` | Retrieves crowdsourced citizen observation feeds |
| `POST` | `/api/observations` | Submits a new citizen field observation |
| `POST` | `/api/webhooks/whatsapp` | Webhook ingestion for WhatsApp photos & geotags |
| `POST` | `/api/webhooks/ussd` | Gateway for 2G feature phone hazard reporting |
| `POST` | `/api/alerts/5g-prose-broadcast`| Direct device-to-device mesh emergency broadcast |

---

## 📄 License
This project was developed for the Smart India Hackathon (SIH) disaster management initiative.
