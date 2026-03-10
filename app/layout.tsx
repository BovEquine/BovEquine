import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppProvider } from "@/components/AppProvider";

export const metadata: Metadata = {
  title: "BovEquine – AI Horse Health Monitor",
  description: "AI-powered equine health monitoring and management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased bg-stone-50 min-h-screen">
        <AppProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
