import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farness — Forecasting as a Harness",
  description:
    "Stop asking 'Is this good?' Start asking 'What will happen?' A framework for better decisions through explicit forecasting.",
  openGraph: {
    type: "website",
    title: "Farness — Forecasting as a Harness",
    description:
      "A framework for better decisions through explicit forecasting. Includes research paper on stability-under-probing methodology.",
    url: "https://farness.ai",
  },
  twitter: {
    card: "summary",
    title: "Farness — Forecasting as a Harness",
    description:
      "A framework for better decisions through explicit forecasting and calibration.",
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
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,300;1,6..72,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
