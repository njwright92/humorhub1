import { NextRequest, NextResponse } from "next/server";
import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const prompt =
      typeof requestBody?.prompt === "string" ? requestBody.prompt : null;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required and must be a string." },
        { status: 400 }
      );
    }

    console.log("Prompt received:", prompt);
    const modelPath = join(__dirname, "../../models/mistral-comic-v3.gguf");
    const model = new ChatLlamaCpp({ modelPath, maxTokens: 212 });
    const stream = await model.stream(prompt);
    const encoder = new TextEncoder();

    const body = new ReadableStream({
      async start(controller) {
        let totalTokens = 0;
        let inBrackets = false;

        for await (const chunk of stream) {
          const content =
            typeof chunk.content === "string"
              ? chunk.content
              : JSON.stringify(chunk.content);

          for (const char of content) {
            if (char === "[") {
              inBrackets = true;
            } else if (char === "]") {
              inBrackets = false;
              continue; // Skip the closing bracket
            }

            if (!inBrackets) {
              if (totalTokens < 212) {
                controller.enqueue(encoder.encode(char)); // Send character immediately
                totalTokens++;
              } else {
                break; // Stop if token limit is reached
              }
            }
          }

          if (totalTokens >= 212) {
            break; // Ensure we stop processing the stream if token limit is reached
          }
        }
        controller.close();
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
