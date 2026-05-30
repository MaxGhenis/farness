import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brier — Open Forecast Prototype",
  description:
    "Open forecast cells for public policy, tax, benefit, poverty, and government data, with agent reasoning traces and calibrated uncertainty.",
  openGraph: {
    type: "website",
    title: "Brier — Open Forecast Prototype",
    description:
      "Open forecast cells for public policy, tax, benefit, poverty, and government data, with agent reasoning traces and calibrated uncertainty.",
    url: "https://brieralmanac.org",
    siteName: "brier",
    images: [
      {
        url: "https://brieralmanac.org/og-image.png",
        width: 1200,
        height: 630,
        alt: "Brier — open forecast prototype for public policy and government data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brier — Open Forecast Prototype",
    description:
      "Open forecast cells for public policy, tax, benefit, poverty, and government data.",
    images: ["https://brieralmanac.org/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
