import type { NextRequest } from "next/server"
import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "groq", conversationId } = await req.json()

    // Select AI model based on request
    let aiModel
    switch (model) {
      case "grok":
        aiModel = xai("grok-beta")
        break
      case "groq":
      default:
        aiModel = groq("llama-3.1-70b-versatile")
        break
    }

    const result = streamText({
      model: aiModel,
      messages,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return result.pipeDataStreamToResponse(new Response())
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
