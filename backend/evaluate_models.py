import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import cross_val_score, train_test_split

sys.stdout.reconfigure(encoding='utf-8')
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load datasets and trained models
df_susc = pd.read_csv(os.path.join(BASE_DIR, 'susceptibility_dataset.csv'))
df_warn = pd.read_csv(os.path.join(BASE_DIR, 'early_warning_dataset.csv'))

pkg1 = joblib.load(os.path.join(BASE_DIR, 'susceptibility_model.pkl'))
model1, features1 = pkg1['model'], pkg1['features']

pkg2 = joblib.load(os.path.join(BASE_DIR, 'early_warning_model.pkl'))
model2, features2 = pkg2['model'], pkg2['features']

# Split train and test partitions
X1 = df_susc[features1]
y1 = df_susc['is_susceptible']
X2 = df_warn[features2]
y2 = df_warn['alert_level']

_, X1_test, _, y1_test = train_test_split(X1, y1, test_size=0.2, random_state=42)
_, X2_test, _, y2_test = train_test_split(X2, y2, test_size=0.2, random_state=42)

# Generate predictions for evaluation metrics
y1_pred = model1.predict(X1_test)
y2_pred = model2.predict(X2_test)
y1_prob = model1.predict_proba(X1_test)[:, 1]

lines = []
def p(s=""):
    lines.append(s)
    print(s)

# Print model 1 evaluation summary
p("MODEL 1: Susceptibility Classifier (Random Forest)")
p(f"Accuracy: {accuracy_score(y1_test, y1_pred):.4f}")
p(f"Precision: {precision_score(y1_test, y1_pred):.4f}")
p(f"Recall: {recall_score(y1_test, y1_pred):.4f}")
p(f"F1 Score: {f1_score(y1_test, y1_pred):.4f}")
p(f"ROC-AUC: {roc_auc_score(y1_test, y1_prob):.4f}")
cv1 = cross_val_score(model1, X1, y1, cv=5, scoring='f1')
p(f"Cross-Val F1: {cv1.mean():.4f} +/- {cv1.std():.4f}")

# Print model 2 evaluation summary
p("\nMODEL 2: Early Warning Classifier (Decision Tree)")
p(f"Accuracy: {accuracy_score(y2_test, y2_pred):.4f}")
p(f"Precision: {precision_score(y2_test, y2_pred, average='weighted'):.4f}")
p(f"Recall: {recall_score(y2_test, y2_pred, average='weighted'):.4f}")
p(f"F1 Score: {f1_score(y2_test, y2_pred, average='weighted'):.4f}")
cv2 = cross_val_score(model2, X2, y2, cv=5, scoring='f1_weighted')
p(f"Cross-Val F1: {cv2.mean():.4f} +/- {cv2.std():.4f}")

# Save full metrics report to file
with open(os.path.join(BASE_DIR, 'model_evaluation_report.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print("\nSaved evaluation report.")
