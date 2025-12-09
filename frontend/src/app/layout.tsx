import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "VN30-Quantum | AI Trading Dashboard",
  description: "AI-powered trading signals for Vietnamese VN30 stocks",
  keywords: ["VN30", "trading", "AI", "signals", "Vietnam", "stocks"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
