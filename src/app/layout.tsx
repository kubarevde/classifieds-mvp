import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BuyerProvider } from "@/components/buyer/buyer-provider";
import { DemoRoleFloatingControl, DemoRoleProvider } from "@/components/demo-role/demo-role";
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
  title: "Classify - маркетплейс объявлений",
  description:
    "Современный MVP фронтенд сервиса объявлений с удобным поиском и чистым интерфейсом.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <DemoRoleProvider>
          <BuyerProvider>
            {children}
            <DemoRoleFloatingControl />
          </BuyerProvider>
        </DemoRoleProvider>
      </body>
    </html>
  );
}
