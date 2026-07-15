import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Clearcut — Batch Product Background Remover",
  description: "Turn product photos into clean white or transparent listing images in one batch.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
