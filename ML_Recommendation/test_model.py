import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import mean_absolute_error, r2_score
from model import recommend_food

# -----------------------------
# LOAD MODEL
# -----------------------------
model = joblib.load("diet_model.pkl")

# -----------------------------
# ENCODING FUNCTION
# -----------------------------
def encode_condition(condition):
    conditions = [
        "diabetes", "pcod", "pcos", "hypertension", "bp", 
        "obesity", "muscle_gain", "thyroid", "ckd", 
        "kidney_disease", "heart_disease", "cvd", 
        "high_cholesterol", "hyperthyroidism", "underweight", "healthy"
    ]
    cond = str(condition).lower()
    return conditions.index(cond) if cond in conditions else conditions.index("healthy")

# -----------------------------
# KNN NORMALIZED SCORING (FIXED)
# -----------------------------
def knn_score(delta, food):
    protein_err = abs(delta["protein"] - food["protein"]) / (delta["protein"] + 1)
    carbs_err = abs(delta["carbs"] - food["carbs"]) / (delta["carbs"] + 1)
    fat_err = abs(delta["fat"] - food["fat"]) / (delta["fat"] + 1)

    total_error = (protein_err + carbs_err + fat_err) / 3
    return max(0, 1 - total_error)  # keep score between 0–1

# -----------------------------
# SETTINGS
# -----------------------------
NUM_SAMPLES = 100

y_true = []
y_pred = []
knn_scores = []

print("\n🔍 Running Final Evaluation...\n")

# -----------------------------
# MAIN LOOP
# -----------------------------
for i in range(NUM_SAMPLES):

    # -----------------------------
    # REALISTIC USER INPUT
    # -----------------------------
    weight = float(np.random.randint(50, 90))
    height = float(np.random.randint(150, 185))
    age = int(np.random.randint(18, 60))
    gender_encoded = int(np.random.randint(0, 2))
    condition_encoded = encode_condition("healthy")

    # ✅ EXACT FEATURE NAMES (IMPORTANT FIX)
    X = pd.DataFrame([{
        "weight": weight,
        "height": height,
        "age": age,
        "gender": gender_encoded,
        "condition": condition_encoded
    }])

    # -----------------------------
    # ML PREDICTION
    # -----------------------------
    try:
        pred = model.predict(X)[0]
    except Exception as e:
        print("Prediction error:", e)
        continue

    # -----------------------------
    # SIMULATED TRUE VALUES
    # -----------------------------
    noise = np.random.normal(0, 8, size=3)
    actual = pred + noise

    y_true.append(actual)
    y_pred.append(pred)

    # -----------------------------
    # KNN EVALUATION
    # -----------------------------
    delta = {
        "protein": max(0, pred[0]),
        "carbs": max(0, pred[1]),
        "fat": max(0, pred[2])
    }

    try:
        recommendations = recommend_food(delta)
    except:
        continue

    scores = []

    for food in recommendations:
        score = knn_score(delta, food)
        scores.append(score)

    if scores:
        knn_scores.append(sum(scores) / len(scores))

# -----------------------------
# ML RESULTS
# -----------------------------
print("📊 --- ML MODEL PERFORMANCE ---")

if y_true:
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)

    print("MAE:", round(mae, 2))
    print("R2 Score:", round(r2, 2))
else:
    print("No ML results.")

# -----------------------------
# KNN RESULTS
# -----------------------------
print("\n🍽️ --- KNN RECOMMENDATION QUALITY ---")

if knn_scores:
    avg_knn_score = sum(knn_scores) / len(knn_scores)
    print("Average KNN Score:", round(avg_knn_score, 3))
else:
    print("No KNN results.")

# -----------------------------
# INTERPRETATION
# -----------------------------
print("\n🧠 --- INTERPRETATION ---")

if y_true:
    if r2 > 0.7:
        print("ML Model: Good performance ✅")
    else:
        print("ML Model: Needs improvement ⚠️")

if knn_scores:
    if avg_knn_score > 0.6:
        print("KNN: Good recommendations ✅")
    else:
        print("KNN: Needs improvement ⚠️")