import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";

import "./globals.css";
import { Navigation } from "@/components/navigation";
import { PromoMarquee } from "@/components/promo-marquee";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { SilenceWarnings } from "@/components/SilenceWarnings";
import { AIChatbot } from "@/components/AIChatbot";
import { PageTransition } from "@/components/PageTransition";

import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";

// ─── Lazy-loaded components (below-the-fold / non-critical) ─────────────────
const Footer = dynamic(
  () => import("@/components/footer").then((m) => ({ default: m.Footer })),
  {
    loading: () => <footer className="w-full bg-[#FAFAFA] h-[300px]" />,
  },
);

// ─── Metadata ───────────────────────────────────────────────────────────────
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://allblue.gift",
  ),
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
    description:
      "Discover the perfect gift with AI-powered recommendations and AR preview.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* DNS prefetch for external origins to reduce latency */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Preconnect to font origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Preconnect to API origin for faster first request */}
        {process.env.NEXT_PUBLIC_API_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        )}

        {/* Fonts with display=swap for non-blocking load */}
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased overflow-x-hidden bg-white text-[#111111]"
        style={{
          fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        <SilenceWarnings />
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <Suspense fallback={null}>
              <AuthProvider>
                <CartProvider>
                  <PromoMarquee />
                  <Navigation />
                  <ClientLayoutWrapper>
                    <main id="main-content">{children}</main>
                  </ClientLayoutWrapper>
                  <div className="max-w-[1920px] mx-auto">
                    <Footer />
                  </div>
                  <Toaster position="bottom-right" />
                </CartProvider>
              </AuthProvider>
            </Suspense>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
