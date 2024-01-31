import { ModelFusionTextStream } from "@modelfusion/vercel-ai";
import { Message, StreamingTextResponse } from "ai";
import { llamacpp, streamText } from "modelfusion";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const refinedMessages = refineMessages(messages);
  const contextWindowSize = calculateWindowSize(refinedMessages);
  const maxGenerationTokens = calculateMaxTokens(refinedMessages);
  const prompt = refinedMessages.map((msg) => msg.content).join("\n");

  const model = llamacpp
    .CompletionTextGenerator({
      temperature: 0.6,
      contextWindowSize,
      maxGenerationTokens,
      stopSequences: ["\n```"],
    })
    .withTextPrompt();

  const textStream = await streamText({ model, prompt });
  return new StreamingTextResponse(ModelFusionTextStream(textStream));
}

function refineMessages(messages: Message[]): Message[] {
  return messages; // No modification made for efficiency
}

function calculateWindowSize(messages: Message[]): number {
  return 512; // No modification made for efficiency
}

function calculateMaxTokens(messages: Message[]): number {
  return 312; // No modification made for efficiency
}
