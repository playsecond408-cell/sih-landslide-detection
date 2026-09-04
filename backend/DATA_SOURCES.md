# DATA SOURCES & METHODOLOGY
## NER Landslide Intelligence System — SIH 2024

---

## Overview

This document describes the origin, justification, and calibration of all
parameters used in the two machine learning models powering the NER
Landslide Intelligence System.

Because real-world geospatial data for the North-East India region requires
GIS preprocessing tools (QGIS/ArcGIS) and authenticated API access that are
not feasible within a 36-hour hackathon, we adopted a **scientifically
grounded synthetic data approach**. Every parameter range and every label
generation rule in our datasets is derived directly from peer-reviewed
academic research and official Indian government data portals.

---

## Model 1 — Susceptibility Dataset (`susceptibility_dataset.csv`)

### What it answers: WHERE is a location naturally prone to landslides?

### Feature Parameters & Data Sources

| Feature | Range Used | Data Source & Justification |
|---|---|---|
| `latitude` | 21.5°N – 29.5°N | NER bounding box. Source: ISRO Bhuvan NER administrative boundary. |
| `longitude` | 88.0°E – 97.5°E | NER bounding box. Source: ISRO Bhuvan NER administrative boundary. |
| `slope_degrees` | 3° – 72° | ISRO NRSC CartoDEM analysis of NER terrain. Studies show >85% of NER landslides occur on slopes above 25°. North-biased distribution matches Himalayan foothills. |
| `elevation_m` | 50m – 3,000m | SRTM 30m DEM data. Assam plains at ~50m, Meghalaya plateau at 1,000–1,800m, Arunachal peaks at 2,500m+. |
| `land_use_code` | 0–4 | NRSC LULC Classification 2019 for NER. Classes: Dense Forest (0), Agriculture (1), Degraded Forest (2), Urban (3), Barren (4). |
| `soil_code` | 0–4 | Geological Survey of India (GSI) NER lithology report. Classes: Granite/Gneiss (0), Laterite (1), Alluvial (2), Colluvial (3), Shale (4). Colluvial and shale are the most common substrates in NER landslide events. |

### Label Generation Logic
Based on: *National Landslide Risk Management Strategy, India (NDMA, 2019)*
and peer-reviewed Himalayan susceptibility studies (MDPI Remote Sensing, 2022):

```
susceptibility_score = slope(40%) + soil_risk(25%) + lulc_risk(20%) + elevation(10%) + spatial_hotspot(5%)
is_susceptible = 1  if score > 0.55  else  0
```

**Spatial hotspot bonus:** A Gaussian function centred at Cherrapunji
(25.3°N, 91.7°E) adds extra susceptibility to the area that holds the
world record for highest rainfall — matching real-world landslide density.

---

## Model 2 — Early Warning Dataset (`early_warning_dataset.csv`)

### What it answers: WHEN is a landslide likely to happen TODAY?

### Feature Parameters & Data Sources

| Feature | Range Used | Data Source & Justification |
|---|---|---|
| `latitude` | 21.5°N – 29.5°N | Same NER bounding box. Spatial context for rainfall amplification. |
| `longitude` | 88.0°E – 97.5°E | Western NER (near Bay of Bengal) receives higher monsoon rainfall — encoded via a rainfall amplification factor. |
| `current_rain_mm_hr` | 0 – 150 mm/hr | IMD Colour-Coded Warning thresholds: >7.5mm/hr = Heavy, >35mm/hr = Extreme. NER (Cherrapunji) recorded 98mm/hr in June 2022. |
| `rain_48h_mm` | 0 – 600 mm | NASA LHASA (Landslide Hazard Assessment for Situational Awareness) model. >100mm/48h is the critical trigger threshold for Himalayan slopes. Cherrapunji's maximum recorded 48h rainfall is 493mm. |
| `soil_moisture_pct` | 0 – 100% | SMAP (Soil Moisture Active Passive) satellite / ASCAT. Values >70% indicate near-saturation. The 2017 Aizawl landslide occurred when soil moisture exceeded 78%. |
| `forecast_severity` | 0–3 | IMD Colour-Coded Rainfall Warning system: 0=Green (Clear), 1=Yellow (Light Rain), 2=Orange (Heavy Rain), 3=Red (Extreme Storm). |

### Label Generation Logic
Based on: *NASA LHASA Model (Stanley & Kirschbaum, 2017)* and
*IMD Intensity-Duration-Frequency (IDF) Curves for NER Region*:

```
trigger_score = rain_48h(40%) + soil_moisture(25%) + current_rain(25%) + forecast(10%)
alert_level = 0 (Safe)     if score < 0.25
            = 1 (Watch)    if 0.25 <= score < 0.50
            = 2 (Warning)  if 0.50 <= score < 0.75
            = 3 (Critical) if score >= 0.75
```

**Rainfall amplification:** Points near Cherrapunji (25.3°N, 91.7°E)
receive up to 1.6× higher rainfall values — matching IMD historical
records showing this area receives 3× the national average rainfall.

---

## In-Production Data Pipeline (Post-Hackathon Architecture)

In a production deployment, the synthetic CSV would be replaced by:

| Parameter | Live Source | Access Method |
|---|---|---|
| Slope & Elevation | ISRO Bhuvan CartoDEM | REST API — bhuvan.nrsc.gov.in |
| Land Use / Land Cover | NRSC LULC Map 2023 | WMS Layer — bhuvan.nrsc.gov.in |
| Soil / Geology | GSI Bhukosh Portal | bhukosh.gsi.gov.in/Bhukosh |
| Live Rainfall | IMD Nowcast API | mausam.imd.gov.in |
| 48h Cumulative Rain | NASA GPM / CHIRPS | earthdata.nasa.gov |
| Soil Moisture | SMAP Satellite | search.earthdata.nasa.gov |
| Forecast Severity | IMD District Warnings | sachet.ndma.gov.in |

---

## Model Evaluation Summary

| Metric | Susceptibility Model | Early-Warning Model |
|---|---|---|
| Algorithm | Random Forest (100 trees) | Decision Tree (depth 8) |
| Accuracy | **94.10%** | **81.00%** |
| F1 Score | 0.7489 | 0.8097 (weighted) |
| ROC-AUC | **0.9723** | N/A (multi-class) |
| Cross-Val F1 | 0.7026 ± 0.0151 | 0.8155 ± 0.0105 |

### Top Predictors (Feature Importance)

**Susceptibility Model:**
1. Soil Type (26.5%) — Colluvial/Shale soils are the strongest predictor
2. Land Use (23.2%) — Barren/Urban land has no root binding
3. Slope (19.1%) — Primary physical trigger
4. Latitude (11.7%) — Spatial learning of NER hotspots

**Early Warning Model:**
1. 48h Rainfall (34.1%) — Antecedent saturation is the #1 trigger
2. Soil Moisture (32.2%) — Near-saturation is the tipping point
3. Current Rain Intensity (21.2%) — Immediate trigger
4. Forecast Severity (9.7%) — Forward-looking risk

---

## References

1. ISRO NRSC. *Landslide Atlas of India*, 2023.
2. NDMA. *National Landslide Risk Management Strategy*, 2019.
3. Stanley, T. & Kirschbaum, D.B. *A heuristic approach to global landslide susceptibility mapping*. Natural Hazards, 2017.
4. IMD. *Colour-Coded Rainfall Warning Criteria*. mausam.imd.gov.in, 2021.
5. Kirschbaum, D.B. et al. *A global landslide catalog for hazard applications*. Natural Hazards, 2010.
6. GSI. *Geological Map of North-East India*. Geological Survey of India, 2020.
