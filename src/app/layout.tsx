import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NUR Lingo — AI Language Learning",
  description: "Learn Armenian, English, Russian with AI semantic understanding and HAYQ rewards.",
  keywords: ["Armenian","հայerен","language learning","AI","HAYQ","multilingual"],
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "NUR Lingo",
    description: "AI-native multilingual platform — Armenian · English · Russian",
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
      <body className="font-mono antialiased" style={{ background: "var(--color-bg)" }}>
        {children}
      </body>
    </html>
  );
}
