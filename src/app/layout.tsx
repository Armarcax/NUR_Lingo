import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NUR Lingo — Հայկական AI Լեզվի Հարթակ",
  description: "AI-native Armenian ↔ English language learning. Semantic understanding, HAYQ tokens, Նուռ mascot.",
  keywords: ["Armenian","հայերեն","language learning","AI","HAYQ","NLP","Armenia"],
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "NUR Lingo",
    description: "Սովորիր հայերեն AI-ի հետ — semantic understanding, HAYQ reward system",
    images: ["/logo.png"],
    locale: "hy_AM",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Armenian:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-mono antialiased"
        style={{
          background: "url('/images/pomegranate-bg.jpg') no-repeat center center fixed",
          backgroundSize: "cover",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
