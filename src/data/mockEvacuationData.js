export const VILLAGES = [
  { id: "V-01", name: "Nongpoh Village", coordinates: [25.900, 91.880] },
  { id: "V-02", name: "Umsning Settlement", coordinates: [25.750, 91.890] },
  { id: "V-03", name: "Byrnihat Town", coordinates: [26.050, 91.880] }
];

export const RELIEF_CAMPS = [
  { id: "C-01", name: "Guwahati Central Camp", coordinates: [26.144, 91.736], capacity: 500, available: 320 },
  { id: "C-02", name: "Shillong Army Base Camp", coordinates: [25.578, 91.893], capacity: 1000, available: 850 },
  { id: "C-03", name: "Nongpoh High School", coordinates: [25.905, 91.870], capacity: 200, available: 45 }
];

// This simulates the output from the Python Dijkstra backend.
// In reality, the backend would take the start, end, and hazard zones,
// prune the OSM network, and return this polyline.
export const ROUTE_CACHE = {
  "V-01_C-01": {
    status: "success",
    distance: "54 km",
    eta: "1 hr 15 mins",
    warnings: ["Rerouted around Guwahati-Shillong Highway segment (NH-6 Blocked)"],
    // A slightly curved route avoiding the hazard center (25.923, 91.872)
    path: [
      [25.900, 91.880], // Start: Nongpoh
      [25.910, 91.860], // Detour west to avoid 91.872 hazard
      [25.950, 91.840], 
      [26.000, 91.820],
      [26.080, 91.780],
      [26.144, 91.736]  // End: Guwahati Central
    ]
  },
  "V-01_C-02": {
    status: "success",
    distance: "40 km",
    eta: "55 mins",
    warnings: ["Heavy rainfall on route"],
    path: [
      [25.900, 91.880],
      [25.800, 91.885],
      [25.650, 91.890],
      [25.578, 91.893]
    ]
  }
};
