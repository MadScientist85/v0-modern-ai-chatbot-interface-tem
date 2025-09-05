"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TestPanel() {
  const [testResults, setTestResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testMessage, setTestMessage] = useState("Hello! Can you respond with a simple greeting?")
  const [selectedProvider, setSelectedProvider] = useState("grok")
  const [chatResponse, setChatResponse] = useState(null)
  const [isChatLoading, setIsChatLoading] = useState(false)

  const runConnectionTests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test")
      const results = await response.json()
      setTestResults(results)
    } catch (error) {
      console.error("Test failed:", error)
      setTestResults({ error: "Failed to run tests" })
    } finally {
      setIsLoading(false)
    }
  }

  const testChatAPI = async () => {
    setIsChatLoading(true)
    setChatResponse(null)
    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage, provider: selectedProvider }),
      })
      const result = await response.json()
      setChatResponse(result)
    } catch (error) {
      console.error("Chat test failed:", error)
      setChatResponse({ success: false, error: "Failed to test chat API" })
    } finally {
      setIsChatLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    if (status === "success") {
      return <Badge className="bg-green-500">✓ Connected</Badge>
    } else {
      return <Badge variant="destructive">✗ Failed</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Connection Tests</CardTitle>
          <CardDescription>Test all integrations and API connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runConnectionTests} disabled={isLoading} className="w-full">
            {isLoading ? "Running Tests..." : "Run Connection Tests"}
          </Button>

          {testResults && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Test completed at: {testResults.timestamp}</div>

              {testResults.tests?.supabase && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Supabase Database</div>
                    <div className="text-sm text-muted-foreground">{testResults.tests.supabase.message}</div>
                  </div>
                  {getStatusBadge(testResults.tests.supabase.status)}
                </div>
              )}

              {testResults.tests?.grok && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Grok (xAI)</div>
                    <div className="text-sm text-muted-foreground">{testResults.tests.grok.message}</div>
                    {testResults.tests.grok.response && (
                      <div className="text-xs mt-1 p-2 bg-muted rounded">
                        Response: {testResults.tests.grok.response}
                      </div>
                    )}
                  </div>
                  {getStatusBadge(testResults.tests.grok.status)}
                </div>
              )}

              {testResults.tests?.groq && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Groq</div>
                    <div className="text-sm text-muted-foreground">{testResults.tests.groq.message}</div>
                    {testResults.tests.groq.response && (
                      <div className="text-xs mt-1 p-2 bg-muted rounded">
                        Response: {testResults.tests.groq.response}
                      </div>
                    )}
                  </div>
                  {getStatusBadge(testResults.tests.groq.status)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💬 Chat API Test</CardTitle>
          <CardDescription>Test the chat functionality with different AI providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grok">Grok (xAI)</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Message</label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a message to test..."
              rows={3}
            />
          </div>

          <Button onClick={testChatAPI} disabled={isChatLoading} className="w-full">
            {isChatLoading ? "Testing..." : "Test Chat API"}
          </Button>

          {chatResponse && (
            <div className="p-3 border rounded">
              {chatResponse.success ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500">✓ Success</Badge>
                    <span className="text-sm text-muted-foreground">Provider: {chatResponse.provider}</span>
                  </div>
                  <div className="p-3 bg-muted rounded text-sm">
                    <strong>Response:</strong> {chatResponse.response}
                  </div>
                  {chatResponse.usage && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Tokens used: {chatResponse.usage.totalTokens}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Badge variant="destructive">✗ Failed</Badge>
                  <div className="text-sm text-red-600 mt-2">{chatResponse.error}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
