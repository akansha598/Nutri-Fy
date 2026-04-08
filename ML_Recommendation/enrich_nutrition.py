import pandas as pd
import requests
import time

# 1. Configuration
API_KEY = "Lta2m54lMWHbahwLHZri8kxjwGVaAsGBTeUHpUMO" 
BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
INPUT_FILE = "updated_food_nutrition.csv" # Your clean source
OUTPUT_FILE = "detailed_food_nutrition.csv" # Fresh output

# 2. Load your current dataset
try:
    df = pd.read_csv(INPUT_FILE)
    print(f"Successfully loaded {len(df)} rows from {INPUT_FILE}")
except FileNotFoundError:
    print(f"Error: {INPUT_FILE} not found. Ensure the file is in the same folder.")
    exit()

# 3. Define the new columns to add
new_columns = [
    'fiber_g', 'sugar_g', 'calcium_mg', 'iron_mg', 'magnesium_mg', 
    'phosphorus_mg', 'potassium_mg', 'sodium_mg_detailed', 'zinc_mg', 
    'vitamin_a_mcg', 'vitamin_b1_mg', 'vitamin_b2_mg', 'vitamin_b3_mg', 
    'vitamin_b6_mg', 'vitamin_b12_mcg', 'vitamin_c_mg', 'vitamin_d_mcg', 
    'vitamin_e_mg', 'vitamin_k_mcg', 'folate_mcg', 'saturated_fat_g', 
    'monounsaturated_fat_g', 'polyunsaturated_fat_g', 'trans_fat_g', 
    'cholesterol_mg_detailed', 'omega_3_g', 'omega_6_g'
]

# Initialize new columns with 0.0 to ensure a fresh start
for col in new_columns:
    df[col] = 0.0

def get_usda_data(food_name):
    """Fetches nutrient data without dataType restrictions for maximum matches."""
    params = {
        'api_key': API_KEY,
        'query': food_name,
        'pageSize': 1
        # ✅ 'dataType' is removed here to allow "Aggressive" searching across all USDA categories
    }
    
    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('foods'):
                return data['foods'][0]['foodNutrients']
        return None
    except Exception as e:
        print(f"Request error for {food_name}: {e}")
        return None

# 4. Iterate and Fetch
print("Starting Option 1 Enrichment. Overwriting old data with new aggressive search results...")

for index, row in df.iterrows():
    # Clean the food name (removes brackets like "(100g)")
    food_query = str(row['Food_Item']).split('(')[0].strip()
    
    # Safety check for Weight_per_Unit_g to avoid division by zero
    try:
        weight = float(row.get('Weight_per_Unit_g', 100))
        weight_factor = weight / 100.0 if weight > 0 else 1.0
    except:
        weight_factor = 1.0

    nutrients = get_usda_data(food_query)
    
    if nutrients:
        for n in nutrients:
            name = n.get('nutrientName', '').lower()
            val = n.get('value', 0) * weight_factor
            
            # Detailed Mapping Logic
            if 'fiber, total dietary' in name: df.at[index, 'fiber_g'] = val
            elif 'sugars, total' in name: df.at[index, 'sugar_g'] = val
            elif 'calcium, ca' in name: df.at[index, 'calcium_mg'] = val
            elif 'iron, fe' in name: df.at[index, 'iron_mg'] = val
            elif 'magnesium, mg' in name: df.at[index, 'magnesium_mg'] = val
            elif 'phosphorus, p' in name: df.at[index, 'phosphorus_mg'] = val
            elif 'potassium, k' in name: df.at[index, 'potassium_mg'] = val
            elif 'sodium, na' in name: df.at[index, 'sodium_mg_detailed'] = val
            elif 'zinc, zn' in name: df.at[index, 'zinc_mg'] = val
            elif 'vitamin a, rae' in name: df.at[index, 'vitamin_a_mcg'] = val
            elif 'thiamin' in name: df.at[index, 'vitamin_b1_mg'] = val
            elif 'riboflavin' in name: df.at[index, 'vitamin_b2_mg'] = val
            elif 'niacin' in name: df.at[index, 'vitamin_b3_mg'] = val
            elif 'vitamin b-6' in name: df.at[index, 'vitamin_b6_mg'] = val
            elif 'vitamin b-12' in name: df.at[index, 'vitamin_b12_mcg'] = val
            elif 'vitamin c, total ascorbic acid' in name: df.at[index, 'vitamin_c_mg'] = val
            elif 'vitamin d (d2 + d3)' in name: df.at[index, 'vitamin_d_mcg'] = val
            elif 'vitamin e (alpha-tocopherol)' in name: df.at[index, 'vitamin_e_mg'] = val
            elif 'vitamin k (phylloquinone)' in name: df.at[index, 'vitamin_k_mcg'] = val
            elif 'folate, total' in name: df.at[index, 'folate_mcg'] = val
            elif 'fatty acids, total saturated' in name: df.at[index, 'saturated_fat_g'] = val
            elif 'fatty acids, total monounsaturated' in name: df.at[index, 'monounsaturated_fat_g'] = val
            elif 'fatty acids, total polyunsaturated' in name: df.at[index, 'polyunsaturated_fat_g'] = val
            elif 'fatty acids, total trans' in name: df.at[index, 'trans_fat_g'] = val
            elif 'cholesterol' in name: df.at[index, 'cholesterol_mg_detailed'] = val
            elif '18:3 n-3 c,c,c (ala)' in name: df.at[index, 'omega_3_g'] = val
            elif '18:2 n-6 c,c' in name: df.at[index, 'omega_6_g'] = val

        print(f"[{index+1}/{len(df)}] Enriched: {food_query}")
    else:
        print(f"[{index+1}/{len(df)}] No data found for: {food_query}")

    # Rate limiting: 0.6s delay = ~1,000 requests/hour
    time.sleep(0.6) 

# 5. Save the final file
df.to_csv(OUTPUT_FILE, index=False)
print("-" * 30)
print(f"Option 1 Finished! New file saved as: {OUTPUT_FILE}")