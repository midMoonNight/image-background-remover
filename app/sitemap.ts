import type { MetadataRoute } from "next";

const siteUrl = "https://www.listingcut.shop";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/amazon-product-image-background-remover`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/etsy-listing-photo-background-remover`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/shopify-product-photo-background-remover`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/batch-product-background-remover`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
