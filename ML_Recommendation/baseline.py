def calculate_medical_baseline(condition, weight_kg, height_cm, age, gender):

    # -------------------------------
    # 1. BMR (Mifflin-St Jeor - better)
    # -------------------------------
    if gender.lower() == "male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    calories = bmr * 1.2
    condition = condition.lower()

    # -------------------------------
    # 2. BASE MACROS (balanced)
    # -------------------------------
    protein = weight_kg * 1.0
    carbs = (calories * 0.5) / 4
    fat = (calories * 0.3) / 9

    baseline = {
        "Target_Calories": calories,
        "Target_Protein_g": protein,
        "Target_Carbs_g": carbs,
        "Target_Fat_g": fat,

        # 🔥 These will influence recommendation logic
        "avoid_high_sugar": False,
        "avoid_high_fat": False,
        "avoid_high_carb": False
    }

    # -------------------------------
    # 3. STRONG CONDITION EFFECTS
    # -------------------------------

    # 🔹 Diabetes
    if condition == "diabetes":
        baseline.update({
            "Target_Carbs_g": 120,   # strict control
            "Target_Protein_g": weight_kg * 1.3,
            "Target_Fat_g": (calories * 0.35) / 9,
            "avoid_high_sugar": True,
            "avoid_high_carb": True
        })

    # 🔹 BP
    elif condition in ["bp", "hypertension"]:
        baseline.update({
            "Target_Fat_g": (calories * 0.25) / 9,
            "avoid_high_fat": True
        })

    # 🔹 PCOD
    elif condition in ["pcod", "pcos"]:
        baseline.update({
            "Target_Carbs_g": 130,
            "Target_Protein_g": weight_kg * 1.5,
            "Target_Fat_g": (calories * 0.25) / 9,
            "avoid_high_carb": True,
            "avoid_high_sugar": True
        })

    # 🔹 Obesity
    elif condition == "obesity":
        baseline.update({
            "Target_Calories": calories - 500,
            "Target_Protein_g": weight_kg * 1.6,
            "Target_Carbs_g": (calories * 0.35) / 4,
            "avoid_high_carb": True,
            "avoid_high_fat": True
        })

    # 🔹 Muscle Gain
    elif condition == "muscle_gain":
        baseline.update({
            "Target_Calories": calories + 300,
            "Target_Protein_g": weight_kg * 1.8,
            "Target_Carbs_g": (calories * 0.5) / 4
        })

    # 🔹 Thyroid
    elif condition == "thyroid":
        baseline.update({
            "Target_Carbs_g": (calories * 0.45) / 4,
            "avoid_high_fat": True
        })

    # -------------------------------
    # 4. RETURN
    # -------------------------------
    return baseline