import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ conversations: [] })
    }

    // Get user's conversations grouped by conversation
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ conversations: [] })
    }

    // Group messages by conversation (using a simple grouping for now)
    const conversations = []
    const messageGroups = new Map()

    messages?.forEach((msg, index) => {
      // Simple conversation grouping - every user message starts a new conversation
      if (msg.role === "user" && index === 0) {
        const convId = `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`
        messageGroups.set(convId, [msg])
      }
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Conversations API error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, folder } = await req.json()

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Create new conversation record
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`

    return NextResponse.json({
      id: conversationId,
      title: title || "New Chat",
      folder: folder || "General",
    })
  } catch (error) {
    console.error("Create conversation error:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
