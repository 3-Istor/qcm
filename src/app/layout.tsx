import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: [ "latin" ] });

export const metadata: Metadata = {
  title: "3-Istor QCM | Active Recall",
  description: "Modern Anki-style QCM application for fast learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className={`${inter.className} h-full flex flex-col`}>
        <Providers>
          <Navbar />
          <div className="flex-1 w-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
