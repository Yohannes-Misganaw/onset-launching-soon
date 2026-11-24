import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const satoshi = localFont({
  variable: "--font-satoshi",
  src: "./fonts/satoshi-black.woff2",
  weight: "900",
  style: "normal",
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  preload: false,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "Onset is launching soon. Rent, buy, and sell film gear, hire crew, and find filming locations. Join the waitlist.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Onset | Launching Soon",
    template: "%s | Onset",
  },
  description: DESCRIPTION,
  applicationName: "Onset",
  appleWebApp: { title: "Onset" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Onset",
    title: "Onset | Launching Soon",
    description: DESCRIPTION,
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "Onset",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Onset | Launching Soon",
    description: DESCRIPTION,
    images: ["/web-app-manifest-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#08271e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${satoshi.variable} ${notoEthiopic.variable}`}>
      <body className="font-inter antialiased selection:bg-accent selection:text-accent-foreground">
        {children}
      </body>
    </html>
  );
}
