def calculate_medical_baseline(condition, weight_kg, height_cm, age, gender):
    """
    Calculates a medically grounded nutritional baseline based on BMR (Mifflin-St Jeor) 
    and clinical dietary guidelines for specific health conditions.
    """

    # ---------------------------------------------------------
    # 1. BMR CALCULATION (Mifflin-St Jeor Equation)
    # ---------------------------------------------------------
    # This is the clinical standard for estimating Resting Energy Expenditure (REE).
    if gender.lower() == "male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    # Sedentary Activity Factor (1.2) - Adjust as needed for activity level
    calories = bmr * 1.2
    condition = condition.lower()

    # ---------------------------------------------------------
    # 2. DEFAULT MACROS (Standard Balanced Diet)
    # ---------------------------------------------------------
    # Default: 1g protein/kg, 50% Carbs, 30% Fat
    protein = weight_kg * 1.0
    carbs = (calories * 0.5) / 4
    fat = (calories * 0.3) / 9

    baseline = {
        "Target_Calories": round(calories, 2),
        "Target_Protein_g": round(protein, 2),
        "Target_Carbs_g": round(carbs, 2),
        "Target_Fat_g": round(fat, 2),

        # Clinical Flags for Recommendation Engine
        "avoid_high_sugar": False,
        "avoid_high_fat": False,
        "avoid_high_carb": False,
        "low_sodium": False,
        "low_protein": False,
        "fiber_focus": False
    }

    # ---------------------------------------------------------
    # 3. CLINICAL CONDITION ADJUSTMENTS (Certified Guidelines)
    # ---------------------------------------------------------

    # 🔹 DIABETES (ADA Guidelines)
    # Focus: Glycemic control. Restricted carbs to ~40% of intake.
    if condition == "diabetes":
        baseline.update({
            "Target_Carbs_g": (calories * 0.40) / 4,
            "Target_Protein_g": weight_kg * 1.2,
            "avoid_high_sugar": True,
            "avoid_high_carb": True,
            "fiber_focus": True
        })

    # 🔹 HYPERTENSION / BP (AHA DASH Diet Principles)
    # Focus: Sodium reduction and fat restriction (<25-27%).
    elif condition in ["bp", "hypertension"]:
        baseline.update({
            "Target_Fat_g": (calories * 0.25) / 9,
            "avoid_high_fat": True,
            "low_sodium": True
        })

    # 🔹 PCOD / PCOS (Androgen & Insulin Management)
    # Focus: Reducing insulin spikes via low carb (35%) and high protein.
    elif condition in ["pcod", "pcos"]:
        baseline.update({
            "Target_Carbs_g": (calories * 0.35) / 4,
            "Target_Protein_g": weight_kg * 1.5,
            "avoid_high_carb": True,
            "avoid_high_sugar": True
        })

    # 🔹 OBESITY (Safe Caloric Deficit)
    # Focus: 500 kcal deficit and high protein (1.2-1.5g/kg) to preserve lean mass.
    elif condition == "obesity":
        target_cals = calories - 500
        baseline.update({
            "Target_Calories": target_cals,
            "Target_Protein_g": weight_kg * 1.4,
            "Target_Carbs_g": (target_cals * 0.40) / 4,
            "avoid_high_carb": True,
            "avoid_high_fat": True
        })

    # 🔹 MUSCLE GAIN (Hypertrophy / ISSN Guidelines)
    # Focus: Anabolic surplus (+400 kcal) and high protein turnover (1.8g/kg).
    elif condition == "muscle_gain":
        target_cals = calories + 400
        baseline.update({
            "Target_Calories": target_cals,
            "Target_Protein_g": weight_kg * 1.8,
            "Target_Carbs_g": (target_cals * 0.50) / 4
        })

    # 🔹 THYROID (Hypothyroidism Management)
    # Focus: Moderate complex carbs (45%) for hormone conversion; avoiding excess saturated fats.
    elif condition == "thyroid":
        baseline.update({
            "Target_Carbs_g": (calories * 0.45) / 4,
            "Target_Protein_g": weight_kg * 1.2,
            "avoid_high_fat": True
        })

    # 🔹 CHRONIC KIDNEY DISEASE (CKD - Stage 1-4, Non-Dialysis)
    # Focus: Reducing renal workload via protein restriction (0.8g/kg).
    elif condition in ["ckd", "kidney_disease"]:
        baseline.update({
            "Target_Protein_g": weight_kg * 0.8,
            "low_protein": True,
            "low_sodium": True
        })

    # 🔹 CARDIOVASCULAR DISEASE (Heart Health / AHA)
    # Focus: Limiting saturated fats to <7% and total fat to 20%.
    elif condition in ["heart_disease", "cvd", "high_cholesterol"]:
        baseline.update({
            "Target_Fat_g": (calories * 0.20) / 9,
            "avoid_high_fat": True,
            "low_sodium": True
        })

    # 🔹 HYPERTHYROIDISM (High Metabolic Rate)
    # Focus: Massive caloric increase to prevent cachexia (muscle wasting).
    elif condition == "hyperthyroidism":
        baseline.update({
            "Target_Calories": calories * 1.4,
            "Target_Protein_g": weight_kg * 1.6
        })

    # 🔹 UNDERWEIGHT / MALNUTRITION
    # Focus: Healthy caloric surplus (+500 kcal) with balanced macros.
    elif condition == "underweight":
        target_cals = calories + 500
        baseline.update({
            "Target_Calories": target_cals,
            "Target_Protein_g": weight_kg * 1.5,
            "Target_Carbs_g": (target_cals * 0.50) / 4
        })

    # ---------------------------------------------------------
    # 4. FINAL ROUNDING & RETURN
    # ---------------------------------------------------------
    for key in ["Target_Calories", "Target_Protein_g", "Target_Carbs_g", "Target_Fat_g"]:
        baseline[key] = round(baseline[key], 2)

    return baseline