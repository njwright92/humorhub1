# main.py

from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama
from fastapi.middleware.cors import CORSMiddleware

# Define the request and response models


class Request(BaseModel):
    prompt: str


class Response(BaseModel):
    response: str


# Initialize the FastAPI app
app = FastAPI()

# Configure CORS (adjust 'allow_origins' to your frontend's domain)
app.add_middleware(
    CORSMiddleware,
    # Replace "*" with your frontend's URL for better security
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the GGUF model
model_path = "./models/comic_mistral-v5.2.q5_0.gguf"
llm = Llama(model_path=model_path)

# Define the /generate endpoint


@app.post("/generate", response_model=Response)
async def generate_text(request: Request):
    prompt = request.prompt
    output = llm(prompt)
    generated_text = output['choices'][0]['text']
    return Response(response=generated_text)
