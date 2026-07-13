import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

const APP_URL = "https://courier-dash-gamma.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "CourierDash — Smart dashboard for couriers",
    template: "%s | CourierDash",
  },
  description:
    "The ultimate professional tool for couriers and delivery drivers. Track your real net income, analyze statistics, plan taxes, and manage vehicle depreciation all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "CourierDash",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "CourierDash — Smart dashboard for couriers",
    description:
      "The ultimate professional tool for couriers and delivery drivers. Track your real net income, analyze statistics, plan taxes, and manage vehicle depreciation all in one place.",
    url: APP_URL,
    siteName: "CourierDash",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${APP_URL}/opengraph-image.png`, // Оце робить магію (абсолютний шлях)
        width: 1200,
        height: 630,
        alt: "CourierDash — Manage your income like a true pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CourierDash — Smart dashboard for couriers",
    description:
      "The ultimate professional tool for couriers and delivery drivers. Track your real net income, analyze statistics, plan taxes, and manage vehicle depreciation all in one place.",
    images: [`${APP_URL}/opengraph-image.png`], // І тут теж
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}