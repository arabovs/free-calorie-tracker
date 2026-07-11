import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calorie Tracker",
  description: "Track daily calories, macros, and vitamins",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} min-h-dvh bg-black antialiased`}>
      <body className="min-h-dvh bg-black font-sans text-zinc-100">
        <AppNav />
        <div className="min-h-dvh bg-black">{children}</div>
      </body>
    </html>
  );
}
