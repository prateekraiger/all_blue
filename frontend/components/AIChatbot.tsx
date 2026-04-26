"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, X, Send, Sparkles, Loader2, Minimize2, Mic, Gift } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { aiApi, Product } from "@/lib/api"
import { toast } from "sonner"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  products?: Product[]
  quickReplies?: string[]
}

const INITIAL_QUICK_REPLIES = [
  "Birthday gift under ₹1000",
  "Anniversary gift ideas",
  "Corporate gifting",
  "Personalized gifts",
]

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hi! 👋 I'm your AI Shopping Assistant. I can help you find the perfect gift for any occasion.\n\nTry asking me something like \"birthday gift under ₹500\" or \"romantic anniversary ideas\"!",
  quickReplies: INITIAL_QUICK_REPLIES,
}

export function AIChatbot() {
  const { token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage = messageText.trim()
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userMessage }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiApi.chat(userMessage, token)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.reply,
        products: response.products,
        quickReplies: response.quickReplies,
      }

      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having a bit of trouble right now. Please try again in a moment! 🙏",
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [token, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
  }

  const handleQuickReply = async (reply: string) => {
    await sendMessage(reply)
  }

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false
    setIsListening(true)
    recognition.start()
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE])
    setInput("")
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
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[580px] max-h-[85vh] bg-background border border-neutral-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">

          {/* Header */}
          <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-full">
                <Bot className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Shopping Assistant</h3>
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online · Powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-400 text-[10px] font-semibold uppercase tracking-widest"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col gap-2 max-w-[88%]">

                  {/* Message bubble */}
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-foreground text-background rounded-br-none"
                        : "bg-neutral-100 text-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      {msg.products.slice(0, 4).map((product) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-2 bg-white border border-neutral-200 rounded-xl hover:border-foreground transition-colors group"
                        >
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Gift className="w-4 h-4 text-neutral-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{product.name}</p>
                            <p className="text-xs text-neutral-500">₹{product.price.toLocaleString("en-IN")}</p>
                          </div>
                        </Link>
                      ))}
                      {msg.products.length > 4 && (
                        <Link
                          href="/shop"
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] text-primary font-semibold text-center hover:underline"
                        >
                          View all {msg.products.length} results →
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Quick replies */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          onClick={() => handleQuickReply(qr)}
                          disabled={isLoading}
                          className="text-[11px] border border-neutral-200 rounded-full px-3 py-1 hover:border-foreground hover:bg-foreground hover:text-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-neutral-100 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-neutral-500 text-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking</span>
                  <span className="flex gap-0.5 items-end">
                    <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="p-3 border-t border-neutral-100 bg-neutral-50 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              {/* Voice input button */}
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={isListening || isLoading}
                className={`p-2 rounded-full border transition-colors shrink-0 ${
                  isListening
                    ? "border-red-300 bg-red-50 text-red-500"
                    : "border-neutral-200 hover:border-foreground text-neutral-400"
                }`}
                aria-label="Voice input"
              >
                <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask for gift ideas..."}
                className="flex-1 border border-neutral-300 rounded-full py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-colors"
                disabled={isListening}
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-foreground text-background rounded-full hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shrink-0"
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
