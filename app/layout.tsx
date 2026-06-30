import type { Metadata } from "next";
import { Instrument_Sans, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Sans-serif premium y minimalista para títulos.
const display = Instrument_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Flare OS",
  description: "Your creative command center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark ${display.variable} ${hanken.variable} ${jetbrains.variable} h-full antialiased`}
      style={{
        ["--font-sans" as string]: "var(--font-hanken)",
        ["--font-geist-mono" as string]: "var(--font-jetbrains)",
      }}
    >
      <body className="h-full">
        <TooltipProvider delay={150}>{children}</TooltipProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
