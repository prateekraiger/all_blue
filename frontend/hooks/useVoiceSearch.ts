"use client"

import { useState, useCallback, useRef } from "react"

interface UseVoiceSearchOptions {
  lang?: string
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

interface UseVoiceSearchReturn {
  isListening: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  error: string | null
}

/**
 * useVoiceSearch — A React hook for Web Speech API voice recognition.
 *
 * Supports both SpeechRecognition and webkitSpeechRecognition.
 * Default language: en-IN (for Indian English)
 */
export function useVoiceSearch({
  lang = "en-IN",
  onResult,
  onError,
}: UseVoiceSearchOptions = {}): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const isSupported =
    typeof window !== "undefined" &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    )

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = "Voice search is not supported in this browser"
      setError(msg)
      onError?.(msg)
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = lang
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    setIsListening(true)
    setError(null)

    recognition.start()

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript
      onResult?.(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      const msg =
        event.error === "no-speech"
          ? "No speech detected. Please try again."
          : event.error === "not-allowed"
          ? "Microphone access was denied."
          : `Voice recognition error: ${event.error}`
      setError(msg)
      onError?.(msg)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }
  }, [isSupported, lang, onResult, onError])

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error,
  }
}
