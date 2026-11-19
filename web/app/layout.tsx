import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/components/arc/foundation.css";
import "./globals.css";
import { lang } from "@/lib/i18n";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = { title: "Immo Watch", description: "Real-estate listing monitor" };

const theme = `document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={lang} className={geist.variable} data-accent="blue" data-arc-density="comfortable" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: theme }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
