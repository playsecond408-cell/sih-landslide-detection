import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# Set random seed and sample size for reproducibility
np.random.seed(42)
N = 5000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Helper function to blend, shuffle, and trim distribution samples
def blended(parts):
    arr = np.concatenate(parts)
    np.random.shuffle(arr)
    return arr[:N]

# Generate realistic spatial coordinates for North-East India region
lat = blended([
    np.random.uniform(21.5, 23.5, int(N * 0.15)),
    np.random.uniform(23.5, 25.5, int(N * 0.25)),
    np.random.uniform(25.5, 27.0, int(N * 0.35)),
    np.random.uniform(27.0, 29.5, int(N * 0.25)),
])

lng = blended([
    np.random.uniform(88.0, 90.5, int(N * 0.20)),
    np.random.uniform(90.5, 92.5, int(N * 0.35)),
    np.random.uniform(92.5, 94.5, int(N * 0.25)),
    np.random.uniform(94.5, 97.5, int(N * 0.20)),
])

# Compute slope, elevation, land-use, and soil parameters
lat_factor = (lat - 21.5) / 8.0
slope = np.clip(15 + lat_factor * 30 + np.random.normal(0, 8, N), 3, 72)
elevation = np.clip(100 + lat_factor * 1800 + np.random.normal(0, 200, N), 50, 3000)
land_use = np.random.choice([0, 1, 2, 3, 4], size=N, p=[0.30, 0.25, 0.20, 0.15, 0.10])
soil_type = np.random.choice([0, 1, 2, 3, 4], size=N, p=[0.15, 0.25, 0.20, 0.25, 0.15])

# Calculate susceptibility risk score and classification label
slope_norm = np.clip((slope - 3) / 69, 0, 1)
elev_norm = np.clip((elevation - 50) / 2950, 0, 1)
lulc_risk = land_use / 4
soil_risk = soil_type / 4
spatial_risk = np.exp(-((lat - 25.3)**2 / 2.0 + (lng - 91.7)**2 / 4.0))

susc_score = (slope_norm * 0.35 + soil_risk * 0.25 + lulc_risk * 0.20 + elev_norm * 0.10 + spatial_risk * 0.10)
susc_score = np.clip(susc_score + np.random.normal(0, 0.04, N), 0, 1)
is_susceptible = (susc_score > 0.55).astype(int)

lulc_labels = {0: 'Dense Forest', 1: 'Agriculture', 2: 'Degraded Forest', 3: 'Urban', 4: 'Barren'}
soil_labels = {0: 'Granite/Gneiss', 1: 'Laterite', 2: 'Alluvial', 3: 'Colluvial', 4: 'Shale'}

# Assemble and persist susceptibility dataset CSV
df_susc = pd.DataFrame({
    'latitude': np.round(lat, 5),
    'longitude': np.round(lng, 5),
    'slope_degrees': np.round(slope, 2),
    'elevation_m': np.round(elevation, 1),
    'land_use_code': land_use,
    'land_use_label': [lulc_labels[v] for v in land_use],
    'soil_code': soil_type,
    'soil_label': [soil_labels[v] for v in soil_type],
    'susceptibility_score': np.round(susc_score, 4),
    'is_susceptible': is_susceptible
})
df_susc.to_csv(os.path.join(BASE_DIR, 'susceptibility_dataset.csv'), index=False)

# Simulate dynamic weather features for early warning dataset
rain_factor = np.clip(1 + 0.6 * np.exp(-((lat - 25.3)**2 / 3.0 + (lng - 91.7)**2 / 5.0)), 1, 1.6)
current_rain = np.clip(blended([
    np.random.uniform(0, 2, int(N * 0.35)),
    np.random.uniform(2, 15, int(N * 0.30)),
    np.random.uniform(15, 50, int(N * 0.25)),
    np.random.uniform(50, 120, int(N * 0.10)),
]) * rain_factor, 0, 150)

rain_48h = np.clip(blended([
    np.random.uniform(0, 30, int(N * 0.30)),
    np.random.uniform(30, 100, int(N * 0.30)),
    np.random.uniform(100, 250, int(N * 0.25)),
    np.random.uniform(250, 500, int(N * 0.15)),
]) * rain_factor, 0, 600)

soil_moisture = np.clip(blended([
    np.random.uniform(10, 30, int(N * 0.25)),
    np.random.uniform(30, 60, int(N * 0.35)),
    np.random.uniform(60, 80, int(N * 0.25)),
    np.random.uniform(80, 100, int(N * 0.15)),
]), 0, 100)

forecast_severity = np.random.choice([0, 1, 2, 3], size=N, p=[0.25, 0.35, 0.25, 0.15])

# Compute trigger score and assign 4-level warning category
rain_norm = current_rain / 150
rain48_norm = rain_48h / 600
moist_norm = soil_moisture / 100
forecast_norm = forecast_severity / 3

trigger_score = np.clip((rain48_norm * 0.40 + moist_norm * 0.25 + rain_norm * 0.25 + forecast_norm * 0.10) + np.random.normal(0, 0.04, N), 0, 1)

conditions = [
    trigger_score < 0.25,
    (trigger_score >= 0.25) & (trigger_score < 0.50),
    (trigger_score >= 0.50) & (trigger_score < 0.75),
    trigger_score >= 0.75
]
alert_labels = np.select(conditions, [0, 1, 2, 3])
alert_map = {0: 'Safe', 1: 'Watch', 2: 'Warning', 3: 'Critical'}
forecast_map = {0: 'Clear', 1: 'Light Rain', 2: 'Heavy Rain', 3: 'Extreme Storm'}

# Assemble and persist early warning dataset CSV
df_warn = pd.DataFrame({
    'latitude': np.round(lat, 5),
    'longitude': np.round(lng, 5),
    'current_rain_mm_hr': np.round(current_rain, 2),
    'rain_48h_mm': np.round(rain_48h, 2),
    'soil_moisture_pct': np.round(soil_moisture, 2),
    'forecast_severity': forecast_severity,
    'forecast_label': [forecast_map[v] for v in forecast_severity],
    'trigger_score': np.round(trigger_score, 4),
    'alert_level': alert_labels,
    'alert_status': np.array([alert_map[int(v)] for v in alert_labels])
})
df_warn.to_csv(os.path.join(BASE_DIR, 'early_warning_dataset.csv'), index=False)

# Train Random Forest classifier for terrain susceptibility
SUSC_FEATURES = ['latitude', 'longitude', 'slope_degrees', 'elevation_m', 'land_use_code', 'soil_code']
X1_train, X1_test, y1_train, y1_test = train_test_split(df_susc[SUSC_FEATURES], df_susc['is_susceptible'], test_size=0.2, random_state=42)
model1 = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
model1.fit(X1_train, y1_train)
acc1 = accuracy_score(y1_test, model1.predict(X1_test))
print(f"Susceptibility Model Accuracy: {acc1 * 100:.1f}%")
joblib.dump({'model': model1, 'features': SUSC_FEATURES}, os.path.join(BASE_DIR, 'susceptibility_model.pkl'))

# Train Decision Tree classifier for real-time early warning
WARN_FEATURES = ['latitude', 'longitude', 'current_rain_mm_hr', 'rain_48h_mm', 'soil_moisture_pct', 'forecast_severity']
X2_train, X2_test, y2_train, y2_test = train_test_split(df_warn[WARN_FEATURES], df_warn['alert_level'], test_size=0.2, random_state=42)
model2 = DecisionTreeClassifier(max_depth=8, random_state=42)
model2.fit(X2_train, y2_train)
acc2 = accuracy_score(y2_test, model2.predict(X2_test))
print(f"Early Warning Model Accuracy: {acc2 * 100:.1f}%")
joblib.dump({'model': model2, 'features': WARN_FEATURES}, os.path.join(BASE_DIR, 'early_warning_model.pkl'))
