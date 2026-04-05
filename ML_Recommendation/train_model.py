import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load data
df = pd.read_csv("training_data.csv")

X = df[["weight", "height", "age", "gender", "condition"]]
y = df[["protein", "carbs", "fat"]]

# Train model
model = RandomForestRegressor()
model.fit(X, y)

# Save model
joblib.dump(model, "diet_model.pkl")

print("Model trained and saved!")