import type React from "react";
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// const _geist = Geist({ subsets: ["latin"] })
// const _geistMono = Geist_Mono({ subsets: ["latin"] })

// <CHANGE> Updated metadata for Naija NewsHub
export const metadata: Metadata = {
  title: "Naija NewsHub - Latest Nigerian & World News",
  description:
    "Stay informed with the latest news from Nigeria and around the world. Get breaking news, business, technology, sports, and more.",
  generator: "v0.app",
  keywords: [
    "Nigeria news",
    "world news",
    "breaking news",
    "headlines",
    "Naija",
  ],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
