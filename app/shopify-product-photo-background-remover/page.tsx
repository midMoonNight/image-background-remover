import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "Shopify Product Photo Background Remover | ListingCut",
  description: "Batch-remove product photo backgrounds for Shopify, then export consistent white or transparent images for your storefront workflow.",
  alternates: { canonical: "/shopify-product-photo-background-remover" },
};

export default function ShopifyProductPhotoBackgroundRemoverPage() {
  return <SeoLandingPage eyebrow="Shopify storefront workflow" title="Standardize product photos for your Shopify store." description="Use a consistent background and canvas treatment across new arrivals, product variants, and catalog refreshes without storing your photos on ListingCut." platform="Shopify" whiteBackground="White backgrounds can keep product cards focused and consistent when your storefront design needs a clean catalog look." transparentBackground="Transparent PNGs can be useful when your theme or creative workflow places products on brand-colored sections, campaigns, or custom layouts." guidance={["Choose a consistent crop and padding so products align cleanly in collection grids.", "Export white or transparent images based on your theme and merchandising workflow.", "Review image sharpness, edge quality, and mobile presentation before publishing products."]} batchNote="When a collection has many variants, standardize the whole group in one session. It reduces visual drift between product cards and keeps future catalog edits easier." />;
}
