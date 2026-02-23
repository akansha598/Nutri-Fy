# import streamlit as st
# import google.generativeai as genai
# import os
# from dotenv import load_dotenv
# load_dotenv()
# from PIL import Image

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# def get_gemini_response(input_prompt,image):
    
#     model=genai.GenerativeModel('gemini-2.5-flash')
#     response=model.generate_content([input_prompt,image[0]])
#     return response.text

# def input_image_setup(uploaded_file):
#     if uploaded_file is not None:
#         bytes_data = uploaded_file.getvalue()
        
#         image_parts = [
#             {
#                 "mime_type": uploaded_file.type,
#                 "data": bytes_data
#             }
#         ]
#         return image_parts
    
#     else:
#         raise FileNotFoundError("No file uploaded")
    
    
# st.set_page_config(page_title="Calories Advisor APP")
# uploaded_file = st.file_uploader("Upload a food image", type=["jpg", "jpeg", "png"])
# image=""
# if uploaded_file is not None:
#     image = Image.open(uploaded_file)
#     st.image(image, caption='Uploaded Food Image', use_column_width=True)
    
# submit=st.button("Tell me about the total calories")

# input_prompt="""

# You are an expert nutritionist where you need to see
# the food items from the image and calculate
# the total calories, also provide the details
# of every food items with calories intake in below format:
#     1. Item 1 - no of calories
#     2. Item 2 - no of calories
# ----
# ----   

# Finally you can also mention whether the food is healthy or not and aslo mention the percentage split of the ratio of carbs, proteins,fibers, sugar, fats and other important things required in our diet 
# """

# if submit:
#     image_data=input_image_setup(uploaded_file)
#     response=get_gemini_response(input_prompt,image_data)
#     st.header("the response is:")
#     st.write(response)


import streamlit as st

# MUST be first Streamlit command
st.set_page_config(page_title="Calories Advisor APP")

import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


# ---------------- Gemini Function ---------------- #

def get_gemini_response(input_prompt, image):
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content([input_prompt, image[0]])
    return response.text


# ---------------- Image Processing ---------------- #

def input_image_setup(uploaded_file):
    if uploaded_file is not None:
        bytes_data = uploaded_file.getvalue()

        image_parts = [{
            "mime_type": uploaded_file.type,
            "data": bytes_data
        }]

        return image_parts
    else:
        return None


# ---------------- UI ---------------- #

st.title("Food Image - AI Scanning")

st.markdown(
    "<h4 style='color: gray; font-weight: normal;'>"
    "Scan your food. Understand your nutrition. Make smarter diet choices every day."
    "</h4>",
    unsafe_allow_html=True
)


uploaded_file = st.file_uploader(
    "Upload a food image",
    type=["jpg", "jpeg", "png"]
)

image = None

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption='Uploaded Food Image', width="stretch")

submit = st.button("Tell me about the total calories")

input_prompt = """
You are an expert nutritionist where you need to see
the food items from the image and calculate
the total calories.

Provide the details of every food item with calories in below format:
1. Item 1 - no of calories
2. Item 2 - no of calories

Finally mention whether the food is healthy or not.
Also mention percentage split of carbs, proteins, fibers, sugar, fats.
"""


# ---------------- Execution ---------------- #

if submit:
    if uploaded_file is None:
        st.warning("Please upload an image first.")
    else:
        with st.spinner("Analyzing image..."):
            image_data = input_image_setup(uploaded_file)
            response = get_gemini_response(input_prompt, image_data)

        st.header("Response:")
        st.write(response)
