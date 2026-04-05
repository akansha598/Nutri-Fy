import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

# ✅ Load dataset (handle errors safely)
df = pd.read_csv("updated_food_nutrition.csv", on_bad_lines='skip')

# ✅ Select features for KNN
X = df[["Protein (g)", "Carbohydrates (g)", "Fat (g)"]]

# ✅ Normalize features so high-carb items don't dominate the distance calculation
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ✅ KNN model (Looking for top neighbors)
model = NearestNeighbors(n_neighbors=5)
model.fit(X_scaled)

# ----------------------------------
# 🔥 UPDATED RECOMMENDATION FUNCTION
# ----------------------------------
def recommend_food(delta):
    """
    Finds the 3 best food items to fill the nutritional gap (delta).
    Returns a LIST of 3 dictionaries.
    """
    # 1. Transform the delta (gap) into the same scaled space as the dataset
    query = [[delta["protein"], delta["carbs"], delta["fat"]]]
    query_scaled = scaler.transform(query)

    # 2. Find the 3 nearest neighbors
    distances, indices = model.kneighbors(query_scaled, n_neighbors=3)

    # 3. Extract the rows from the dataframe
    results = df.iloc[indices[0]]

    # 4. Prepare the list of 3 suggestions
    suggestions = []
    for _, row in results.iterrows():
        suggestions.append({
            "food": row["Food_Item"],
            "protein": float(row["Protein (g)"]),
            "carbs": float(row["Carbohydrates (g)"]),
            "fat": float(row["Fat (g)"])
        })

    # Optional Debugging
    print(f"DEBUG: Found {len(suggestions)} items for delta {delta}")

    return suggestions