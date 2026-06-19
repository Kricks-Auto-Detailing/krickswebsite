import type { Metadata } from "next";
import { Rajdhani, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl, jsonLdScript, localBusinessJsonLd, localSeo, siteUrl, websiteJsonLd } from "@/lib/seo";
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
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mobile Car Detailing Decatur IN | Krick's Auto Detailing",
    template: "%s | Krick's Auto Detailing",
  },
  description:
    "Krick's Auto Detailing provides mobile car detailing near Decatur, IN. Interior details, maintenance details, truck/SUV detailing, semi cab detailing, trailer detailing, and powersport detailing within a 30-minute radius.",
  keywords: localSeo.primaryKeywords,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  category: "local business",
  openGraph: {
    title: "Mobile Car Detailing Decatur IN | Krick's Auto Detailing",
    description: "Mobile auto detailing for Decatur, Indiana and surrounding communities within roughly 30 minutes.",
    url: siteUrl,
    siteName: "Krick's Auto Detailing",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: absoluteUrl("/gallery/semi-cab-entry-after.jpg"),
        width: 1200,
        height: 900,
        alt: "Clean semi cab interior after Krick's Auto Detailing service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Car Detailing Decatur IN | Krick's Auto Detailing",
    description: "Mobile detailing for Decatur, Indiana cars, trucks, SUVs, semis, trailers, and powersport vehicles.",
    images: [absoluteUrl("/gallery/semi-cab-entry-after.jpg")],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript([localBusinessJsonLd(), websiteJsonLd()]),
          }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
