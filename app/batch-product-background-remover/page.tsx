import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "Batch Product Background Remover | ListingCut",
  description: "Remove product photo backgrounds in batches of up to 20 images, standardize white or transparent output, and download a browser-generated ZIP.",
  alternates: { canonical: "/batch-product-background-remover" },
};

export default function BatchProductBackgroundRemoverPage() {
  return <SeoLandingPage eyebrow="Batch listing-image workflow" title="Remove product backgrounds in one focused batch." description="Upload up to 20 product photos, apply one repeatable output treatment, review the results, and export them without building an image history on ListingCut." platform="your catalog" whiteBackground="White output gives a uniform starting point for catalog cards, product feeds, and marketplaces that use a clean product-first presentation." transparentBackground="Transparent output lets you keep a clean cutout for reuse in multiple storefronts, ads, or design compositions." guidance={["Group similar product photos together so one output choice fits the whole batch.", "Only successful background removals use an image credit; failed requests do not.", "Reformatting an already completed image in your browser does not spend another credit."]} batchNote="A batch is most useful when you are preparing a collection, supplier delivery, or catalog update. Keep original image files locally and use ListingCut for the active processing session." />;
}
