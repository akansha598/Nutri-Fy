import random
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from model import get_vitamin_rich_food, df


def evaluate_model_final(samples_per_nutrient=50):
    vitamin_cols = [
        'vitamin_c_mg', 'iron_mg', 'fiber_g', 'calcium_mg',
        'potassium_mg', 'vitamin_d_mcg', 'magnesium_mg', 'zinc_mg'
    ]

    overall_y_true = []
    overall_y_pred = []

    print("\n🔍 Evaluating model with balanced + realistic data...\n")

    for nutrient in vitamin_cols:
        print(f"➡ Testing nutrient: {nutrient}")

        # ✅ Use the Median as the "Line in the sand"
        deficiency_threshold = df[nutrient].median()
        # ✅ A food is a "Success" if it's above the 60th percentile
        high_threshold = df[nutrient].quantile(0.6)

        for _ in range(samples_per_nutrient):

            # ✅ Pick real food sample
            sample = df.sample(1).iloc[0]
            actual_value = sample[nutrient]

            # ✅ FORCE BALANCED CASES (50-50)
            if random.random() < 0.5:
                # Deficient case
                simulated_intake = actual_value * random.uniform(0.1, 0.5)
                is_deficient = 1
            else:
                # Sufficient case
                simulated_intake = actual_value * random.uniform(0.8, 1.5)
                is_deficient = 0

            # ✅ MODEL DECISION (what model thinks)
            model_thinks_deficient = 1 if simulated_intake < deficiency_threshold else 0

            # ✅ FINAL PREDICTION
            if model_thinks_deficient:
                rec = get_vitamin_rich_food(nutrient)

                if rec is not None:
                    try:
                        rec_value = df[df['Food_Item'] == rec['food']][nutrient].values[0]
                        prediction = 1 if rec_value >= high_threshold else 0
                    except:
                        prediction = 0
                else:
                    prediction = 0
            else:
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