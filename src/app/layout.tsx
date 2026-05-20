import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL = "https://creatixreach.io";
const SITE_TITLE = "CreatixReach - We run the whole stack";
const SITE_DESC =
  "Digital solutions, built end-to-end. Websites, custom systems, predictive dialers, and cold-calling campaigns we actually run. US LLC serving US and European customers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | CreatixReach",
  },
  description: SITE_DESC,
  applicationName: "CreatixReach",
  authors: [{ name: "CreatixReach" }],
  creator: "CreatixReach",
  publisher: "CreatixReach",
  category: "Business Services",
  keywords: [
    "web design agency",
    "social media management",
    "custom software development",
    "API integrations",
    "workflow automation",
    "predictive dialer",
    "call center setup",
    "cold calling agency",
    "lead generation",
    "vicidial hosting",
  ],
  alternates: {
    canonical: SITE_URL + "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: SITE_URL + "/",
    siteName: "CreatixReach",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CreatixReach",
  url: SITE_URL,
  logo: SITE_URL + "/icon-512.png",
  description: SITE_DESC,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+1-323-297-8843",
      contactType: "sales",
      areaServed: ["US", "EU"],
      availableLanguage: ["English"],
    },
  ],
  sameAs: [] as string[],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
