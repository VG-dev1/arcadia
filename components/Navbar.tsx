"use client";

import { useRouter } from "next/navigation";
import { UserProfile } from "@/lib/UserProfile";

export function Navbar() {
  const router = useRouter();

  return (
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
      
      <div style={{ display: "flex", gap: "50px" }}>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontFamily: "var(--font-cuprum), sans-serif" }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => router.push('/insights')}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontFamily: "var(--font-cuprum), sans-serif" }}
        >
          Insights
        </button>
      </div>

      <UserProfile />
    </nav>
  );
}