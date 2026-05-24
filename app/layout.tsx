import type { Metadata } from "next";
import { Geist, Geist_Mono, Cuprum } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/AuthContext";
import { Navbar } from "@/components/Navbar";
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
  title: "Arcadia",
  description: "Advanced Time Tracking System",
  verification: {
    google: "uTOvvZgIxWCZPNdoDdipI_vEzWJTg1cSJzXlel6UkJk"
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
      className={`${cuprum.variable} h-full antialiased`}
      style={{ backgroundColor: "#000" }}
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
          {/* Top bar component decoupled safely */}
          <Navbar />

          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}