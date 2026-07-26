import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { getAppUser } from "@/app/actions";
import { AppChrome } from "@/components/app-chrome";
import { getActiveUserId } from "@/lib/active-user";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calorie Tracker",
  description: "Track daily calories, macros, and vitamins",
  appleWebApp: {
    capable: true,
    title: "Calories",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeUserId = await getActiveUserId();
  const activeUser = activeUserId ? await getAppUser(activeUserId) : null;

  return (
    <html lang="en" className={`${geist.variable} min-h-dvh bg-black antialiased`}>
      <body className="min-h-dvh bg-black font-sans text-zinc-100">
        <AppChrome activeUser={activeUser} />
        <div className="min-h-dvh bg-black">{children}</div>
      </body>
    </html>
  );
}
