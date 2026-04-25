"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Send, Sparkles, Loader2, Minimize2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { aiApi, Product } from "@/lib/api"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  products?: Product[]
}

export function AIChatbot() {
  const { token } = useAuth()
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

    const userMessage = input.trim()
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
        products: response.products
      }
      
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting right now. Please try again later." 
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
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
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <div className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-foreground text-background rounded-br-none" : "bg-neutral-100 text-foreground rounded-bl-none"}`}>
                    {msg.content}
                  </div>
                  {msg.products && msg.products.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      {msg.products.map((product) => (
                        <Link 
                          key={product.id} 
                          href={`/products/${product.id}`}
                          className="flex items-center gap-2 p-2 bg-white border border-neutral-200 rounded-xl hover:border-foreground transition-colors group"
                        >
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">Gift</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate group-hover:text-foreground">{product.name}</p>
                            <p className="text-xs text-neutral-500">₹{product.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
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
