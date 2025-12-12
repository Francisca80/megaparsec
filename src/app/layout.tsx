import type { Metadata, Viewport } from "next";
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
  title: "Megaparsec - Cloud Engineering Consultancy",
  description: "Megaparsec is a consultancy company for Cloud Engineering. We advise our customers and deliver training on designing and building IT infrastructure in a cloud native way. Light Years Ahead.",
  keywords: ["cloud engineering", "AWS", "consultancy", "training", "architecture", "cloud native", "IT infrastructure"],
  authors: [{ name: "Megaparsec" }],
  openGraph: {
    title: "Megaparsec - Cloud Engineering Consultancy",
    description: "Light Years Ahead - Cloud Engineering Consultancy and Training",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Megaparsec - Cloud Engineering Consultancy",
    description: "Light Years Ahead - Cloud Engineering Consultancy and Training",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
