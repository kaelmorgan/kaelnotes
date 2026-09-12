import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  author,
  defaultSocialImage,
  ogLocale,
  siteDescription,
  siteName,
  siteUrl,
} from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-reading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    locale: ogLocale,
    title: siteName,
    description: siteDescription,
    images: [{ url: defaultSocialImage, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [defaultSocialImage],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Kael Notes",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: author.name,
  url: `${siteUrl}${author.url}`,
  image: `${siteUrl}${author.image}`,
  jobTitle: author.role,
  homeLocation: author.location,
  worksFor: {
    "@type": "Organization",
    name: "Kael Notes",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, personJsonLd]),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
