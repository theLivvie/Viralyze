import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://viralyze.com'),
  title: "Viralyze — AI-Powered Viral Content Predictor",
  description: "Know what will go viral before you post. AI-powered content intelligence that analyzes your ideas and existing posts, predicts viral potential, and tells you exactly what to improve.",
  keywords: ["viral content", "content prediction", "AI analytics", "social media", "content strategy", "viralyze"],
  icons: {
    icon: '/favicon.ico',
    apple: '/viralyze_logo.png',
  },
  openGraph: {
    title: "Viralyze — Predict What Goes Viral",
    description: "AI-powered content intelligence for creators and brands. Know what will go viral before you post.",
    type: "website",
    siteName: "Viralyze",
    url: "https://viralyze.com",
    images: [{
      url: "/viralyze_logo.png",
      width: 1200,
      height: 630,
      alt: "Viralyze — AI-Powered Viral Content Predictor",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viralyze — Predict What Goes Viral",
    description: "AI-powered content intelligence for creators and brands.",
    site: "@viralyze",
    images: ["/viralyze_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-viralyze-black text-viralyze-white`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#121214',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#FAFAF9',
            },
          }}
        />
      </body>
    </html>
  );
}
