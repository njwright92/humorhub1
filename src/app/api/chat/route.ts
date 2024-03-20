import { NextRequest, NextResponse } from "next/server";
import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";
import { SystemMessage } from "@langchain/core/messages";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const userPrompt =
      typeof requestBody?.prompt === "string" ? requestBody.prompt : null;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Prompt is required and must be a string." },
        { status: 400 }
      );
    }

    const modelPath = join(
      __dirname,
      "../../models/mistral-comedy-3.0-ckpt-1600.Q6_K.gguf"
    );
    // Adjust the model parameters including temperature, topK, and topP
    const model = new ChatLlamaCpp({
      modelPath,
      temperature: 0.7,
      topK: 40,
      topP: 0.9,
    });

    const prompt = `You are ComicBot: ComicBot's goal is to assist stand-up comedians in creating content and refining jokes, excelling in settings such as comedy clubs, lounges, and bars, and engaging an audience aged 21+.`;
    const fullPrompt = `${prompt}\n${userPrompt}`;

    const stream = await model.stream([new SystemMessage(fullPrompt)]);
    const encoder = new TextEncoder();

    const body = new ReadableStream({
      async start(controller) {
        let totalTokens = 0;
        let inBrackets = false;

        for await (const chunk of stream) {
          let content =
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
              if (totalTokens < 412) {
                controller.enqueue(encoder.encode(char)); // Send character immediately
                totalTokens++;
              } else {
                break; // Stop if token limit is reached
              }
            }
          }

          if (totalTokens >= 412) {
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
