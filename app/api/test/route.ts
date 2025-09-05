import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

  try {
    console.log("[v0] Testing Grok connection...")

    if (!process.env.XAI_API_KEY) {
      throw new Error("XAI_API_KEY not found")
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [{ role: "user", content: 'Say "Grok connection test successful" in exactly 5 words.' }],
        max_tokens: 20,
      }),
    })

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`)
    }

    const data = await response.json()

    results.tests.grok = {
      status: "success",
      message: "Grok API connection successful",
      response: data.choices?.[0]?.message?.content || "No response",
    }
    console.log("[v0] Grok test passed")
  } catch (error) {
    results.tests.grok = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
    console.log("[v0] Grok test failed:", error)
  }

  try {
    console.log("[v0] Testing Groq connection...")

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not found")
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: 'Say "Groq connection test successful" in exactly 5 words.' }],
        max_tokens: 20,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()

    results.tests.groq = {
      status: "success",
      message: "Groq API connection successful",
      response: data.choices?.[0]?.message?.content || "No response",
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
      if (!process.env.XAI_API_KEY) {
        throw new Error("XAI_API_KEY not found")
      }

      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [{ role: "user", content: message }],
          max_tokens: 100,
        }),
      })

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`)
      }

      const data = await response.json()
      result = {
        text: data.choices?.[0]?.message?.content || "No response",
        usage: data.usage,
      }
    } else if (provider === "groq") {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY not found")
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: message }],
          max_tokens: 100,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data = await response.json()
      result = {
        text: data.choices?.[0]?.message?.content || "No response",
        usage: data.usage,
      }
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
