import os
import matplotlib.pyplot as plt
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load early warning dataset
df = pd.read_csv(os.path.join(BASE_DIR, 'early_warning_dataset.csv'))

# Configure chart style and dimensions
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

# Map numeric alert levels to descriptive risk categories
df['risk_case'] = df['alert_level'].map({
    0: 'Low Risk (Safe)',
    1: 'Moderate Risk (Watch)',
    2: 'Moderate Risk (Warning)',
    3: 'High Risk (Critical)'
})

colors = {
    'Low Risk (Safe)': '#22c55e',
    'Moderate Risk (Watch)': '#eab308',
    'Moderate Risk (Warning)': '#f97316',
    'High Risk (Critical)': '#ef4444'
}

# Plot risk score against 48h cumulative rainfall
plt.figure(figsize=(11, 6), dpi=300)
for case_name, color in colors.items():
    subset = df[df['risk_case'] == case_name]
    plt.scatter(subset['rain_48h_mm'], subset['trigger_score'] * 100, c=color, label=case_name, alpha=0.6, edgecolors='none', s=35)

plt.axhline(y=25, color='#eab308', linestyle='--', linewidth=1.5, label='Watch Threshold (25%)')
plt.axhline(y=50, color='#f97316', linestyle='--', linewidth=1.5, label='Warning Threshold (50%)')
plt.axhline(y=75, color='#ef4444', linestyle='--', linewidth=1.5, label='Critical Threshold (75%)')
plt.title('Landslide Risk Score vs. 48h Cumulative Rainfall', fontsize=13, fontweight='bold', pad=12)
plt.xlabel('48-Hour Cumulative Rainfall (mm)', fontsize=11, fontweight='bold')
plt.ylabel('Landslide Risk Score (%)', fontsize=11, fontweight='bold')
plt.ylim(-5, 105)
plt.xlim(0, df['rain_48h_mm'].max() + 20)
plt.legend(loc='upper left', frameon=True, facecolor='white', framealpha=0.9, fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, 'chart1_landslide_risk_vs_rainfall.png'), dpi=300)
plt.close()

# Plot soil moisture saturation against 48h rainfall
plt.figure(figsize=(11, 6), dpi=300)
for case_name, color in colors.items():
    subset = df[df['risk_case'] == case_name]
    plt.scatter(subset['soil_moisture_pct'], subset['rain_48h_mm'], c=color, label=case_name, alpha=0.65, edgecolors='none', s=35)

plt.title('Landslide Risk Matrix: Soil Moisture vs. 48h Rainfall', fontsize=13, fontweight='bold', pad=12)
plt.xlabel('Soil Moisture Saturation (%)', fontsize=11, fontweight='bold')
plt.ylabel('48-Hour Cumulative Rainfall (mm)', fontsize=11, fontweight='bold')
plt.xlim(0, 105)
plt.ylim(0, df['rain_48h_mm'].max() + 50)
plt.legend(loc='upper right', frameon=True, facecolor='white', framealpha=0.9, fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, 'chart2_soil_moisture_vs_rainfall.png'), dpi=300)
plt.close()
