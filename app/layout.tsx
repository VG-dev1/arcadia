import type { Metadata } from "next";
import { Geist, Geist_Mono, Cuprum } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { UserProfile } from "@/lib/UserProfile";
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
    google: "uTOvvZgIxWCZPNdoDdipI"
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
        <AuthProvider>
          {/* Top bar - global branding with user profile */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 48px",
              borderBottom: "1px solid #1a1a1a",
              backgroundColor: "#000",
              zIndex: 50,
            }}
          >
            <span
              style={{
                fontSize: "22px",
                letterSpacing: "3px",
                color: "#fff",
                textTransform: "uppercase",
                fontFamily: "var(--font-cuprum), sans-serif",
              }}
            >
              Arcadia
            </span>
            <UserProfile />
          </nav>

          {/* Page Content */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}