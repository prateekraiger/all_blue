"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, X, Send, Gift, Loader2, Mic, ArrowDown, Trash2, Zap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { aiApi, Product } from "@/lib/api"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  products?: Product[]
  quickReplies?: string[]
  timestamp: Date
}

const INITIAL_QUICK_REPLIES = [
  "Birthday gift under ₹1000",
  "Anniversary gift ideas",
  "Corporate gifting",
  "Personalized gifts",
  "Luxury gifts",
  "Gift hampers",
]

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hey there! I'm your **AI Gift Concierge** powered by Gemini. Tell me who you're shopping for and I'll find something perfect.\n\nTry something like *\"birthday gift under ₹500\"* or *\"romantic anniversary ideas\"*!",
  quickReplies: INITIAL_QUICK_REPLIES,
  timestamp: new Date(),
}

/**
 * Simple inline markdown renderer: **bold**, *italic*, and line breaks.
 */
function renderMarkdown(text: string) {
  const parts: (string | React.ReactNode)[] = []
  // Split by newlines first
  const lines = text.split("\n")

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) parts.push(<br key={`br-${lineIdx}`} />)

    // Match **bold** and *italic*
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(line)) !== null) {
      // Push text before the match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }

      if (match[2]) {
        // **bold**
        parts.push(
          <strong key={`b-${lineIdx}-${match.index}`} className="font-semibold">
            {match[2]}
          </strong>
        )
      } else if (match[3]) {
        // *italic*
        parts.push(
          <em key={`i-${lineIdx}-${match.index}`} className="italic opacity-80">
            {match[3]}
          </em>
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Remaining text after last match
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }
  })

  return parts
}

export function AIChatbot() {
  const { token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  // Track scroll position for "scroll to bottom" button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100)
    }
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [isOpen])

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return

      const userMessage = messageText.trim()
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
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
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMsg])
      } catch (error) {
        console.error("Chat error:", error)
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Oops, something went wrong on my end. Please try again in a moment!",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsLoading(false)
      }
    },
    [token, isLoading]
  )

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
      {/* Floating action button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
            aria-label="Open AI Shopping Assistant"
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl group-hover:bg-primary/50 transition-all duration-500 scale-150" />
              {/* Button */}
              <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-300">
                <Gift className="w-6 h-6 text-white" />
              </div>
              {/* Badge */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[7px] font-black flex items-center justify-center rounded-full border-2 border-background shadow-lg">
                AI
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] h-[600px] max-h-[88vh] flex flex-col overflow-hidden rounded-3xl shadow-2xl border border-border/50"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-card), var(--color-background))",
            }}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="relative px-5 py-4 shrink-0 border-b border-border/50 bg-card/80 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground tracking-tight">
                      AI Gift Concierge
                    </h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      Powered by Gemini
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Messages ───────────────────────────────────────────── */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
              style={{ scrollbarWidth: "thin" }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col gap-1.5 max-w-[85%]">
                    {/* Bubble */}
                    <div
                      className={`px-4 py-3 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-md"
                          : "bg-muted/70 text-foreground rounded-2xl rounded-bl-md border border-border/30"
                      }`}
                    >
                      {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                    </div>

                    {/* Product cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        {msg.products.slice(0, 4).map((product) => (
                          <Link
                            key={product.id}
                            href={`/shop/${product.id}`}
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center gap-3 p-2.5 bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300"
                          >
                            <div className="w-11 h-11 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Gift className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground font-medium">
                                ₹{product.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              View →
                            </div>
                          </Link>
                        ))}
                        {msg.products.length > 4 && (
                          <Link
                            href="/shop"
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] text-primary font-semibold text-center hover:underline py-1"
                          >
                            View all {msg.products.length} results →
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Quick replies */}
                    {msg.quickReplies &&
                      msg.quickReplies.length > 0 &&
                      msg.role === "assistant" && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.quickReplies.map((qr) => (
                            <button
                              key={qr}
                              onClick={() => handleQuickReply(qr)}
                              disabled={isLoading}
                              className="text-[11px] font-medium border border-border/50 rounded-full px-3 py-1.5 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}

                    {/* Timestamp */}
                    <span
                      className={`text-[10px] text-muted-foreground/60 ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted/70 border border-border/30 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll-to-bottom button */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 w-8 h-8 bg-card border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ── Input ─────────────────────────────────────────────── */}
            <div className="px-4 py-3 border-t border-border/50 bg-card/80 backdrop-blur-xl shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={startVoiceInput}
                  disabled={isListening || isLoading}
                  className={`p-2.5 rounded-xl border transition-all duration-200 shrink-0 ${
                    isListening
                      ? "border-red-400 bg-red-500/10 text-red-500 shadow-lg shadow-red-500/20"
                      : "border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                  }`}
                  aria-label="Voice input"
                >
                  <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
                </button>

                {/* Text input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Describe your perfect gift..."}
                    className="w-full border border-border/50 bg-background/50 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                    disabled={isListening}
                  />
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-gradient-to-br from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
