// Comprehensive Risk Zones across North-East India with location-specific terrain and weather telemetry
export const RISK_ZONES = [
  // MEGHALAYA & ASSAM BORDER
  {
    id: "NER-042",
    name: "Guwahati-Shillong Highway (NH-6)",
    latitude: 25.923,
    longitude: 91.872,
    slope_degrees: 44.5,
    elevation_m: 850.0,
    land_use_code: 3,
    soil_code: 3,
    current_rain_mm_hr: 38.0,
    rain_48h_mm: 175.0,
    soil_moisture_pct: 78,
    risk_score: 91,
    risk_level: "Critical",
    trend: "Increasing",
    forecast_window: "Next 12 hours",
    potential_impact: ["NH-6 arterial road blocked", "2 nearby villages"],
    key_drivers: ["Steep cut slope", "Heavy rainfall 38mm/h", "High soil saturation"],
    radius: 3500
  },
  {
    id: "NER-018",
    name: "Cherrapunji Precipice Zone",
    latitude: 25.282,
    longitude: 91.722,
    slope_degrees: 52.0,
    elevation_m: 1480.0,
    land_use_code: 4,
    soil_code: 4,
    current_rain_mm_hr: 58.5,
    rain_48h_mm: 310.0,
    soil_moisture_pct: 88,
    risk_score: 95,
    risk_level: "Critical",
    trend: "Increasing",
    forecast_window: "Next 6 hours",
    potential_impact: ["Sohra tourist road", "3 villages"],
    key_drivers: ["Extreme downpour 58.5mm/h", "Exposed shale bed"],
    radius: 4000
  },
  {
    id: "NER-067",
    name: "Tura Ridge Escarpment",
    latitude: 25.513,
    longitude: 90.215,
    slope_degrees: 38.0,
    elevation_m: 650.0,
    land_use_code: 2,
    soil_code: 3,
    current_rain_mm_hr: 45.0,
    rain_48h_mm: 220.0,
    soil_moisture_pct: 82,
    risk_score: 87,
    risk_level: "Critical",
    trend: "Increasing",
    forecast_window: "Next 6 hours",
    potential_impact: ["District HQ arterial access"],
    key_drivers: ["Heavy monsoon downpour", "Seepage"],
    radius: 2500
  },
  {
    id: "NER-033",
    name: "Guwahati Zoo Road Slopes",
    latitude: 26.162,
    longitude: 91.781,
    slope_degrees: 14.0,
    elevation_m: 85.0,
    land_use_code: 3,
    soil_code: 2,
    current_rain_mm_hr: 12.0,
    rain_48h_mm: 45.0,
    soil_moisture_pct: 42,
    risk_score: 32,
    risk_level: "Low",
    trend: "Stable",
    forecast_window: "Next 48 hours",
    potential_impact: ["Urban drainage overflow"],
    key_drivers: ["Flat terrain", "Urban runoff"],
    radius: 2000
  },

  // NAGALAND & MANIPUR
  {
    id: "NER-112",
    name: "Kohima Bypass Approach (NH-2)",
    latitude: 25.674,
    longitude: 94.108,
    slope_degrees: 36.0,
    elevation_m: 1440.0,
    land_use_code: 3,
    soil_code: 4,
    current_rain_mm_hr: 24.0,
    rain_48h_mm: 115.0,
    soil_moisture_pct: 65,
    risk_score: 75,
    risk_level: "High",
    trend: "Stable",
    forecast_window: "Next 48 hours",
    potential_impact: ["NH-2 section", "Town supply corridor"],
    key_drivers: ["Unstable Disang shale", "Moderate rainfall"],
    radius: 3500
  },
  {
    id: "NER-115",
    name: "Dimapur Plains Border",
    latitude: 25.906,
    longitude: 93.727,
    slope_degrees: 6.5,
    elevation_m: 195.0,
    land_use_code: 1,
    soil_code: 2,
    current_rain_mm_hr: 4.5,
    rain_48h_mm: 25.0,
    soil_moisture_pct: 32,
    risk_score: 22,
    risk_level: "Low",
    trend: "Decreasing",
    forecast_window: "Next 72 hours",
    potential_impact: ["Agricultural fields"],
    key_drivers: ["Low slope", "Alluvial soil"],
    radius: 4500
  },
  {
    id: "NER-140",
    name: "Imphal-Jiribam Highway (NH-37)",
    latitude: 24.817,
    longitude: 93.412,
    slope_degrees: 41.0,
    elevation_m: 780.0,
    land_use_code: 2,
    soil_code: 3,
    current_rain_mm_hr: 36.0,
    rain_48h_mm: 160.0,
    soil_moisture_pct: 74,
    risk_score: 82,
    risk_level: "High",
    trend: "Increasing",
    forecast_window: "Next 12 hours",
    potential_impact: ["Lifeline highway to Manipur"],
    key_drivers: ["Hillside cutting", "Heavy downpour"],
    radius: 3800
  },

  // SIKKIM
  {
    id: "NER-201",
    name: "Gangtok-Nathula Highway (NH-310)",
    latitude: 27.331,
    longitude: 88.613,
    slope_degrees: 48.0,
    elevation_m: 1750.0,
    land_use_code: 4,
    soil_code: 4,
    current_rain_mm_hr: 42.0,
    rain_48h_mm: 210.0,
    soil_moisture_pct: 85,
    risk_score: 89,
    risk_level: "Critical",
    trend: "Increasing",
    forecast_window: "Next 6 hours",
    potential_impact: ["Border highway", "Army movement corridor"],
    key_drivers: ["Steep alpine slope", "Heavy rainfall"],
    radius: 4000
  },
  {
    id: "NER-205",
    name: "Mangan Sub-division Corridor",
    latitude: 27.502,
    longitude: 88.533,
    slope_degrees: 45.0,
    elevation_m: 1200.0,
    land_use_code: 2,
    soil_code: 3,
    current_rain_mm_hr: 40.0,
    rain_48h_mm: 195.0,
    soil_moisture_pct: 80,
    risk_score: 86,
    risk_level: "Critical",
    trend: "Stable",
    forecast_window: "Next 24 hours",
    potential_impact: ["North Sikkim road link"],
    key_drivers: ["Flash flood erosion", "Debris load"],
    radius: 3500
  },

  // MIZORAM & TRIPURA
  {
    id: "NER-091",
    name: "Aizawl North Ridge Settlement",
    latitude: 23.738,
    longitude: 92.712,
    slope_degrees: 34.0,
    elevation_m: 1100.0,
    land_use_code: 3,
    soil_code: 4,
    current_rain_mm_hr: 28.0,
    rain_48h_mm: 130.0,
    soil_moisture_pct: 68,
    risk_score: 78,
    risk_level: "High",
    trend: "Increasing",
    forecast_window: "Next 24 hours",
    potential_impact: ["Chaltlang neighbourhood"],
    key_drivers: ["Slope overloading", "Siltstone weathering"],
    radius: 2500
  },
  {
    id: "NER-095",
    name: "Lunglei South Cut",
    latitude: 22.887,
    longitude: 92.731,
    slope_degrees: 29.0,
    elevation_m: 720.0,
    land_use_code: 1,
    soil_code: 1,
    current_rain_mm_hr: 18.0,
    rain_48h_mm: 85.0,
    soil_moisture_pct: 54,
    risk_score: 54,
    risk_level: "Moderate",
    trend: "Stable",
    forecast_window: "Next 48 hours",
    potential_impact: ["State Highway 2"],
    key_drivers: ["Jhum cultivation", "Moderate slope"],
    radius: 3000
  },
  {
    id: "NER-302",
    name: "Agartala Valley Lowlands",
    latitude: 23.831,
    longitude: 91.286,
    slope_degrees: 4.0,
    elevation_m: 35.0,
    land_use_code: 3,
    soil_code: 2,
    current_rain_mm_hr: 3.5,
    rain_48h_mm: 18.0,
    soil_moisture_pct: 26,
    risk_score: 18,
    risk_level: "Low",
    trend: "Stable",
    forecast_window: "Next 72 hours",
    potential_impact: ["Minor urban waterlogging"],
    key_drivers: ["Flat topography"],
    radius: 5000
  },

  // ARUNACHAL PRADESH
  {
    id: "NER-005",
    name: "Itanagar NH-415 Hill Section",
    latitude: 27.085,
    longitude: 93.605,
    slope_degrees: 37.5,
    elevation_m: 450.0,
    land_use_code: 2,
    soil_code: 3,
    current_rain_mm_hr: 26.0,
    rain_48h_mm: 120.0,
    soil_moisture_pct: 66,
    risk_score: 72,
    risk_level: "High",
    trend: "Stable",
    forecast_window: "Next 24 hours",
    potential_impact: ["NH-415 capital link"],
    key_drivers: ["Highway widening cut", "Sandstone erosion"],
    radius: 3000
  },
  {
    id: "NER-009",
    name: "Tawang Pass Route",
    latitude: 27.586,
    longitude: 91.859,
    slope_degrees: 46.0,
    elevation_m: 2600.0,
    land_use_code: 0,
    soil_code: 0,
    current_rain_mm_hr: 19.0,
    rain_48h_mm: 90.0,
    soil_moisture_pct: 58,
    risk_score: 64,
    risk_level: "Moderate",
    trend: "Increasing",
    forecast_window: "Next 12 hours",
    potential_impact: ["Strategic route"],
    key_drivers: ["High elevation", "Freeze-thaw cycles"],
    radius: 4000
  },

  // ASSAM BARAK & BRAHMAPUTRA VALLEYS
  {
    id: "NER-022",
    name: "Silchar Valley Edge (Cachar)",
    latitude: 24.833,
    longitude: 92.778,
    slope_degrees: 12.0,
    elevation_m: 45.0,
    land_use_code: 1,
    soil_code: 2,
    current_rain_mm_hr: 14.0,
    rain_48h_mm: 65.0,
    soil_moisture_pct: 48,
    risk_score: 42,
    risk_level: "Moderate",
    trend: "Stable",
    forecast_window: "Next 72 hours",
    potential_impact: ["Local feeder roads"],
    key_drivers: ["River bank erosion"],
    radius: 4500
  },
  {
    id: "NER-055",
    name: "Tezpur Brahmaputra Bluff",
    latitude: 26.633,
    longitude: 92.793,
    slope_degrees: 8.0,
    elevation_m: 60.0,
    land_use_code: 1,
    soil_code: 2,
    current_rain_mm_hr: 6.0,
    rain_48h_mm: 35.0,
    soil_moisture_pct: 38,
    risk_score: 25,
    risk_level: "Low",
    trend: "Stable",
    forecast_window: "Next 72 hours",
    potential_impact: ["Riverfront embankment"],
    key_drivers: ["Low relief"],
    radius: 4000
  }
];

export const ROAD_SEGMENTS = [
  {
    id: "R-014",
    name: "NH-6 Guwahati-Shillong Line",
    status: "Blocked",
    risk_score: 86,
    affected_villages: 4,
    coordinates: [
      [25.9, 91.85],
      [25.95, 91.89]
    ]
  },
  {
    id: "R-042",
    name: "NH-2 Kohima Pass",
    status: "At Risk",
    risk_score: 75,
    affected_villages: 2,
    coordinates: [
      [25.65, 94.1],
      [25.7, 94.12]
    ]
  },
  {
    id: "R-008",
    name: "NH-310 Gangtok Border Route",
    status: "At Risk",
    risk_score: 82,
    affected_villages: 3,
    coordinates: [
      [27.30, 88.60],
      [27.35, 88.63]
    ]
  },
  {
    id: "R-012",
    name: "State Highway 12 (Assam Plains)",
    status: "Open",
    risk_score: 25,
    affected_villages: 8,
    coordinates: [
      [26.10, 92.0],
      [26.15, 92.2]
    ]
  }
];

export const COMMUNITY_OBSERVATIONS = [
  {
    id: "OBS-01",
    type: "Road Crack",
    location: "Guwahati-Shillong Highway",
    latitude: 25.930,
    longitude: 91.875,
    time: "10:20 AM",
    status: "Pending verification",
    icon: "⚠"
  },
  {
    id: "OBS-02",
    type: "Mud Seepage",
    location: "Tura Ridge",
    latitude: 25.510,
    longitude: 90.220,
    time: "08:15 AM",
    status: "Verified",
    icon: "💧"
  },
  {
    id: "OBS-03",
    type: "Rockfall Incident",
    location: "Kohima Bypass",
    latitude: 25.670,
    longitude: 94.105,
    time: "Yesterday, 4:00 PM",
    status: "Verified",
    icon: "🪨"
  },
  {
    id: "OBS-04",
    type: "Retaining Wall Bulge",
    location: "Gangtok NH-310",
    latitude: 27.328,
    longitude: 88.612,
    time: "Today, 11:45 AM",
    status: "Critical Alert",
    icon: "🏗"
  }
];

export const WEATHER_DATA = {
  current_rainfall: "38.0 mm/hr",
  rainfall_24h: "175 mm",
  forecast: "Heavy to Extreme Monsoon Downpour",
  trend: "High Risk Active"
};

export const ALERTS = [
  {
    id: "ALT-001",
    level: "Critical",
    zone_id: "NER-042",
    risk_score: 91,
    message: "Immediate evacuation notice for NH-6 cut slopes.",
    impact: "Main lifeline arterial road at high risk of blockage",
    time: "10 minutes ago"
  },
  {
    id: "ALT-002",
    level: "Critical",
    zone_id: "NER-201",
    risk_score: 89,
    message: "Nathula Pass road slope destabilizing under rain.",
    impact: "Defense and tourist corridor restricted",
    time: "35 minutes ago"
  },
  {
    id: "ALT-003",
    level: "High",
    zone_id: "NER-018",
    risk_score: 88,
    message: "Cherrapunji 48h rainfall exceeded 200mm threshold.",
    impact: "Tourist route and 3 villages on alert",
    time: "1 hour ago"
  }
];

// Add this to the end of src/data/mockData.js
export const RELIEF_CENTERS = [
  { id: "RC1", name: "Guwahati Central Relief Camp (Assam Eng College)", latitude: 26.1400, longitude: 91.6620, capacity: 500, status: "Secure" },
  { id: "RC2", name: "Shillong Civil Hospital Safe Zone", latitude: 25.5727, longitude: 91.8845, capacity: 1200, status: "Secure" },
  { id: "RC3", name: "Gangtok Paljor Stadium Camp", latitude: 27.3325, longitude: 88.6140, capacity: 2000, status: "Secure" },
  { id: "RC4", name: "Imphal RIMS Relief Base", latitude: 24.8170, longitude: 93.9368, capacity: 800, status: "At Risk" }, // Red
  { id: "RC5", name: "Nongpoh District Shelter (NH-6)", latitude: 25.9030, longitude: 91.8750, capacity: 1500, status: "Secure" },
  { id: "RC11", name: "Nongpoh PHC Medical Camp", latitude: 25.9150, longitude: 91.8880, capacity: 400, status: "Secure" },
  { id: "RC12", name: "Pahamsyiem Community Hall (Nongpoh)", latitude: 25.8850, longitude: 91.8800, capacity: 250, status: "Full" }, // Red
  { id: "RC13", name: "Umsning High School Safe Zone", latitude: 25.7500, longitude: 91.8900, capacity: 800, status: "Secure" },
  { id: "RC6", name: "Cherrapunji (Sohra) Community Hall", latitude: 25.2850, longitude: 91.7300, capacity: 300, status: "At Risk" }, // Red
  { id: "RC7", name: "Mawsynram Primary School Shelter", latitude: 25.3100, longitude: 91.5900, capacity: 450, status: "Secure" },
  { id: "RC8", name: "Tura Govt College Relief Camp", latitude: 25.5150, longitude: 90.2250, capacity: 900, status: "Full" }, // Red
  { id: "RC9", name: "Dawki Border Safe House", latitude: 25.1850, longitude: 92.0150, capacity: 250, status: "Secure" },
  { id: "RC10", name: "Kohima Science College Camp", latitude: 25.6740, longitude: 94.1080, capacity: 1000, status: "Secure" }
];
