import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import os

# ✅ Get correct path (now CSV is in same folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "daily_food_nutrition_dataset.csv")

# ✅ Load dataset safely
df = pd.read_csv(DATA_PATH, engine='python', on_bad_lines='skip')

# ✅ Select required columns
df = df[["Food_Item", "Protein (g)", "Carbohydrates (g)", "Fat (g)"]]

# ✅ Remove missing values
df = df.dropna()

# Features
X = df[["Protein (g)", "Carbohydrates (g)", "Fat (g)"]]

# ✅ Normalize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ✅ Train model
model = NearestNeighbors(n_neighbors=1)
model.fit(X_scaled)


def recommend_food(delta):
    query = [[delta["protein"], delta["carbs"], delta["fat"]]]

    # Scale query
    query_scaled = scaler.transform(query)

    distances, indices = model.kneighbors(query_scaled)

    result = df.iloc[indices[0][0]]

    return {
        "food": result["Food_Item"],
        "protein": float(result["Protein (g)"]),
        "carbs": float(result["Carbohydrates (g)"]),
        "fat": float(result["Fat (g)"])
    }