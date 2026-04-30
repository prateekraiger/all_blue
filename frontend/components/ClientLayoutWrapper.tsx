"use client"

import dynamic from "next/dynamic"
import React from "react"

const AIChatbot = dynamic(() => import("@/components/AIChatbot").then(m => ({ default: m.AIChatbot })), {
  ssr: false,
})

const PageTransition = dynamic(
  () => import("@/components/PageTransition").then(m => ({ default: m.PageTransition })),
  { ssr: false },
)

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageTransition>
        {children}
      </PageTransition>
      <AIChatbot />
    </>
  )
}
