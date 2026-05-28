import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QrCode } from "lucide-react";
import { Noto_Sans_Thai } from "next/font/google";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-thai",
});

import { Navbar } from "@/components/navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={notoThai.variable}>
      <body className={notoThai.className}>
        {/* Global Tech Watermark */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden flex items-center justify-center select-none transform-gpu will-change-transform">
          <QrCode 
            size={800} 
            className="text-indigo-500/[0.2] rotate-[15deg] translate-x-1/4 translate-y-1/4" 
          />
        </div>

        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
