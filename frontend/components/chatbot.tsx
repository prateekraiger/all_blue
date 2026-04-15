"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageSquare, X, Send, Bot, User, ShoppingBag, Mic } from "lucide-react"
import { aiApi, type Product } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"

interface Message {
  id: string
  role: "user" | "bot"
  text: string
  products?: Product[]
  timestamp: Date
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm your gift assistant. 🎁 Tell me what you're looking for — like 'birthday gift under ₹500' or 'anniversary ideas' and I'll find the perfect options for you!",
  timestamp: new Date(),
}

const QUICK_SUGGESTIONS = [
  "Birthday gift under ₹500",
  "Anniversary gift ideas",
  "Corporate gift hamper",
  "Luxury gift box",
]

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const { token } = useAuth()
  const { addItem } = useCart()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const response = await aiApi.chat(text, token)
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: response.reply,
        products: response.products,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: "Sorry, I couldn't process that. Please try again or browse our shop!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }, [loading, token])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Voice input not supported in this browser")
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
      sendMessage(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product, 1)
      toast.success(`${product.name} added to cart`)
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart")
    }
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 w-[90vw] sm:w-[380px] max-h-[85vh] bg-white border border-neutral-200 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between bg-foreground text-background px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">Gift Assistant</div>
                <div className="text-[10px] opacity-70">Powered by ALL BLUE AI</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === "user" ? "bg-foreground text-background" : "bg-neutral-50 border border-neutral-100"} px-3 py-2`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.slice(0, 3).map((product) => (
                        <div key={product.id} className="bg-white border border-neutral-100 p-2 flex items-center gap-3">
                          <div className="w-12 h-12 bg-neutral-100 shrink-0 overflow-hidden p-1">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
                              />
                            ) : (
                              <div className="w-full h-full bg-neutral-200" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">{product.name}</div>
                            <div className="text-xs text-neutral-500">₹{product.price.toLocaleString("en-IN")}</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Link href={`/shop/${product.id}`} onClick={() => setIsOpen(false)} className="text-[10px] text-neutral-500 hover:text-foreground transition-colors border border-neutral-200 px-2 py-0.5">
                              View
                            </Link>
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className="text-[10px] bg-foreground text-background px-2 py-0.5 hover:bg-neutral-700 transition-colors disabled:bg-neutral-300"
                            >
                              Cart
                            </button>
                          </div>
                        </div>
                      ))}
                      {msg.products.length > 3 && (
                        <Link href={`/search?q=${encodeURIComponent(messages.find((m) => m.role === "user")?.text || "")}`} className="block text-xs text-center text-neutral-500 hover:text-foreground transition-colors pt-1" onClick={() => setIsOpen(false)}>
                          View all {msg.products.length} results →
                        </Link>
                      )}
                    </div>
                  )}
                  <div className="text-[10px] opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 bg-neutral-100 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-neutral-50 border border-neutral-100 px-3 py-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-[10px] border border-neutral-200 px-2.5 py-1 hover:border-foreground hover:bg-neutral-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-neutral-100 p-3 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me for gift ideas..."
                disabled={loading}
                className="flex-1 border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-foreground transition-colors disabled:bg-neutral-50"
              />
              <button
                type="button"
                onClick={handleVoice}
                className={`p-2 border transition-colors ${isListening ? "border-red-300 bg-red-50 text-red-500" : "border-neutral-200 text-neutral-400 hover:border-foreground"}`}
              >
                <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-foreground text-background p-2 hover:bg-neutral-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:right-6 w-14 h-14 bg-foreground text-background hover:bg-neutral-700 transition-all hover:scale-105 active:scale-95 shadow-lg z-50 flex items-center justify-center"
        aria-label="Open chat assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full">
            AI
          </span>
        )}
      </button>
    </>
  )
}
