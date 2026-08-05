import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "Etsy Listing Photo Background Remover | ListingCut",
  description: "Create cleaner Etsy listing photos with white or transparent background exports, then keep a consistent visual style across your shop.",
  alternates: { canonical: "/etsy-listing-photo-background-remover" },
};

export default function EtsyListingPhotoBackgroundRemoverPage() {
  return <SeoLandingPage eyebrow="Etsy shop workflow" title="Make Etsy product photos easier to compare." description="Remove a distracting background, keep the product clear, and create reusable transparent cutouts for shop graphics and listing photos." platform="Etsy" whiteBackground="A neutral white background can make the product shape and color easier to read, especially when your shop uses a consistent catalog style." transparentBackground="A reusable transparent cutout gives you flexibility for listing graphics, seasonal banners, and branded layouts created outside ListingCut." guidance={["Lead with a clear product view and use additional photos to show scale, texture, or real-world use.", "Keep lighting, crop, and background treatment consistent across a collection.", "Use your own shop style and verify Etsy's current image guidance before publishing."]} batchNote="Process a product collection together when you want your storefront to feel cohesive. The same white or transparent treatment can make individual listings look like one shop." />;
}
