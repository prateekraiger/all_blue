import React, { Suspense } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import { Toaster } from "@/components/ui/sonner"
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { AIChatbot } from "@/components/AIChatbot"
import { PageTransition } from "@/components/PageTransition"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "ALL BLUE — AI-Powered Gift Store",
    template: "%s | ALL BLUE",
  },
  description:
    "Discover the perfect gift with AI-powered recommendations, AR product preview, voice search, and a smart chatbot. Curated gifts for every occasion.",
  keywords: [
    "gift shop",
    "AI gifts",
    "personalized gifts",
    "gift recommendations",
    "birthday gifts",
    "anniversary gifts",
    "corporate gifting",
    "online gift store India",
    "AR product preview",
  ],
  authors: [{ name: "ALL BLUE" }],
  creator: "ALL BLUE",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "ALL BLUE — AI-Powered Gift Store",
    description:
      "Discover the perfect gift with AI-powered recommendations, AR product preview, voice search, and a smart chatbot.",
    siteName: "ALL BLUE",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALL BLUE — AI-Powered Gift Store",
    description: "Discover the perfect gift with AI-powered recommendations and AR preview.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <Suspense fallback={null}>
              <AuthProvider>
                <CartProvider>
                  <Navigation />
                  <PageTransition>
                    {children}
                  </PageTransition>
                  <div className="max-w-[1920px] mx-auto">
                    <Footer />
                  </div>
                  <Toaster position="bottom-right" />
                  <AIChatbot />
                  <Analytics />
                </CartProvider>
              </AuthProvider>
            </Suspense>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  )
}
