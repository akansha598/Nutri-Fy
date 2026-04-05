from fastapi import FastAPI
from pydantic import BaseModel
from baseline import calculate_medical_baseline
from model import recommend_food

app = FastAPI()

class InputData(BaseModel):
    health_condition: str
    weight_kg: float
    height_cm: float
    age: int
    gender: str
    avg: dict


@app.post("/recommend")
def get_recommendation(data: InputData):

    baseline = calculate_medical_baseline(
        data.health_condition,
        data.weight_kg,
        data.height_cm,
        data.age,
        data.gender
    )

    baseline_norm = {
        "protein": baseline.get("Target_Protein_g", baseline.get("Max_Protein_g", 0)),
        "carbs": baseline.get("Target_Carbs_g", baseline.get("Max_Carbs_g", 0)),
        "fat": baseline.get("Target_Fat_g", baseline.get("Max_Fat_g", 0))
    }

    delta = {
        "protein": max(0, baseline_norm["protein"] - data.avg["protein"]),
        "carbs": max(0, baseline_norm["carbs"] - data.avg["carbs"]),
        "fat": max(0, baseline_norm["fat"] - data.avg["fat"])
    }

    recommendation = recommend_food(delta)

    return {
        "baseline": baseline_norm,
        "avg": data.avg,
        "delta": delta,
        "recommendation": recommendation
    }