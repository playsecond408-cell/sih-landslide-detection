export const SUSCEPTIBILITY_ZONES = [
  {
    id: "SUS-042",
    name: "Shillong South Ridge",
    latitude: 25.565,
    longitude: 91.875,
    susceptibilityScore: 91,
    susceptibilityLevel: "Very High",
    slope: "42°",
    soilType: "Loose / Weathered",
    elevation: "1,180 m",
    drainage: "Poor",
    historicalEvents: 4,
    contributors: [
      { name: "Slope", percentage: 92 },
      { name: "Rainfall Exposure", percentage: 84 },
      { name: "Soil Condition", percentage: 76 },
      { name: "Historical Events", percentage: 61 },
      { name: "Elevation", percentage: 48 },
    ],
    radius: 3000
  },
  {
    id: "SUS-018",
    name: "Gangtok Approach",
    latitude: 27.325,
    longitude: 88.605,
    susceptibilityScore: 75,
    susceptibilityLevel: "High",
    slope: "35°",
    soilType: "Silty Clay",
    elevation: "1,600 m",
    drainage: "Moderate",
    historicalEvents: 2,
    contributors: [
      { name: "Slope", percentage: 80 },
      { name: "Rainfall Exposure", percentage: 70 },
      { name: "Historical Events", percentage: 50 },
      { name: "Soil Condition", percentage: 45 },
    ],
    radius: 4000
  },
  {
    id: "SUS-067",
    name: "Aizawl Outskirts",
    latitude: 23.738,
    longitude: 92.712,
    susceptibilityScore: 55,
    susceptibilityLevel: "Moderate",
    slope: "20°",
    soilType: "Compact",
    elevation: "1,050 m",
    drainage: "Good",
    historicalEvents: 1,
    contributors: [
      { name: "Rainfall Exposure", percentage: 60 },
      { name: "Slope", percentage: 55 },
      { name: "Soil Condition", percentage: 40 },
    ],
    radius: 2500
  },
  {
    id: "SUS-112",
    name: "Kohima Valley",
    latitude: 25.674,
    longitude: 94.108,
    susceptibilityScore: 30,
    susceptibilityLevel: "Low",
    slope: "10°",
    soilType: "Rocky",
    elevation: "1,350 m",
    drainage: "Excellent",
    historicalEvents: 0,
    contributors: [
      { name: "Rainfall Exposure", percentage: 40 },
      { name: "Slope", percentage: 25 },
    ],
    radius: 3500
  },
  {
    id: "SUS-005",
    name: "Itanagar Plains",
    latitude: 27.085,
    longitude: 93.605,
    susceptibilityScore: 15,
    susceptibilityLevel: "Very Low",
    slope: "5°",
    soilType: "Stable",
    elevation: "450 m",
    drainage: "Good",
    historicalEvents: 0,
    contributors: [
      { name: "Rainfall Exposure", percentage: 20 },
      { name: "Elevation", percentage: 15 },
    ],
    radius: 5000
  }
];

export const HISTORICAL_LANDSLIDES = [
  {
    id: "NER-H-018",
    year: "2023",
    latitude: 25.568,
    longitude: 91.870,
    trigger: "Heavy rainfall",
    severity: "Major",
  },
  {
    id: "NER-H-022",
    year: "2021",
    latitude: 27.320,
    longitude: 88.610,
    trigger: "Earthquake-induced",
    severity: "Moderate",
  },
  {
    id: "NER-H-045",
    year: "2019",
    latitude: 23.740,
    longitude: 92.715,
    trigger: "Prolonged monsoon",
    severity: "Minor",
  }
];

export const PREDEFINED_LOCATIONS = [
  { name: "Shillong", coords: [25.5788, 91.8933] },
  { name: "Gangtok", coords: [27.3314, 88.6138] },
  { name: "Aizawl", coords: [23.7271, 92.7176] },
  { name: "Kohima", coords: [25.6701, 94.1077] },
  { name: "Imphal", coords: [24.8170, 93.9368] },
  { name: "Itanagar", coords: [27.0844, 93.6053] },
  { name: "Agartala", coords: [23.8315, 91.2868] },
];
