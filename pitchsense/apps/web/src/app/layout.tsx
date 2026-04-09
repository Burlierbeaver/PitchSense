import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PitchSense — AI Investor Feedback",
  description:
    "Upload your pitch deck or record yourself pitching. Get scored, grilled, and ready before you walk into the room.",
  openGraph: {
    title: "PitchSense",
    description: "AI-powered startup pitch feedback and investor simulation.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="bg-gray-50 text-gray-900 antialiased">
          {children}
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
