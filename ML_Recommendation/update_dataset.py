import pandas as pd
import re

# 1. Load your dataset
# Change line 5 to this:
df = pd.read_csv("daily_food_nutrition_dataset.csv", on_bad_lines='skip')
# 2. Define standard conversion factors (approximate grams)
conversions = {
    "cup": 240,
    "oz": 28.35,
    "can": 350,
    "slice": 40,
    "tbsp": 15,
    "medium": 150,
    "large": 200,
    "scoop": 30,
    "link": 45,
    "patty": 100,
    "packet": 35
}

def extract_weight(item_name):
    item_name = item_name.lower()
    
    # Check for "oz" patterns (e.g., 6oz, 4 oz)
    oz_match = re.search(r'(\d+(\.\d+)?)\s?oz', item_name)
    if oz_match:
        return round(float(oz_match.group(1)) * conversions["oz"], 1)
    
    # Check for "cup" patterns (e.g., 1 cup, 1/2 cup)
    if "1/2 cup" in item_name: return conversions["cup"] / 2
    if "1/4 cup" in item_name: return conversions["cup"] / 4
    if "1 cup" in item_name: return conversions["cup"]

    # Check for other keywords
    for key, value in conversions.items():
        if key in item_name:
            return value
            
    # Default fallback if no unit is found
    return 100.0 

# 3. Create the new columns
df['Weight_per_Unit_g'] = df['Food_Item'].apply(extract_weight)

# 4. Save the updated dataset
df.to_csv("updated_food_nutrition.csv", index=False)
print("Updated dataset saved with 'Weight_per_Unit_g' column!")