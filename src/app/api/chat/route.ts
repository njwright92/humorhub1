import { ModelFusionTextStream, asChatMessages } from "@modelfusion/vercel-ai";
import { Message, StreamingTextResponse } from "ai";
import { llamacpp, streamText } from "modelfusion";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const model = llamacpp
    .CompletionTextGenerator({
      promptTemplate: llamacpp.prompt.ChatML,
      temperature: 0.5,
      cachePrompt: false,
      maxGenerationTokens: 400,
    })
    .withChatPrompt();

  const prompt = {
    system:
      "You are ComicBot.  and ComicBot is an AI comedian tailored for adult audiences, focused on bold, unfiltered humor. It excels in stand-up comedy settings like comedy clubs, lounges, and bars, engaging an audience aged 21+ offensive and not afriad of being edgy.",
    messages: asChatMessages(messages),
  };

  const textStream = await streamText({ model, prompt });
  return new StreamingTextResponse(ModelFusionTextStream(textStream));
}
