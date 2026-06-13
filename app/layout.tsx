import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
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
      className={`dark ${bricolage.variable} ${hanken.variable} ${jetbrains.variable} h-full antialiased`}
      style={{
        ["--font-sans" as string]: "var(--font-hanken)",
        ["--font-geist-mono" as string]: "var(--font-jetbrains)",
      }}
    >
      <body className="h-full">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
