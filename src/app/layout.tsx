import type { Metadata } from "next";
import { Rajdhani, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Krick's Auto Detailing | Mobile Detailing in Decatur, Indiana",
    template: "%s | Krick's Auto Detailing",
  },
  description:
    "Premium mobile auto detailing for Decatur, Indiana and surrounding areas within 30 minutes. Standard details, powersport detailing, trailer detailing, semi cab detailing, and hauler detailing.",
  keywords: [
    "Krick's Auto Detailing",
    "Decatur Indiana auto detailing",
    "mobile detailing",
    "car detailing",
    "truck detailing",
    "semi cab detailing",
  ],
  openGraph: {
    title: "Krick's Auto Detailing",
    description: "Premium mobile detailing in Decatur, Indiana and surrounding areas.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#050505] text-white">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
