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

function renderMarkdown(text: string) {
  const parts: (string | React.ReactNode)[] = []
  const lines = text.split("\n")

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) parts.push(<br key={`br-${lineIdx}`} />)
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }
      if (match[2]) {
        parts.push(<strong key={`b-${lineIdx}-${match.index}`} className="font-medium">{match[2]}</strong>)
      } else if (match[3]) {
        parts.push(<em key={`i-${lineIdx}-${match.index}`} className="italic opacity-80">{match[3]}</em>)
      }
      lastIndex = match.index + match[0].length
    }

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
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        const response = await aiApi.chat(userMessage, history, token);
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
      {/* Floating action button — Nike black, no shadow lift */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#111111] rounded-full flex items-center justify-center hover:bg-[#707072] transition-colors duration-200"
            aria-label="Open AI Shopping Assistant"
          >
            <Gift className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#007D48] text-white text-[7px] font-medium flex items-center justify-center rounded-full">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window — Nike design system */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] h-[600px] max-h-[88vh] flex flex-col overflow-hidden bg-white"
            style={{ boxShadow: '0 0 0 1px #E5E5E5, 0 20px 60px -10px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div className="px-5 py-4 shrink-0 bg-[#111111]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-medium text-white" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      AI Gift Concierge
                    </h3>
                    <p className="text-[11px] text-white/50 flex items-center gap-1" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      <Zap className="w-3 h-3" /> Powered by Gemini
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAFAFA]"
              style={{ scrollbarWidth: "thin" }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col gap-1.5 max-w-[85%]">
                    {/* Bubble */}
                    <div
                      className={`px-4 py-3 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#111111] text-white rounded-[20px] rounded-br-[4px]"
                          : "bg-white text-[#111111] rounded-[20px] rounded-bl-[4px]"
                      }`}
                      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', boxShadow: msg.role === "assistant" ? '0 0 0 1px #E5E5E5' : 'none' }}
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
                            className="group flex items-center gap-3 p-2.5 bg-white hover:bg-[#F5F5F5] transition-colors no-underline"
                            style={{ boxShadow: '0 0 0 1px #E5E5E5' }}
                          >
                            <div className="w-11 h-11 bg-[#F5F5F5] overflow-hidden flex-shrink-0">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Gift className="w-4 h-4 text-[#CACACB]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-[#111111] truncate group-hover:underline" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                                {product.name}
                              </p>
                              <p className="text-[12px] text-[#707072] font-medium" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                                ₹{product.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </Link>
                        ))}
                        {msg.products.length > 4 && (
                          <Link
                            href="/shop"
                            onClick={() => setIsOpen(false)}
                            className="text-[12px] font-medium text-[#111111] text-center hover:underline py-1"
                            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                          >
                            View all {msg.products.length} results →
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Quick replies */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && msg.role === "assistant" && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.quickReplies.map((qr) => (
                          <button
                            key={qr}
                            onClick={() => handleQuickReply(qr)}
                            disabled={isLoading}
                            className="text-[11px] font-medium border border-[#CACACB] rounded-full px-3 py-1.5 text-[#111111] hover:border-[#111111] hover:bg-[#F5F5F5] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <span
                      className={`text-[10px] text-[#CACACB] ${msg.role === "user" ? "text-right" : "text-left"}`}
                      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                    >
                      {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white px-4 py-3 rounded-[20px] rounded-bl-[4px] flex items-center gap-2" style={{ boxShadow: '0 0 0 1px #E5E5E5' }}>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#707072] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#707072] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#707072] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[11px] text-[#707072] ml-1" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll-to-bottom */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 w-8 h-8 bg-white flex items-center justify-center text-[#707072] hover:text-[#111111] transition-colors"
                  style={{ boxShadow: '0 0 0 1px #E5E5E5' }}
                >
                  <ArrowDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="px-4 py-3 bg-white shrink-0" style={{ borderTop: '1px solid #E5E5E5' }}>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startVoiceInput}
                  disabled={isListening || isLoading}
                  className={`w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isListening
                      ? "bg-[#D30005]/5 text-[#D30005]"
                      : "bg-[#F5F5F5] text-[#707072] hover:text-[#111111]"
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
                  placeholder={isListening ? "Listening..." : "Describe your perfect gift..."}
                  className="flex-1 bg-[#F5F5F5] border border-[#E5E5E5] py-2.5 px-4 text-[14px] focus:outline-none focus:border-[#111111] transition-colors placeholder:text-[#CACACB] text-[#111111]"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  disabled={isListening}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center hover:bg-[#707072] disabled:bg-[#E5E5E5] disabled:text-[#CACACB] disabled:cursor-not-allowed transition-colors duration-200 shrink-0"
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
