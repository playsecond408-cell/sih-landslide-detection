import csv
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load dataset using pure Python csv reader
data = []
with open(os.path.join(BASE_DIR, 'early_warning_dataset.csv'), 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        data.append({
            'rain_48h': float(row['rain_48h_mm']),
            'current_rain': float(row['current_rain_mm_hr']),
            'moisture': float(row['soil_moisture_pct']),
            'trigger_score': float(row['trigger_score']),
            'alert_level': int(row['alert_level']),
        })

colors = {0: "#22c55e", 1: "#eab308", 2: "#f97316", 3: "#ef4444"}

# SVG canvas dimensions and margins
w, h = 900, 550
margin_left, margin_right, margin_top, margin_bottom = 80, 40, 60, 70
pw = w - margin_left - margin_right
ph = h - margin_top - margin_bottom
max_x, max_y = 550, 1.0

# Render Graph 1: Landslide Risk Score vs 48h Cumulative Rainfall
svg1 = [
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" style="background-color: #ffffff; font-family: system-ui, -apple-system, sans-serif;">',
    f'<text x="{w/2}" y="32" text-anchor="middle" font-size="18" font-weight="bold" fill="#1e293b">Graph 1: Landslide Risk Score vs. 48-Hour Cumulative Rainfall</text>',
    f'<text x="{w/2}" y="50" text-anchor="middle" font-size="12" fill="#64748b">Analyzed across 5,000 dataset samples showing Low, Moderate, and High Risk Cases</text>'
]

for score_pct in [0, 25, 50, 75, 100]:
    y_pos = margin_top + ph - (score_pct / 100.0) * ph
    svg1.append(f'<line x1="{margin_left}" y1="{y_pos}" x2="{w - margin_right}" y2="{y_pos}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="{ "4 4" if score_pct not in (0, 100) else "none" }"/>')
    svg1.append(f'<text x="{margin_left - 10}" y="{y_pos + 4}" text-anchor="end" font-size="11" fill="#64748b" font-weight="500">{score_pct}%</text>')

for r_val in [0, 100, 200, 300, 400, 500]:
    x_pos = margin_left + (r_val / max_x) * pw
    svg1.append(f'<line x1="{x_pos}" y1="{margin_top}" x2="{x_pos}" y2="{margin_top + ph}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 4"/>')
    svg1.append(f'<text x="{x_pos}" y="{margin_top + ph + 20}" text-anchor="middle" font-size="11" fill="#64748b" font-weight="500">{r_val} mm</text>')

svg1.append(f'<text x="{w/2}" y="{h - 18}" text-anchor="middle" font-size="13" font-weight="bold" fill="#334155">48-Hour Cumulative Rainfall (mm)</text>')
svg1.append(f'<text x="25" y="{h/2}" text-anchor="middle" font-size="13" font-weight="bold" fill="#334155" transform="rotate(-90 25 {h/2})">Landslide Risk Score (%)</text>')

sample_points = data[::5]
for pt in sample_points:
    cx = margin_left + (pt['rain_48h'] / max_x) * pw
    cy = margin_top + ph - pt['trigger_score'] * ph
    col = colors[pt['alert_level']]
    svg1.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="3.5" fill="{col}" opacity="0.6"/>')

svg1.append('</svg>')

with open(os.path.join(BASE_DIR, 'graph1_landslide_risk_vs_rainfall.svg'), 'w') as f:
    f.write('\n'.join(svg1))
print("SVG Graph 1 created successfully.")

# Render Graph 2: Landslide Risk Matrix (Soil Moisture vs 48h Rainfall)
max_moisture = 100.0
max_rain_y = 550.0

svg2 = [
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" style="background-color: #ffffff; font-family: system-ui, -apple-system, sans-serif;">',
    f'<text x="{w/2}" y="32" text-anchor="middle" font-size="18" font-weight="bold" fill="#1e293b">Graph 2: Landslide Risk Matrix (Soil Moisture vs. 48h Rainfall)</text>',
    f'<text x="{w/2}" y="50" text-anchor="middle" font-size="12" fill="#64748b">Highlighting Boundary Thresholds for Low, Moderate, and High Risk Cases</text>'
]

for m_val in [0, 25, 50, 75, 100]:
    x_pos = margin_left + (m_val / max_moisture) * pw
    svg2.append(f'<line x1="{x_pos}" y1="{margin_top}" x2="{x_pos}" y2="{margin_top + ph}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="{ "4 4" if m_val not in (0, 100) else "none" }"/>')
    svg2.append(f'<text x="{x_pos}" y="{margin_top + ph + 20}" text-anchor="middle" font-size="11" fill="#64748b" font-weight="500">{m_val}%</text>')

for r_val in [0, 100, 200, 300, 400, 500]:
    y_pos = margin_top + ph - (r_val / max_rain_y) * ph
    svg2.append(f'<line x1="{margin_left}" y1="{y_pos}" x2="{w - margin_right}" y2="{y_pos}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="{ "4 4" if r_val != 0 else "none" }"/>')
    svg2.append(f'<text x="{margin_left - 10}" y="{y_pos + 4}" text-anchor="end" font-size="11" fill="#64748b" font-weight="500">{r_val} mm</text>')

svg2.append(f'<text x="{w/2}" y="{h - 18}" text-anchor="middle" font-size="13" font-weight="bold" fill="#334155">Soil Moisture Saturation (%)</text>')
svg2.append(f'<text x="25" y="{h/2}" text-anchor="middle" font-size="13" font-weight="bold" fill="#334155" transform="rotate(-90 25 {h/2})">48-Hour Cumulative Rainfall (mm)</text>')

for pt in sample_points:
    cx = margin_left + (pt['moisture'] / max_moisture) * pw
    cy = margin_top + ph - (pt['rain_48h'] / max_rain_y) * ph
    col = colors[pt['alert_level']]
    svg2.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="3.5" fill="{col}" opacity="0.65"/>')

svg2.append('</svg>')

with open(os.path.join(BASE_DIR, 'graph2_soil_moisture_vs_rainfall.svg'), 'w') as f:
    f.write('\n'.join(svg2))
print("SVG Graph 2 created successfully.")
