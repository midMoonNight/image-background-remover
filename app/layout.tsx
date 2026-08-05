import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.listingcut.shop"),
  title: "ListingCut — Batch Product Background Remover",
  description: "Turn product photos into clean white or transparent listing images in one batch.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-HHEFWPXLE9" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HHEFWPXLE9');
          `}
        </Script>
      </body>
    </html>
  );
}
