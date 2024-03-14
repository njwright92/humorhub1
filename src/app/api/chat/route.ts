import { NextRequest, NextResponse } from "next/server";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Correctly export an async function named after the HTTP method
export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  try {
    const requestBody = await request.json();
    const prompt =
      typeof requestBody?.prompt === "string" ? requestBody.prompt : null;
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required and must be a string." },
        { status: 400 }
      );
    }

    const modelPath = join(__dirname, "../../models/mistral-comic-v3.gguf");

    console.log("Attempting to load model from:", modelPath);

    const model = new LlamaModel({ modelPath });
    const context = new LlamaContext({ model });
    const session = new LlamaChatSession({ context });

    // Example of handling the prompt and getting a response
    const response = await session.prompt(prompt);
    // Handle the response appropriately

    return NextResponse.json({ response }); // Ensure the response is structured as needed
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
