import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = {
  title: "AegisVault — Crypto Asset Security & Scam Prevention",
  description:
    "Protect your crypto assets from phishing, flash-balance scams and seed-phrase theft. Verified wallet protection with human compliance review. We never ask for your recovery phrase.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="min-h-screen bg-ink antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0a101d",
              border: "1px solid rgba(148,186,255,0.14)",
              color: "#e7edf9",
            },
          }}
        />
      </body>
    </html>
  );
}
