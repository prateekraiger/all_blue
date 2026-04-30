import { Collections } from "@/components/collections"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore our curated gift collections — The Signature Collection, Gifts for Her, and Corporate Gifting. Handpicked essentials for every occasion.",
  openGraph: {
    title: "Collections | ALL BLUE",
    description: "Explore our curated gift collections — handpicked essentials for every occasion.",
  },
}

export default function CollectionsPage() {
  return (
    <div className="max-w-[1920px] mx-auto">
      <Collections />
    </div>
  )
}
