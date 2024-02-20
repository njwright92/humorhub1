import { ModelFusionTextStream } from "@modelfusion/vercel-ai";
import { Message, StreamingTextResponse } from "ai";
import { llamacpp, streamText } from "modelfusion";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const refinedMessages = refineMessages(messages);
  const prompt = refinedMessages.map((msg) => msg.content).join("\n");

  const api = llamacpp.Api({
    baseUrl: {
      host: "127.0.0.1",
      port: "8080",
    },
  });

  const model = llamacpp
    .CompletionTextGenerator({
      api,
      temperature: 0,
      cachePrompt: true,
      contextWindowSize: 512,
      maxGenerationTokens: 212,
      stopSequences: ["\n```"],
    })
    .withTextPrompt();

  const textStream = await streamText({ model, prompt });
  return new StreamingTextResponse(ModelFusionTextStream(textStream));
}

function refineMessages(messages: Message[]): Message[] {
  return messages;
}
