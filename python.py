import streamlit as st

# MUST be first Streamlit command
st.set_page_config(page_title="FOOD IMAGE SCANNING")

import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
import numpy as np
import json
import tensorflow as tf
from calorie_db import get_nutrition, food_exists, get_all_foods

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# ==================== ML Model Loading (Cached) ====================

@st.cache_resource
def load_ml_model():
    """Load the trained food classification model."""
    try:
        if os.path.exists("food_model.h5"):
            model = tf.keras.models.load_model("food_model.h5")
            return model
        else:
            return None
    except Exception as e:
        st.error(f"❌ Error loading ML model: {e}")
        return None


@st.cache_resource
def load_class_names():
    """Load the class names mapping."""
    try:
        if os.path.exists("class_names.json"):
            with open("class_names.json", "r") as f:
                class_names = json.load(f)
                # Convert string keys to integers for compatibility
                return {int(k): v for k, v in class_names.items()}
        else:
            return None
    except Exception as e:
        st.error(f"❌ Error loading class names: {e}")
        return None


# ==================== ML Prediction ====================

def predict_food_ml(image, model, class_names):
    """
    Predict food item using ML model.
    Returns: (predicted_class, confidence_score)
    """
    try:
        # Preprocess image
        img_array = np.array(image.resize((224, 224))) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)
        predicted_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_idx]) * 100
        predicted_class = class_names.get(predicted_idx, "Unknown")
        
        return predicted_class, confidence
    except Exception as e:
        st.error(f"❌ Error during ML prediction: {e}")
        return None, 0


# ==================== Gemini Fallback ====================

def get_gemini_response(input_prompt, image):
    """Get nutrition analysis from Gemini AI."""
    try:
        if not GEMINI_API_KEY:
            st.error("❌ Gemini API key not found. Please set GEMINI_API_KEY in .env")
            return None
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([input_prompt, image])
        return response.text
    except Exception as e:
        st.error(f"❌ Gemini API Error: {e}")
        return None


# ==================== Image Processing ====================

def input_image_setup(uploaded_file):
    """Convert uploaded file to format for Gemini."""
    if uploaded_file is not None:
        bytes_data = uploaded_file.getvalue()
        image_parts = [{
            "mime_type": uploaded_file.type,
            "data": bytes_data
        }]
        return image_parts
    return None


# ==================== Nutrition Display ====================

def display_nutrition_from_db(food_name, source="ML"):
    """Display nutrition information from calorie database."""
    nutrition = get_nutrition(food_name)
    
    if nutrition:
        st.success(f"✅ **Data Source:** {source} Model")
        st.markdown("---")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Calories", f"{nutrition['calories']} kcal")
            st.metric("Protein", f"{nutrition['protein']}g")
            st.metric("Carbs", f"{nutrition['carbs']}g")
            st.metric("Fat", f"{nutrition['fat']}g")
        
        with col2:
            st.metric("Fiber", f"{nutrition['fiber']}g")
            st.metric("Sugar", f"{nutrition['sugar']}g")
            st.write(f"**Serving Size:** {nutrition['serving_size']}")
            st.write(f"**Description:** {nutrition['description']}")
        
        return True
    return False


# ==================== Main UI ====================

st.title("🥗 Food Image - AI Scanning")

st.markdown(
    "<h4 style='color: gray; font-weight: normal;'>"
    "</h4>",
    unsafe_allow_html=True
)

# Check if models are available
model = load_ml_model()
class_names = load_class_names()

if model is None or class_names is None:
    st.warning(
        "⚠️ **Models not found!**\n\n"
        "To use the ML model:\n"
        "1. Download the Kaggle Indian Food Images Dataset\n"
        "2. Extract it to `dataset/Indian Food Images/`\n"
        "3. Run: `python train_model.py`\n\n"
        "You can still use the Gemini-only fallback below."
    )

st.markdown("---")

# File uploader
uploaded_file = st.file_uploader(
    "📸 Upload a food image",
    type=["jpg", "jpeg", "png"]
)

image = None

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption='Uploaded Food Image', width="stretch")

submit = st.button("🔍 Analyze Food & Calories", type="primary")

gemini_prompt = """
You are an expert nutritionist analyzing a food image.

Analyze the food items and provide:
1. List each food item with estimated calories
2. Total calories estimate
3. Macronutrient breakdown (carbs, protein, fat percentages)
4. Health assessment (healthy/moderate/indulgent)
5. Brief nutrition tips

Format clearly with sections.
"""


# ==================== Analysis Logic ====================

if submit:
    if uploaded_file is None:
        st.warning("Please upload an image first.")
    else:
        with st.spinner("🔄 Analyzing image..."):
            ml_result = None
            gemini_result = None
            
            # Try ML prediction first
            if model is not None and class_names is not None:
                predicted_food, confidence = predict_food_ml(image, model, class_names)
                
                if predicted_food and confidence >= 70:
                    st.markdown("### 🎯 ML Model Prediction")
                    st.write(f"**Detected Food:** {predicted_food.upper()}")
                    st.write(f"**Confidence:** {confidence:.1f}%")
                    st.markdown("---")
                    
                    # Check if food exists in database
                    if food_exists(predicted_food):
                        st.markdown("### 💪 Nutrition Information")
                        display_nutrition_from_db(predicted_food, source="ML")
                        ml_result = True
                    else:
                        st.info(f"⚠️ {predicted_food} not in our nutrition database. Using Gemini...")
                else:
                    st.info(f"⚠️ ML confidence too low ({confidence:.1f}%). Using Gemini for analysis...")
            
            # Use Gemini as fallback
            if ml_result is None:
                st.markdown("### 🤖 Gemini AI Analysis (Fallback)")
                image_data = input_image_setup(uploaded_file)
                response = get_gemini_response(gemini_prompt, image_data)
                
                if response:
                    st.success("✅ **Data Source:** Gemini AI")
                    st.markdown("---")
                    st.write(response)
                    gemini_result = True
                else:
                    st.error("❌ Failed to get analysis. Please try again.")
        
        st.markdown("---")