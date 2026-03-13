import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PropManage — Your Properties. Always in Order.",
  description:
    "AI-powered property management platform for landlords. Manage properties, documents, tenants, and rent — all in one place.",
  keywords: [
    "property management",
    "landlord",
    "rent tracking",
    "document vault",
    "AI agent",
    "tenant management",
  ],
  authors: [{ name: "PropManage" }],
  openGraph: {
    title: "PropManage — Your Properties. Always in Order.",
    description:
      "AI-powered property management platform for landlords. Manage properties, documents, tenants, and rent — all in one place.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B4FD8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
