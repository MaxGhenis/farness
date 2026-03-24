import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farness — Decision Optics for AI",
  description:
    "Make your agent forecast the decision. A decision framework for Codex, Claude Code, and other agents, with native skill and MCP support.",
  openGraph: {
    type: "website",
    title: "Farness — Decision Optics for AI",
    description:
      "A decision framework for Codex, Claude Code, and other agents with native skill and MCP support, plus explicit KPIs, numeric forecasts, reference classes, disconfirming evidence, and review dates.",
    url: "https://farness.ai",
  },
  twitter: {
    card: "summary",
    title: "Farness — Decision Optics for AI",
    description:
      "Make your agent forecast the decision with native Codex skill and MCP support, plus Claude Code and CLI workflows.",
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
