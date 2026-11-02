import type { Metadata, Viewport } from "next";
import { Archivo, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted at build time: no request to Google, no layout shift.
const display = Archivo({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const score = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-score" });

const title = "Matchday Calls — Champions League Predictions";
const description =
  "Predict every Champions League score, earn points when you're right, and beat your friends in a private league.";

export const metadata: Metadata = {
  title: { default: title, template: "%s · Matchday Calls" },
  description,
  applicationName: "Matchday Calls",
  openGraph: { title, description, type: "website", siteName: "Matchday Calls" },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${score.variable}`}>
      <body className="antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
