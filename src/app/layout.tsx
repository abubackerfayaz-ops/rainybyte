import type { Metadata, Viewport } from "next";
import { Sora, Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth-context";
import { UnitProvider } from "@/lib/unit-context";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-number",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rainy Byte — AI Weather & Climate Intelligence Platform",
    template: "%s | Rainy Byte",
  },
  description:
    "The world's most accurate AI-powered weather and climate intelligence platform. Multi-model forecasts, AI analysis, interactive maps, and climate analytics for any location on Earth.",
  keywords: [
    "weather",
    "AI weather",
    "forecast",
    "climate intelligence",
    "ECMWF",
    "GFS",
    "weather radar",
    "rain forecast",
    "temperature",
    "climate change",
    "Köppen classification",
  ],
  authors: [{ name: "Rainy Byte" }],
  creator: "Rainy Byte",
  publisher: "Rainy Byte",
  metadataBase: new URL("https://rainybyte.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Rainy Byte",
    title: "Rainy Byte — AI Weather & Climate Intelligence",
    description:
      "Aggregates global weather datasets, calculates Köppen-Geiger classifications, and models local weather anomalies using Cognitive AI.",
    url: "https://rainybyte.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rainy Byte — AI Weather & Climate Intelligence",
    description:
      "The world's most accurate AI-powered weather and climate intelligence platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F4C81",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="dns-prefetch" href="https://api.open-meteo.com" />
        <link rel="preconnect" href="https://geocoding-api.open-meteo.com" />
        <link rel="dns-prefetch" href="https://geocoding-api.open-meteo.com" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider><UnitProvider>{children}</UnitProvider></AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
