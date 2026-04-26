import "./globals.css";
import type { Metadata } from "next";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "LoL Versus — Summoner Comparison",
  description: "Head-to-head League of Legends player analytics powered by the Riot API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ fontFamily: '"Crimson Pro", Georgia, serif' }}>
        <BackgroundCanvas />
        <CustomCursor />
        {/* viewport vignette */}
        <div className="rift-vignette" aria-hidden="true" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
