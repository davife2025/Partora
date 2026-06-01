import type { Metadata, Viewport } from "next";
import { ToastProvider }               from "@/components/ui/Toast";
import { ServiceWorkerRegistration }   from "@/components/ui/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title:       { default: "Partora", template: "%s | Partora" },
  description: "AI-powered voice parts and tonic solfa for singers and musicians.",
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:         true,
    statusBarStyle:  "black-translucent",
    title:           "Partora",
  },
  openGraph: {
    type:      "website",
    siteName:  "Partora",
    title:     "Partora — AI Voice Parts & Tonic Solfa",
    description: "Generate SATB voice parts and tonic solfa for any song instantly.",
  },
  twitter: {
    card:  "summary",
    title: "Partora",
    description: "AI-powered tonic solfa and SATB harmonisation for musicians.",
  },
  icons: {
    icon:  "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width:            "device-width",
  initialScale:     1,
  maximumScale:     1,
  userScalable:     false,
  themeColor:       "#0D0D14",
  viewportFit:      "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white overflow-x-hidden">
        <ToastProvider>
          {children}
        </ToastProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
