import Script from "next/script";
import { preload } from "react-dom";
import Hero from "@/components/Hero";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function Home() {
  preload("/bg/onset-landscape.webp", {
    as: "image",
    type: "image/webp",
    media: "(min-width: 701px) and (min-aspect-ratio: 1/1)",
    fetchPriority: "high",
  });
  preload("/bg/onset-portrait.webp", {
    as: "image",
    type: "image/webp",
    media: "not all and (min-width: 701px) and (min-aspect-ratio: 1/1)",
    fetchPriority: "high",
  });
  return (
    <>
      {GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Onset",
            url: SITE_URL,
            logo: `${SITE_URL}/web-app-manifest-512x512.png`,
            description:
              "Onset is an upcoming film production marketplace to rent, buy, and sell gear, hire crew, and find filming locations.",
          }),
        }}
      />
      <Hero />
    </>
  );
}
