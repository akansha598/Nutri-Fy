def calculate_medical_baseline(health_condition, weight_kg, height_cm, age, gender):
    
    # -------------------------------
    # 1. BMR Calculation (Harris-Benedict)
    # -------------------------------
    if gender.lower() == 'male':
        bmr = 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age)
    
    maintenance_calories = bmr * 1.2  # sedentary assumption

    condition = health_condition.lower()

    # -------------------------------
    # 2. DEFAULT (fallback)
    # -------------------------------
    baseline = {
        "Target_Calories": maintenance_calories,
        "Target_Protein_g": weight_kg * 0.8,
        "Target_Carbs_g": (maintenance_calories * 0.5) / 4,
        "Target_Fat_g": (maintenance_calories * 0.3) / 9
    }

    # -------------------------------
    # 3. DISEASE-SPECIFIC RULES
    # -------------------------------

    # 🔹 Diabetes
    if condition == "diabetes":
        baseline.update({
            "Max_Carbs_g": 130,
            "Target_Protein_g": weight_kg * 1.2,
            "Target_Fat_g": (maintenance_calories * 0.35) / 9,
            "Max_Sugar_g": 25,
            "Target_Fiber_g": 30
        })

    # 🔹 Hypertension / BP
    elif condition in ["bp", "hypertension"]:
        baseline.update({
            "Target_Protein_g": weight_kg * 1.0,
            "Target_Fat_g": (maintenance_calories * 0.25) / 9,
            "Max_Sodium_mg": 1500
        })

    # 🔹 PCOD / PCOS
    elif condition in ["pcod", "pcos"]:
        baseline.update({
            "Target_Calories": maintenance_calories - 300,
            "Max_Carbs_g": 150,
            "Target_Protein_g": weight_kg * 1.5,
            "Target_Fat_g": (maintenance_calories * 0.25) / 9,
            "Max_Sugar_g": 20
        })

    # 🔹 Heart Disease / CVD
    elif condition in ["heart_disease", "cvd"]:
        baseline.update({
            "Target_Protein_g": weight_kg * 1.0,
            "Target_Fat_g": (maintenance_calories * 0.25) / 9,
            "Max_Saturated_Fat_g": 10,
            "Max_Trans_Fat_g": 0,
            "Target_Fiber_g": 35,
            "Max_Sodium_mg": 2000
        })

    # 🔹 Chronic Kidney Disease (CKD)
    elif condition == "ckd":
        baseline.update({
            "Max_Protein_g": weight_kg * 0.6,
            "Target_Carbs_g": (maintenance_calories * 0.6) / 4,
            "Target_Fat_g": (maintenance_calories * 0.25) / 9,
            "Max_Potassium_mg": 2000,
            "Max_Sodium_mg": 2000
        })

    # 🔹 Fatty Liver (NAFLD)
    elif condition in ["fatty_liver", "nafld"]:
        baseline.update({
            "Target_Calories": maintenance_calories - 500,
            "Max_Sugar_g": 15,
            "Target_Protein_g": weight_kg * 1.2,
            "Target_Fat_g": (maintenance_calories * 0.25) / 9
        })

    # 🔹 Obesity
    elif condition == "obesity":
        baseline.update({
            "Target_Calories": maintenance_calories - 500,
            "Target_Protein_g": weight_kg * 1.6,
            "Target_Carbs_g": (maintenance_calories * 0.4) / 4,
            "Target_Fat_g": (maintenance_calories * 0.25) / 9,
            "Target_Fiber_g": 35
        })

    # 🔹 Anemia
    elif condition == "anemia":
        baseline.update({
            "Target_Protein_g": weight_kg * 1.0,
            "Target_Fat_g": (maintenance_calories * 0.3) / 9,
            "Target_Iron_mg": 18,
            "Target_Vitamin_C_mg": 90
        })

    # 🔹 Osteoporosis
    elif condition == "osteoporosis":
        baseline.update({
            "Target_Protein_g": weight_kg * 1.0,
            "Target_Fat_g": (maintenance_calories * 0.3) / 9,
            "Target_Calcium_mg": 1200,
            "Target_Vitamin_D_mcg": 20
        })

    # 🔹 GERD / Acid Reflux
    elif condition in ["gerd", "acid_reflux"]:
        baseline.update({
            "Max_Fat_g": 40,
            "Target_Protein_g": weight_kg * 1.0,
            "Avoid_Spicy": True
        })

    # 🔹 Thyroid (Hypothyroidism)
    elif condition == "thyroid":
        baseline.update({
            "Target_Protein_g": weight_kg * 1.2,
            "Target_Carbs_g": (maintenance_calories * 0.45) / 4,
            "Target_Fat_g": (maintenance_calories * 0.3) / 9,
            "Target_Iodine_mcg": 150
        })

    # 🔹 Gym / Muscle Gain (Bonus 💪)
    elif condition == "muscle_gain":
        baseline.update({
            "Target_Calories": maintenance_calories + 300,
            "Target_Protein_g": weight_kg * 1.8,
            "Target_Carbs_g": (maintenance_calories * 0.5) / 4,
            "Target_Fat_g": (maintenance_calories * 0.25) / 9
        })

    # -------------------------------
    # 4. RETURN
    # -------------------------------
    return baseline


# ✅ Safe testing (won’t run during import)
if __name__ == "__main__":
    print("PCOD:", calculate_medical_baseline("pcod", 65, 160, 24, "female"))
    print("Diabetes:", calculate_medical_baseline("diabetes", 70, 170, 30, "male"))
    print("Muscle Gain:", calculate_medical_baseline("muscle_gain", 75, 175, 25, "male"))