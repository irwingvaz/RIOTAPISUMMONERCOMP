import "./globals.css";
import type { Metadata } from "next";
import { Cinzel_Decorative, Crimson_Pro } from "next/font/google";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import CustomCursor from "@/components/CustomCursor";

const cinzel = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const crimson = Crimson_Pro({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LoL Versus — Summoner Comparison",
  description: "Head-to-head League of Legends player analytics powered by the Riot API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimson.variable}`}>
      <body className="min-h-screen">
        <BackgroundCanvas />
        <CustomCursor />
        <div className="rift-vignette" aria-hidden="true" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
