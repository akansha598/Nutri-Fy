import pandas as pd
import random
from baseline import calculate_medical_baseline

data = []

conditions = ["diabetes", "pcod", "hypertension", "obesity", "healthy"]

for _ in range(500):   # generate 500 samples
    weight = random.randint(50, 90)
    height = random.randint(150, 180)
    age = random.randint(18, 60)
    gender = random.choice(["male", "female"])
    condition = random.choice(conditions)

    baseline = calculate_medical_baseline(condition, weight, height, age, gender)

    data.append({
        "weight": weight,
        "height": height,
        "age": age,
        "gender": 1 if gender == "male" else 0,
        "condition": conditions.index(condition),

        "protein": baseline.get("Target_Protein_g", baseline.get("Max_Protein_g", 0)),
        "carbs": baseline.get("Target_Carbs_g", baseline.get("Max_Carbs_g", 0)),
        "fat": baseline.get("Target_Fat_g", baseline.get("Max_Fat_g", 0))
    })

df = pd.DataFrame(data)
df.to_csv("training_data.csv", index=False)

print("Dataset created!")