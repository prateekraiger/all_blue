"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Send, Sparkles, Loader2, Minimize2 } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hi! I'm your AI Shopping Assistant. Looking for the perfect gift?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      let aiResponseText = "I found some great options for you! Let me know if you want to refine this."
      const lowercaseInput = userMsg.content.toLowerCase()
      
      if (lowercaseInput.includes("anniversary") || lowercaseInput.includes("wedding")) {
        aiResponseText = "For an anniversary, I highly recommend our curated luxury gift boxes or personalized crystalware. Want to see some?"
      } else if (lowercaseInput.includes("birthday")) {
        aiResponseText = "Birthdays are special! What's their age group and interests? We have tech gadgets, artisanal chocolates, and more."
      } else if (lowercaseInput.includes("corporate") || lowercaseInput.includes("bulk")) {
        aiResponseText = "For corporate gifting, we offer bespoke branding and concierge delivery. Check out our 'Corporate Gifting' page!"
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: aiResponseText }])
      setIsLoading(false)
    }, 1200)
  }

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-foreground text-background rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
          aria-label="Open AI Shopping Assistant"
        >
          <Sparkles className="w-6 h-6 animate-pulse group-hover:hidden" />
          <Bot className="w-6 h-6 hidden group-hover:block" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-background border border-neutral-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-full">
                <Bot className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Shopping Assistant</h3>
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-foreground text-background rounded-br-none" : "bg-neutral-100 text-foreground rounded-bl-none"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] border border-neutral-100 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-neutral-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="p-3 border-t border-neutral-100 bg-neutral-50">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for gift ideas..."
                className="flex-1 border border-neutral-300 rounded-full py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent pr-12"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1 p-2 bg-foreground text-background rounded-full hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
