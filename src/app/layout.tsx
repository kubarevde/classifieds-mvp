import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { FavoritesProvider } from "@/components/favorites/favorites-provider";
import { NotificationsProvider } from "@/components/notifications/notifications-provider";
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
        <FavoritesProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
