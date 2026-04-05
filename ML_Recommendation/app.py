from fastapi import FastAPI
from pydantic import BaseModel
from baseline import calculate_medical_baseline
from model import recommend_food  
import joblib

app = FastAPI()

# ✅ Load trained ML model
model = joblib.load("diet_model.pkl")

# -----------------------------
# INPUT SCHEMAS
# -----------------------------
class InputData(BaseModel):
    health_condition: str
    weight_kg: float
    height_cm: float
    age: int
    gender: str
    avg: dict 

class PredictInput(BaseModel):
    weight: float
    height: float
    age: int
    gender: int   # 1 male, 0 female
    condition: int

# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def encode_condition(condition):
    conditions = ["diabetes", "pcod", "hypertension", "obesity", "healthy"]
    return conditions.index(condition.lower()) if condition.lower() in conditions else 4

def generate_smart_diet_plan(delta, final_target, current_avg, condition):
    """
    Constructs a structured diet plan with status updates and at least 3 suggestions.
    """
    # 1. Macro Status Summary
    status = {}
    for macro in ["protein", "carbs", "fat"]:
        diff = current_avg[macro] - final_target[macro]
        if diff > 5:
            status[macro] = "Over Target"
        elif diff < -5:
            status[macro] = "Under Target"
        else:
            status[macro] = "On Track"

    # 2. Medical Condition Tips
    tips = {
        "diabetes": "Focus on low-glycemic, high-fiber carbs to stabilize blood sugar levels.",
        "pcod": "Prioritize lean proteins and anti-inflammatory healthy fats to balance hormones.",
        "hypertension": "Keep sodium low and prioritize potassium-rich vegetables (leafy greens, potatoes).",
        "obesity": "Incorporate high-volume, low-calorie foods to improve satiety.",
        "healthy": "Maintain a diverse intake of whole grains, lean proteins, and colorful vegetables."
    }

    plan = {
        "macro_analysis": status,
        "health_tip": tips.get(condition.lower(), "Maintain a balanced diet and consult a professional."),
        "suggestions": []
    }

    # 3. Generating 3 items based on the Delta
    # Ensure recommend_food(delta) is updated to return a LIST of 3 objects
    top_items = recommend_food(delta) 

    if isinstance(top_items, list):
        for idx, item in enumerate(top_items):
            plan["suggestions"].append({
                "option_number": idx + 1,
                "food_details": item,
                "insight": f"This item helps optimize your nutrition while managing {condition}."
            })
    else:
        # Fallback in case logic in model.py isn't a list
        plan["suggestions"].append({
            "option_number": 1,
            "food_details": top_items,
            "insight": "Primary recommendation based on your current gap."
        })

    return plan

# -----------------------------
# MAIN RECOMMENDATION API
# -----------------------------
@app.post("/recommend")
def get_recommendation(data: InputData):

    # 1. BASELINE (rule-based)
    baseline = calculate_medical_baseline(
        data.health_condition,
        data.weight_kg,
        data.height_cm,
        data.age,
        data.gender
    )

    baseline_norm = {
        "protein": baseline.get("Target_Protein_g", baseline.get("Max_Protein_g", 0)),
        "carbs": baseline.get("Target_Carbs_g", baseline.get("Max_Carbs_g", 0)),
        "fat": baseline.get("Target_Fat_g", baseline.get("Max_Fat_g", 0))
    }

    # 2. ML PREDICTION
    gender_encoded = 1 if data.gender.lower() == "male" else 0
    condition_encoded = encode_condition(data.health_condition)

    X = [[data.weight_kg, data.height_cm, data.age, gender_encoded, condition_encoded]]
    prediction = model.predict(X)[0]

    ml_pred = {
        "protein": float(prediction[0]),
        "carbs": float(prediction[1]),
        "fat": float(prediction[2])
    }

    # 3. COMBINE BASELINE + ML (Averaging)
    final_target = {
        "protein": (baseline_norm["protein"] + ml_pred["protein"]) / 2,
        "carbs": (baseline_norm["carbs"] + ml_pred["carbs"]) / 2,
        "fat": (baseline_norm["fat"] + ml_pred["fat"]) / 2
    }

    # 4. DELTA CALCULATION
    delta = {
        "protein": max(0, final_target["protein"] - data.avg["protein"]),
        "carbs": max(0, final_target["carbs"] - data.avg["carbs"]),
        "fat": max(0, final_target["fat"] - data.avg["fat"])
    }

    # 5. SMART RECOMMENDATION PLAN
    smart_diet_plan = generate_smart_diet_plan(delta, final_target, data.avg, data.health_condition)

    return {
        "final_target": final_target,
        "current_avg": data.avg,
        "delta_gap": delta,
        "diet_plan": smart_diet_plan
    }

# -----------------------------
# ROOT
# -----------------------------
@app.get("/")
def home():
    return {"message": "Diet Recommendation ML API Running 🚀"}