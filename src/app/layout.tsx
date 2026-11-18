import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learned Today",
  description: "Fix broken systems on your phone and learn infrastructure, ML, AI and security, one incident at a time.",
  applicationName: "Learned Today",
  appleWebApp: {
    capable: true,
    title: "Learned Today",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f19",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
          {children}
        </main>
      </body>
    </html>
  );
}
