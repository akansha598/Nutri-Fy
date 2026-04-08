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

def get_vitamin_rich_food(nutrient_column):
    """Finds a top-5 item for a vitamin to ensure variety."""
    if nutrient_column not in df.columns:
        return None
    
    # ✅ Pick from the top 5 highest instead of just the #1 item
    top_items = df.sort_values(by=nutrient_column, ascending=False).head(5)
    selected = top_items.sample(1).iloc[0] 
    
    return {
        "food": selected["Food_Item"],
        "protein": float(selected["Protein (g)"]),
        "carbs": float(selected["Carbohydrates (g)"]),
        "fat": float(selected["Fat (g)"])
    }