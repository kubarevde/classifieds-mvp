import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BuyerProvider } from "@/components/buyer/buyer-provider";
import { DemoRoleFloatingControl, DemoRoleProvider } from "@/components/demo-role/demo-role";
import { AppProviders } from "@/components/platform/app-providers";
import { AppShell } from "@/components/platform/app-shell";
import { ServiceWorkerRegister } from "@/components/platform/service-worker-register";
import { SubscriptionProvider } from "@/components/subscription/subscription-provider";
import { ToastProvider } from "@/components/ui/toast";
import { getSiteUrl } from "@/lib/seo/canonical";
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
  metadataBase: new URL(getSiteUrl()),
  title: "Classify - маркетплейс объявлений",
  description:
    "Современный MVP фронтенд сервиса объявлений с удобным поиском и чистым интерфейсом.",
  applicationName: "Classify",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Classify - маркетплейс объявлений",
    description: "Современный маркетплейс объявлений, запросов и магазинов.",
    url: "/",
    siteName: "Classify",
    images: [{ url: "/icons/icon-512.svg", width: 512, height: 512, alt: "Classify" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Classify - маркетплейс объявлений",
    description: "Современный маркетплейс объявлений, запросов и магазинов.",
    images: ["/icons/icon-512.svg"],
  },
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
          <SubscriptionProvider>
            <BuyerProvider>
              <AppProviders>
                <ToastProvider>
                  <AppShell>{children}</AppShell>
                  <ServiceWorkerRegister />
                  <DemoRoleFloatingControl />
                </ToastProvider>
              </AppProviders>
            </BuyerProvider>
          </SubscriptionProvider>
        </DemoRoleProvider>
      </body>
    </html>
  );
}
