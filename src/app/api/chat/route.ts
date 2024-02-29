import type { NextApiRequest, NextApiResponse } from "next";

interface LlamaResponse {
  response: string; // Add optional error property
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LlamaResponse>
) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "POST") {
    try {
      const userInput = req.body.text as string;
      console.log("Sending request to Llama-CPP with input:", userInput);

      const response = await fetch(`http://127.0.0.1:8080/completion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userInput }),
      });

      console.log(
        "Received response from Llama-CPP:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const rawResponse = await response.text();
        res.status(200).json({ response: rawResponse });
      } else {
        console.error("Error calling Llama-CPP:", response.statusText);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  } else {
    res.status(405).end("Method not allowed");
  }
}
