import type { Metadata, Viewport } from "next";
import { Archivo, Inter, Space_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time: no request to Google, no layout shift.
const archivo = Archivo({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-archivo" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

const title = "Matchday Calls — Champions League Predictions";
const description =
  "Predict every Champions League score, earn points when you're right, and beat your friends in a private league.";

export const metadata: Metadata = {
  // Next.js adds the base path to generated asset URLs itself, so the
  // metadata base is the bare origin and page URLs are spelled out in full.
  metadataBase: new URL(new URL(siteUrl).origin),
  title: { default: title, template: "%s · Matchday Calls" },
  description,
  applicationName: "Matchday Calls",
  alternates: { canonical: `${siteUrl}/` },
  openGraph: { title, description, type: "website", siteName: "Matchday Calls", url: `${siteUrl}/`, locale: "en_GB" },
  twitter: { card: "summary_large_image", title, description },
  appleWebApp: { capable: true, title: "Matchday Calls", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
