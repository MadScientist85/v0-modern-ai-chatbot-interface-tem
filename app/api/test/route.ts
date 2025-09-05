import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { xai } from "@ai-sdk/xai"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {} as Record<string, any>,
  }

  // Test Supabase connection
  try {
    console.log("[v0] Testing Supabase connection...")
    const supabase = await createClient()

    // Test database query
    const { data: users, error: usersError } = await supabase.from("users").select("id, email, name").limit(1)

    if (usersError) throw usersError

    results.tests.supabase = {
      status: "success",
      message: "Database connection successful",
      userCount: users?.length || 0,
    }
    console.log("[v0] Supabase test passed")
  } catch (error) {
    results.tests.supabase = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
    console.log("[v0] Supabase test failed:", error)
  }

  // Test Grok (xAI) connection
  try {
    console.log("[v0] Testing Grok connection...")
    const result = await generateText({
      model: xai("grok-beta"),
      prompt: 'Say "Grok connection test successful" in exactly 5 words.',
      maxTokens: 20,
    })

    results.tests.grok = {
      status: "success",
      message: "Grok API connection successful",
      response: result.text,
    }
    console.log("[v0] Grok test passed")
  } catch (error) {
    results.tests.grok = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
    console.log("[v0] Grok test failed:", error)
  }

  // Test Groq connection
  try {
    console.log("[v0] Testing Groq connection...")
    const result = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: 'Say "Groq connection test successful" in exactly 5 words.',
      maxTokens: 20,
    })

    results.tests.groq = {
      status: "success",
      message: "Groq API connection successful",
      response: result.text,
    }
    console.log("[v0] Groq test passed")
  } catch (error) {
    results.tests.groq = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
    console.log("[v0] Groq test failed:", error)
  }

  return NextResponse.json(results, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const { message, provider = "grok" } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log(`[v0] Testing ${provider} with message:`, message)

    let result
    if (provider === "grok") {
      result = await generateText({
        model: xai("grok-beta"),
        prompt: message,
        maxTokens: 100,
      })
    } else if (provider === "groq") {
      result = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt: message,
        maxTokens: 100,
      })
    } else {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      provider,
      response: result.text,
      usage: result.usage,
    })
  } catch (error) {
    console.log("[v0] API test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
