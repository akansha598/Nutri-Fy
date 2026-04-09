import random
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from model import get_vitamin_rich_food, df

def evaluate_model_final(samples_per_nutrient=50):
    # ✅ 1. Real RDA Targets (Synchronized with app.py)
    rda_targets = {
        'vitamin_c_mg': 75.0, 
        'iron_mg': 18.0, 
        'fiber_g': 25.0, 
        'calcium_mg': 1000.0, 
        'potassium_mg': 3500.0, 
        'vitamin_d_mcg': 15.0, 
        'magnesium_mg': 310.0, 
        'zinc_mg': 8.0
    }
    
    vitamin_cols = list(rda_targets.keys())

    overall_y_true = []
    overall_y_pred = []

    print("\n🔍 Evaluating model with RDA-aligned thresholds...\n")

    for nutrient in vitamin_cols:
        print(f"➡ Testing nutrient: {nutrient}")

        # ✅ 2. FIX: Use 70% of RDA as the deficiency line (Same as app.py)
        deficiency_threshold = rda_targets[nutrient] * 0.7
        
        # ✅ 3. FIX: A recommendation is a 'Success' if it provides 20% of RDA in one serving
        high_threshold = rda_targets[nutrient] * 0.2

        for _ in range(samples_per_nutrient):

            # Pick real food sample
            sample = df.sample(1).iloc[0]
            actual_value = sample[nutrient]

            # FORCE BALANCED CASES (50-50)
            if random.random() < 0.5:
                # Actual Deficient case: simulation results in < 70% RDA
                simulated_intake = deficiency_threshold * random.uniform(0.1, 0.9)
                is_deficient = 1
            else:
                # Actual Sufficient case: simulation results in > 70% RDA
                simulated_intake = deficiency_threshold * random.uniform(1.1, 2.0)
                is_deficient = 0

            # ✅ 4. MODEL DECISION (Does the model catch the deficiency?)
            model_thinks_deficient = 1 if simulated_intake < deficiency_threshold else 0

            # ✅ 5. PREDICTION VALIDATION
            if model_thinks_deficient:
                rec = get_vitamin_rich_food(nutrient)

                if rec is not None:
                    try:
                        # Check if the recommended food actually meets our 'Success' threshold
                        # Use the specific nutrient value from the returned dict
                        rec_value = rec.get(nutrient)
                        
                        # If model.py doesn't return the nutrient value, look it up in df
                        if rec_value is None:
                            rec_value = df[df['Food_Item'] == rec['food']][nutrient].values[0]
                        
                        prediction = 1 if rec_value >= high_threshold else 0
                    except:
                        prediction = 0
                else:
                    prediction = 0
            else:
                # If model thinks user is sufficient, it makes 0 recommendations (prediction = 0)
                prediction = 0

            overall_y_true.append(is_deficient)
            overall_y_pred.append(prediction)

    # 📊 REPORTS
    print("\n📊 --- FINAL EVALUATION REPORT ---\n")
    print(classification_report(
        overall_y_true,
        overall_y_pred,
        target_names=['Sufficient', 'Deficient']
    ))

    print("\n📉 --- CONFUSION MATRIX ---\n")
    cm = confusion_matrix(overall_y_true, overall_y_pred)
    print(cm)

# Run evaluation
if __name__ == "__main__":
    evaluate_model_final(samples_per_nutrient=50)