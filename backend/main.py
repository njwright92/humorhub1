from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Define the request and response models


class Request(BaseModel):
    prompt: str


class Response(BaseModel):
    response: str


# Initialize the FastAPI app
app = FastAPI()

# Configure CORS (replace with your frontend's domain for better security)
app.add_middleware(
    CORSMiddleware,
    # You can replace this with your frontend domain for security
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the GGUF model
model_path = "/root/backend/models/comic_mistral-v5.2.q5_0.gguf"
# Set the chat format
llm = Llama(model_path=model_path, chat_format="llama-2")

# Define the /generate endpoint


@app.post("/generate", response_model=Response)
async def generate_text(request: Request):
    logging.info(f"Received request with prompt: {request.prompt}")

    try:
        # Generate the response using chat completion with specific parameters
        output = llm.create_chat_completion(
            messages=[
                {"role": "system", "content": "You are a funny assistant."},
                {"role": "user", "content": request.prompt}
            ],
        )

        generated_text = output['choices'][0]['message']['content'].strip()
        logging.info(f"Generated response: {generated_text}")
        return Response(response=generated_text)
    except Exception as e:
        logging.error(f"Error during generation: {str(e)}")
        return Response(response="Error occurred while generating text.")
