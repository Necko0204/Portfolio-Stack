import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Marc Mendoza — Full-stack developer & digital builder",
  description:
    "Creative interfaces, reliable systems, and live digital products by Marc Mendoza.",
  openGraph: {
    title: "Marc Mendoza — Full-stack developer who ships real work",
    description:
      "Eight live products across client systems, independent builds, and focused one-pagers.",
    images: [{ url: "/og.png", width: 1680, height: 945, alt: "Marc Mendoza portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marc Mendoza — Full-stack developer who ships real work",
    description: "Eight live products and counting.",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
