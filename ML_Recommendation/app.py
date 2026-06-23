from fastapi import FastAPI
from pydantic import BaseModel
from baseline import calculate_medical_baseline
from model import recommend_food, get_vitamin_rich_food 
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

# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def encode_condition(condition):
    conditions = [
        "diabetes", "pcod", "pcos", "hypertension", "bp", 
        "obesity", "muscle_gain", "thyroid", "ckd", 
        "kidney_disease", "heart_disease", "cvd", 
        "high_cholesterol", "hyperthyroidism", "underweight", "healthy"
    ]
    cond_lower = condition.lower()
    return conditions.index(cond_lower) if cond_lower in conditions else conditions.index("healthy")

def generate_smart_diet_plan(delta, final_target, current_avg, condition):
    """
    Constructs a structured meal plan using Health Tips to justify Macro Targets.
    """
    # 1. Define Real RDA Targets (Daily requirements)
    rda_targets = {
        'vitamin_c_mg': 75.0,
        'iron_mg': 18.0,
        'fiber_g': 25.0,
        'calcium_mg': 1000.0,
        'potassium_mg': 3500.0,
        'vitamin_d_mcg': 15.0,
        'magnesium_mg': 310.0,
        'zinc_mg': 8.0,

        # Added vitamins
        'vitamin_a_mcg': 900.0,
        'vitamin_b1_mg': 1.2,
        'vitamin_b2_mg': 1.3,
        'vitamin_b3_mg': 16.0,
        'vitamin_b6_mg': 1.3,
        'vitamin_b12_mcg': 2.4,
        'vitamin_e_mg': 15.0,
        'vitamin_k_mcg': 120.0,
        'folate_mcg': 400.0,

        # Optional advanced
        'protein_g': 50.0,
        'omega_3_g': 1.6
    }

    # 2. Trigger deficiency if user is below 70% of the RDA
    # This provides a 'Buffer Zone' to improve Precision/Recall balance
    missing_nutrients = [
        col for col, target in rda_targets.items() 
        if current_avg.get(col, 0) < (target * 0.7)
    ]

    # Fallback if the user is eating perfectly (to keep recommendations variety)
    if not missing_nutrients:
        missing_nutrients = ["fiber_g", "vitamin_c_mg", "iron_mg", "calcium_mg"]

    # 2. Medical Condition Tips Database
    tips = {
        "diabetes": "Focus on low-glycemic, high-fiber carbs to stabilize blood sugar levels.",
        "pcod": "Prioritize lean proteins and anti-inflammatory healthy fats to balance hormones.",
        "pcos": "Prioritize lean proteins and anti-inflammatory healthy fats to balance hormones.",
        "hypertension": "Keep sodium low and prioritize potassium-rich vegetables.",
        "bp": "Keep sodium low and prioritize potassium-rich vegetables.",
        "obesity": "Incorporate high-volume, low-calorie foods to improve satiety.",
        "muscle_gain": "Ensure high protein intake for muscle repair and growth.",
        "thyroid": "Include complex carbohydrates to support thyroid hormone conversion.",
        "ckd": "Strictly monitor protein intake to reduce workload on the kidneys.",
        "kidney_disease": "Strictly monitor protein intake to reduce workload on the kidneys.",
        "heart_disease": "Limit saturated fats and sodium to protect cardiovascular health.",
        "cvd": "Limit saturated fats and sodium to protect cardiovascular health.",
        "high_cholesterol": "Increase soluble fiber and limit trans fats.",
        "hyperthyroidism": "Increase caloric and protein intake to prevent muscle wasting.",
        "underweight": "Focus on nutrient-dense, calorie-rich foods.",
        "healthy": "Maintain a diverse intake of whole grains and lean proteins."
    }
    
    current_tip = tips.get(condition.lower(), "Maintain a balanced diet of whole foods.")

    # 3. Fetch Macro suggestions
    macro_pool = recommend_food(delta)

    def create_meal_set(meal_name, macro_index, vit_indices):
        # Select single macro item
        macro_item = macro_pool[macro_index % len(macro_pool)]
        
        # Select unique vitamin boosters
        vit_1_col = missing_nutrients[vit_indices[0] % len(missing_nutrients)]
        vit_2_col = missing_nutrients[vit_indices[1] % len(missing_nutrients)]
        
        vit_item_1 = get_vitamin_rich_food(vit_1_col)
        vit_item_2 = get_vitamin_rich_food(vit_2_col)

        return {
            "meal": meal_name,
            "items": [
                {
                    "type": "Macro Target", 
                    "reason": f"Chosen because: {current_tip}", # ✅ Tip injected here
                    "details": macro_item
                },
                {
                    "type": "Nutrient Boost", 
                    "reason": f"Selected to fix deficiency in {vit_1_col.replace('_', ' ')}",
                    "details": vit_item_1
                },
                {
                    "type": "Nutrient Boost", 
                    "reason": f"Selected to fix deficiency in {vit_2_col.replace('_', ' ')}",
                    "details": vit_item_2
                }
            ]
        }

    # 4. Final Plan Construction
    plan = {
        "overall_health_strategy": current_tip,
        "vitamin_gap_warning": f"Detected low intake in: {', '.join([v.replace('_', ' ') for v in missing_nutrients[:4]])}",
        "daily_plan": {
            "breakfast": create_meal_set("Breakfast", 0, [0, 1]),
            "lunch": create_meal_set("Lunch", 1, [2, 3]),
            "dinner": create_meal_set("Dinner", 2, [4, 5])
        }
    }
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
        "protein": baseline.get("Target_Protein_g", 0),
        "carbs": baseline.get("Target_Carbs_g", 0),
        "fat": baseline.get("Target_Fat_g", 0)
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

    # 3. COMBINE BASELINE + ML
    final_target = {
        "protein": (baseline_norm["protein"] + ml_pred["protein"]) / 2,
        "carbs": (baseline_norm["carbs"] + ml_pred["carbs"]) / 2,
        "fat": (baseline_norm["fat"] + ml_pred["fat"]) / 2
    }

    # 4. DELTA CALCULATION
    delta = {
        "protein": max(0, final_target["protein"] - data.avg.get("Protein (g)", 0)),
        "carbs": max(0, final_target["carbs"] - data.avg.get("Carbohydrates (g)", 0)),
        "fat": max(0, final_target["fat"] - data.avg.get("Fat (g)", 0))
    }

    # 5. SMART RECOMMENDATION PLAN
    smart_diet_plan = generate_smart_diet_plan(delta, final_target, data.avg, data.health_condition)

    return {
        "final_target": final_target,
        "current_avg": data.avg,
        "delta_gap": delta,
        "diet_plan": smart_diet_plan
    }

@app.get("/")
def home():
    return {"message": "Diet Recommendation ML API Running 🚀"}