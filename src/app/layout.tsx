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
  title: "Viralyze — AI-Powered Viral Content Predictor",
  description: "Know what will go viral before you post. AI-powered content intelligence that analyzes your ideas and existing posts, predicts viral potential, and tells you exactly what to improve.",
  keywords: ["viral content", "content prediction", "AI analytics", "social media", "content strategy", "viralyze"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔮</text></svg>",
  },
  openGraph: {
    title: "Viralyze — Predict What Goes Viral",
    description: "AI-powered content intelligence for creators and brands.",
    type: "website",
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
