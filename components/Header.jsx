"use client"
import { MoreHorizontal, Menu, ChevronDown, MessageSquare, Wrench } from "lucide-react"
import { useState } from "react"
import GhostIconButton from "./GhostIconButton"

export default function Header({
  createNewChat,
  sidebarCollapsed,
  setSidebarOpen,
  selectedModel,
  setSelectedModel,
  currentView = "chat",
  setCurrentView = () => {},
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const chatbots = [
    { name: "Groq Llama", value: "groq", icon: "🚀" },
    { name: "Grok Beta", value: "grok", icon: "🤖" },
    { name: "GPT-4", value: "gpt4", icon: "🧠" },
    { name: "Claude", value: "claude", icon: "🎭" },
  ]

  const selectedBot = chatbots.find((bot) => bot.value === selectedModel) || chatbots[0]

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setCurrentView("chat")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentView === "chat"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={() => setCurrentView("test")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentView === "test"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Test</span>
          </button>
        </div>
      </div>

      {currentView === "chat" && (
        <>
          <div className="hidden md:flex relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold tracking-tight hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
            >
              <span className="text-sm">{selectedBot.icon}</span>
              {selectedBot.name}
              <ChevronDown className="h-4 w-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50">
                {chatbots.map((bot) => (
                  <button
                    key={bot.value}
                    onClick={() => {
                      setSelectedModel(bot.value)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg ${
                      selectedModel === bot.value ? "bg-zinc-100 dark:bg-zinc-800" : ""
                    }`}
                  >
                    <span className="text-sm">{bot.icon}</span>
                    {bot.name}
                    {selectedModel === bot.value && <span className="ml-auto text-blue-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:hidden flex-1">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium tracking-tight hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
            >
              <span className="text-sm">{selectedBot.icon}</span>
              {selectedBot.name}
              <ChevronDown className="h-4 w-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-4 right-4 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50">
                {chatbots.map((bot) => (
                  <button
                    key={bot.value}
                    onClick={() => {
                      setSelectedModel(bot.value)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg ${
                      selectedModel === bot.value ? "bg-zinc-100 dark:bg-zinc-800" : ""
                    }`}
                  >
                    <span className="text-sm">{bot.icon}</span>
                    {bot.name}
                    {selectedModel === bot.value && <span className="ml-auto text-blue-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {currentView === "test" && (
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Connection Tests</h1>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <GhostIconButton label="More">
          <MoreHorizontal className="h-4 w-4" />
        </GhostIconButton>
      </div>
    </div>
  )
}
