import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { AppBrandProvider } from "@/components/app-brand";
import { getAppName } from "@/lib/site-settings";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export async function generateMetadata(): Promise<Metadata> {
  const appName = await getAppName();
  return {
  title: `${appName} — Wallet Scam Protection & Crypto Safety`,
  description:
    "Learn to recognise wallet flashing, fake token balances, phishing, malicious approvals, address poisoning and recovery-phrase theft. Submit public wallet addresses for human review. Never share your recovery phrase or private keys.",
  };
}

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const appName = await getAppName();
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="min-h-screen bg-ink antialiased">
        <AppBrandProvider appName={appName}>{children}</AppBrandProvider>
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
