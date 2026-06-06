import type { Metadata } from "next";
import { Geist, Geist_Mono, Cuprum } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cuprum = Cuprum({
  variable: "--font-cuprum",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arcadia | 24-Hour Circular Day Planner",
    template: "%s | Arcadia"
  },
  description: "A circular planner app that maps your schedule directly onto a 24-hour clock face. Built for people who struggle with text-heavy lists, time blindness, or need a visual ADHD planner.",
  verification: {
    google: "uTOvvZgIxWCZPNdoDdipI_vEzWJTg1cSJzXlel6UkJk"
  },
  metadataBase: new URL("https://arcadia.vercel.app"),
  alternates: {
    canonical: "https://arcadia.vercel.app",
  },
  openGraph: {
    title: "Arcadia | 24-Hour Circular Day Planner",
    description: "See your calendar as blocks of color around a clock face instead of a standard checklist. Built for visual time tracking.",
    url: "https://arcadia.vercel.app",
    siteName: "Arcadia",
    locale: "en_US",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
      style={{ backgroundColor: "#0B0F1A" }}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3QPJ8PFKXG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-3QPJ8PFKXG');
          `}
        </Script>

        <AuthProvider>
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}