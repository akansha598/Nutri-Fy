import pandas as pd
import random # ✅ Added for variety
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("detailed_food_nutrition.csv", on_bad_lines='skip')

# KNN Setup
X = df[["Protein (g)", "Carbohydrates (g)", "Fat (g)"]]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
knn_model = NearestNeighbors(n_neighbors=10)
knn_model.fit(X_scaled)

def recommend_food(delta):
    """Finds the top 3 unique items for the macro gap."""
    query = [[delta["protein"], delta["carbs"], delta["fat"]]]
    query_scaled = scaler.transform(query)
    distances, indices = knn_model.kneighbors(query_scaled, n_neighbors=5)
    
    results = df.iloc[indices[0]]
    suggestions = []
    for _, row in results.iterrows():
        suggestions.append({
            "food": row["Food_Item"],
            "protein": float(row["Protein (g)"]),
            "carbs": float(row["Carbohydrates (g)"]),
            "fat": float(row["Fat (g)"])
        })
    # Return top 5 to give app.py more variety to pick from
    return suggestions

# --- Update get_vitamin_rich_food in model.py ---

def get_vitamin_rich_food(nutrient_column):
    """Finds a top-tier item specifically high in the missing nutrient."""
    if nutrient_column not in df.columns:
        return None
    
    # 1. PRE-FILTER: Only look at foods that are in the TOP 20% for this nutrient
    # This prevents the model from recommending "Low-Vitamin" items
    threshold = df[nutrient_column].quantile(0.8)
    viable_foods = df[df[nutrient_column] >= threshold]

    # 2. If no foods meet the 80th percentile (rare), fallback to top 5
    if viable_foods.empty:
        viable_foods = df.sort_values(by=nutrient_column, ascending=False).head(5)

    # 3. Sample from the viable pool to keep the diet plan interesting
    selected = viable_foods.sample(1).iloc[0] 
    
    return {
        "food": selected["Food_Item"],
        "protein": float(selected["Protein (g)"]),
        "carbs": float(selected["Carbohydrates (g)"]),
        "fat": float(selected["Fat (g)"]),
        # Add the specific nutrient value so the test script can verify it
        nutrient_column: float(selected[nutrient_column]) 
    }