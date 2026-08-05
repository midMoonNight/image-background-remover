import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "Amazon Product Image Background Remover | ListingCut",
  description: "Prepare consistent white or transparent product images for your Amazon listing workflow with ListingCut's batch background remover.",
  alternates: { canonical: "/amazon-product-image-background-remover" },
};

export default function AmazonProductImageBackgroundRemoverPage() {
  return <SeoLandingPage eyebrow="Amazon listing workflow" title="Prepare cleaner Amazon product images." description="Remove distracting backgrounds in batches, review every edge, and export consistent product photos before you build or refresh an Amazon listing." platform="Amazon" whiteBackground="A clean white canvas is a practical starting point for main product-image workflows. Check Amazon's current category requirements before publishing." transparentBackground="Useful for product cutouts you want to reuse in secondary images, comparison graphics, or other design work before listing." guidance={["Use a clear, product-first image and review the subject edge at full size.", "Keep the same crop, padding, and background treatment across related variants.", "Treat marketplace presets as workflow aids, then confirm current Amazon category rules before upload."]} batchNote="For a catalog refresh, process similar SKUs together so your main images use a consistent visual system. You can download the completed results as a ZIP from your browser." />;
}
